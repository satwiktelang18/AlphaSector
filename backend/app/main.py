import json
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import pandas as pd
from pathlib import Path

from app.ml.predict import predict_sector, predict_stock, SECTORS
from app.ml.fetch_data import SECTOR_STOCKS
from app.database import init_db, get_db, PredictionLog

PROCESSED_DIR = Path(__file__).resolve().parent.parent / "data" / "processed"
STOCK_DIR = Path(__file__).resolve().parent.parent / "data" / "raw" / "stocks"
MODELS_DIR = Path(__file__).resolve().parent.parent / "models"


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(title="StockSense API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"message": "StockSense API is running"}


@app.get("/api/sectors")
def list_sectors():
    return {"sectors": SECTORS}


@app.get("/api/predict/{sector}")
def get_prediction(sector: str, db: Session = Depends(get_db)):
    sector = sector.upper()
    if sector not in SECTORS:
        raise HTTPException(status_code=404, detail=f"Unknown sector '{sector}'. Valid: {SECTORS}")
    try:
        result = predict_sector(sector)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail=f"No processed data found for {sector}")

    # Only log a new row if this is a genuinely new prediction (different as_of_date),
    # not a duplicate from re-visiting the dashboard.
    last_log = (
        db.query(PredictionLog)
        .filter(PredictionLog.sector == result["sector"])
        .order_by(PredictionLog.created_at.desc())
        .first()
    )
    if not last_log or last_log.as_of_date != result["as_of_date"]:
        db.add(PredictionLog(
            sector=result["sector"],
            as_of_date=result["as_of_date"],
            growth_probability=result["growth_probability"],
            prediction=result["prediction"],
        ))
        db.commit()

    return result


@app.get("/api/predictions/history")
def prediction_history(sector: str = None, limit: int = 50, db: Session = Depends(get_db)):
    query = db.query(PredictionLog)
    if sector:
        query = query.filter(PredictionLog.sector == sector.upper())
    logs = query.order_by(PredictionLog.created_at.desc()).limit(limit).all()
    return [
        {
            "id": log.id,
            "sector": log.sector,
            "as_of_date": log.as_of_date,
            "growth_probability": log.growth_probability,
            "prediction": log.prediction,
            "logged_at": log.created_at.isoformat(),
        }
        for log in logs
    ]


@app.get("/api/history/{sector}")
def get_history(sector: str, days: int = 180):
    sector = sector.upper()
    if sector not in SECTORS:
        raise HTTPException(status_code=404, detail=f"Unknown sector '{sector}'. Valid: {SECTORS}")
    path = PROCESSED_DIR / f"{sector.lower()}_features.csv"
    if not path.exists():
        raise HTTPException(status_code=404, detail=f"No data found for {sector}")

    df = pd.read_csv(path, parse_dates=["Date"])
    df = df.tail(days)
    display_cols = ["Date", "Open", "High", "Low", "Close", "Volume", "RSI_14", "SMA_20", "SMA_50", "MACD", "BB_High", "BB_Low"]
    available_cols = [c for c in display_cols if c in df.columns]
    result = df[available_cols].copy()
    result["Date"] = result["Date"].dt.strftime("%Y-%m-%d")
    return result.to_dict(orient="records")


def _sector_summary(sector: str) -> dict:
    pred = predict_sector(sector)
    df = pd.read_csv(PROCESSED_DIR / f"{sector.lower()}_features.csv", parse_dates=["Date"])
    latest = df.iloc[-1]
    month_ago = df.iloc[-22] if len(df) > 22 else df.iloc[0]
    return_30d = (latest["Close"] - month_ago["Close"]) / month_ago["Close"] * 100
    return {
        "sector": sector,
        "growth_probability": pred["growth_probability"],
        "prediction": pred["prediction"],
        "return_30d_pct": round(float(return_30d), 2),
        "rsi": round(float(latest["RSI_14"]), 2),
        "volatility": round(float(latest["Volatility_20"]), 4),
    }


@app.get("/api/compare")
def compare_sectors(sector_a: str, sector_b: str):
    sector_a, sector_b = sector_a.upper(), sector_b.upper()
    for s in (sector_a, sector_b):
        if s not in SECTORS:
            raise HTTPException(status_code=404, detail=f"Unknown sector '{s}'. Valid: {SECTORS}")
    return {"sector_a": _sector_summary(sector_a), "sector_b": _sector_summary(sector_b)}


@app.get("/api/top-stocks/{sector}")
def top_stocks(sector: str, limit: int = 5):
    sector = sector.upper()
    if sector not in SECTOR_STOCKS:
        raise HTTPException(status_code=404, detail=f"Unknown sector '{sector}'. Valid: {list(SECTOR_STOCKS.keys())}")

    results = []
    for ticker in SECTOR_STOCKS[sector]:
        safe_name = ticker.replace(".", "_").replace("&", "and")
        path = STOCK_DIR / f"{safe_name}.csv"
        if not path.exists():
            continue
        df = pd.read_csv(path, parse_dates=["Date"])
        if len(df) < 22:
            continue
        latest_close = df["Close"].iloc[-1]
        month_ago_close = df["Close"].iloc[-22]
        return_30d = (latest_close - month_ago_close) / month_ago_close * 100
        results.append({
            "ticker": ticker,
            "latest_close": round(float(latest_close), 2),
            "return_30d_pct": round(float(return_30d), 2),
        })

    results.sort(key=lambda x: x["return_30d_pct"], reverse=True)
    return {"sector": sector, "top_stocks": results[:limit]}


@app.get("/api/model-performance")
def model_performance():
    metrics_path = MODELS_DIR / "metrics.json"
    importance_path = MODELS_DIR / "feature_importance.csv"
    if not metrics_path.exists():
        raise HTTPException(status_code=404, detail="No metrics found. Run train_model.py first.")

    with open(metrics_path) as f:
        metrics = json.load(f)

    feature_importance = []
    if importance_path.exists():
        imp_df = pd.read_csv(importance_path)
        feature_importance = imp_df.head(12).to_dict(orient="records")

    return {**metrics, "feature_importance": feature_importance}


@app.get("/api/stock/{ticker}")
def get_stock_prediction(ticker: str):
    try:
        return predict_stock(ticker)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
