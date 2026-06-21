import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

import joblib
import pandas as pd
import shap
import yfinance as yf

from app.ml.feature_engineering import engineer_features
from app.ml.fetch_data import SECTOR_STOCKS

MODELS_DIR = Path(__file__).resolve().parents[2] / "models"
PROCESSED_DIR = Path(__file__).resolve().parents[2] / "data" / "processed"
STOCK_PROCESSED_DIR = PROCESSED_DIR / "stocks"

model = joblib.load(MODELS_DIR / "xgboost_model.pkl")
feature_cols = joblib.load(MODELS_DIR / "feature_columns.pkl")
explainer = shap.TreeExplainer(model)

SECTORS = ["IT", "BANKING", "PHARMA", "AUTO", "FMCG", "ENERGY", "METAL"]
TICKER_SECTOR = {ticker: sector for sector, tickers in SECTOR_STOCKS.items() for ticker in tickers}


def classify_prediction(proba: float) -> str:
    if proba >= 0.6:
        return "BUY"
    if proba >= 0.35:
        return "HOLD"
    return "SELL"


def _attach_sector_dummies(row: pd.DataFrame, sector):
    for col in feature_cols:
        if col.startswith("Sector_"):
            row[col] = 1 if (sector and col == f"Sector_{sector}") else 0
    return row


def build_sector_feature_row(sector: str):
    sector = sector.upper()
    df = pd.read_csv(PROCESSED_DIR / f"{sector.lower()}_features.csv", parse_dates=["Date"])
    latest = _attach_sector_dummies(df.iloc[[-1]].copy(), sector)
    return latest[feature_cols], latest["Date"].values[0]


def build_stock_feature_row(ticker: str):
    ticker = ticker.upper()
    if not ticker.endswith(".NS"):
        ticker = f"{ticker}.NS"
    sector = TICKER_SECTOR.get(ticker)

    safe_name = ticker.replace(".", "_").replace("&", "and")
    cached_path = STOCK_PROCESSED_DIR / f"{safe_name}_features.csv"

    if cached_path.exists():
        df = pd.read_csv(cached_path, parse_dates=["Date"])
    else:
        raw = yf.Ticker(ticker).history(period="2y", interval="1d")
        if raw.empty:
            raise ValueError(f"No data found for '{ticker}'. Check the symbol (e.g. 'TCS.NS', 'ZOMATO.NS').")
        raw = raw.reset_index()
        raw["Date"] = pd.to_datetime(raw["Date"]).dt.tz_localize(None)
        df = engineer_features(raw)
        if df.empty:
            raise ValueError(f"Not enough trading history for '{ticker}' to compute indicators yet.")

    latest = _attach_sector_dummies(df.iloc[[-1]].copy(), sector)
    return latest[feature_cols], latest["Date"].values[0], sector, ticker


def _shap_top_features(row: pd.DataFrame, n: int = 5):
    shap_values = explainer.shap_values(row)
    contributions = pd.Series(shap_values[0], index=feature_cols).sort_values(key=abs, ascending=False)
    return [{"feature": f, "impact": round(float(v), 4)} for f, v in contributions.head(n).items()]


def predict_sector(sector: str) -> dict:
    row, date = build_sector_feature_row(sector)
    proba = float(model.predict_proba(row)[0, 1])
    return {
        "sector": sector.upper(),
        "as_of_date": str(date)[:10],
        "growth_probability": round(proba * 100, 2),
        "prediction": classify_prediction(proba),
        "top_features": _shap_top_features(row),
    }


def predict_stock(ticker: str) -> dict:
    row, date, sector, resolved_ticker = build_stock_feature_row(ticker)
    proba = float(model.predict_proba(row)[0, 1])
    return {
        "ticker": resolved_ticker,
        "sector": sector,
        "as_of_date": str(date)[:10],
        "growth_probability": round(proba * 100, 2),
        "prediction": classify_prediction(proba),
        "top_features": _shap_top_features(row),
    }


if __name__ == "__main__":
    arg = sys.argv[1] if len(sys.argv) > 1 else "IT"
    if arg.upper() in SECTORS:
        result = predict_sector(arg)
        label = result["sector"]
    else:
        result = predict_stock(arg)
        label = f"{result['ticker']} ({result['sector'] or 'sector unclassified'})"

    print(f"\n{label}  (as of {result['as_of_date']})")
    print(f"Growth Probability (next 30 days, >5% return): {result['growth_probability']}%")
    print(f"Prediction: {result['prediction']}")
    print("\nTop Contributing Features:")
    for item in result["top_features"]:
        direction = "pushes UP" if item["impact"] > 0 else "pushes DOWN"
        print(f"  {item['feature']}: {direction}  (impact: {item['impact']})")
