import time
import pandas as pd
import yfinance as yf
from pathlib import Path

SECTOR_STOCKS = {
    "IT": ["TCS.NS", "INFY.NS", "HCLTECH.NS", "WIPRO.NS", "TECHM.NS"],
    "BANKING": ["HDFCBANK.NS", "ICICIBANK.NS", "SBIN.NS", "KOTAKBANK.NS", "AXISBANK.NS"],
    "PHARMA": ["SUNPHARMA.NS", "DRREDDY.NS", "CIPLA.NS", "DIVISLAB.NS", "LUPIN.NS"],
    "AUTO": ["MARUTI.NS", "TATAMOTORS.NS", "M&M.NS", "BAJAJ-AUTO.NS", "EICHERMOT.NS"],
    "FMCG": ["HINDUNILVR.NS", "ITC.NS", "NESTLEIND.NS", "BRITANNIA.NS", "DABUR.NS"],
    "ENERGY": ["RELIANCE.NS", "ONGC.NS", "NTPC.NS", "POWERGRID.NS", "BPCL.NS"],
    "METAL": ["TATASTEEL.NS", "JSWSTEEL.NS", "HINDALCO.NS", "VEDL.NS", "JINDALSTEL.NS"],
}

BASE_DIR = Path(__file__).resolve().parents[2]
STOCK_DIR = BASE_DIR / "data" / "raw" / "stocks"
SECTOR_DIR = BASE_DIR / "data" / "raw"
STOCK_DIR.mkdir(parents=True, exist_ok=True)
SECTOR_DIR.mkdir(parents=True, exist_ok=True)


def fetch_stock(ticker: str, period: str = "5y") -> pd.DataFrame:
    df = yf.Ticker(ticker).history(period=period, interval="1d")
    df.reset_index(inplace=True)
    return df


def build_sector_index(sector: str, tickers: list, period: str = "5y") -> pd.DataFrame:
    frames = []
    for ticker in tickers:
        print(f"  Fetching {ticker}...")
        df = fetch_stock(ticker, period)
        if df.empty:
            print(f"    WARNING: no data for {ticker}, skipping.")
            continue

        df["Date"] = pd.to_datetime(df["Date"]).dt.tz_localize(None)
        safe_name = ticker.replace(".", "_").replace("&", "and")
        df[["Date", "Open", "High", "Low", "Close", "Volume"]].to_csv(
            STOCK_DIR / f"{safe_name}.csv", index=False
        )

        # Scale this stock's O/H/L/C to start at 100, so it contributes
        # proportionally regardless of its raw share price.
        base = df["Close"].iloc[0]
        scaled = df[["Date"]].copy()
        scaled["Open"] = df["Open"] / base * 100
        scaled["High"] = df["High"] / base * 100
        scaled["Low"] = df["Low"] / base * 100
        scaled["Close"] = df["Close"] / base * 100
        scaled["Volume"] = df["Volume"]
        frames.append(scaled)
        time.sleep(1)  # be polite to Yahoo

    if not frames:
        return pd.DataFrame()

    stacked = pd.concat(frames, axis=0)
    sector_df = stacked.groupby("Date").agg(
        Open=("Open", "mean"),
        High=("High", "mean"),
        Low=("Low", "mean"),
        Close=("Close", "mean"),
        Volume=("Volume", "sum"),
    ).reset_index()
    return sector_df


def fetch_all_sectors(period: str = "5y") -> None:
    for sector, tickers in SECTOR_STOCKS.items():
        print(f"Building sector index for {sector}...")
        sector_df = build_sector_index(sector, tickers, period)
        if sector_df.empty:
            print(f"  WARNING: could not build index for {sector}.")
            continue
        out_path = SECTOR_DIR / f"{sector.lower()}.csv"
        sector_df.to_csv(out_path, index=False)
        print(f"  Saved {len(sector_df)} rows -> {out_path}")


if __name__ == "__main__":
    fetch_all_sectors()
