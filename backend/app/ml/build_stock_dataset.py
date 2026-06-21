import pandas as pd
from pathlib import Path

from feature_engineering import engineer_features
from fetch_data import SECTOR_STOCKS

RAW_STOCK_DIR = Path(__file__).resolve().parents[2] / "data" / "raw" / "stocks"
PROCESSED_STOCK_DIR = Path(__file__).resolve().parents[2] / "data" / "processed" / "stocks"
PROCESSED_STOCK_DIR.mkdir(parents=True, exist_ok=True)

TICKER_SECTOR = {ticker: sector for sector, tickers in SECTOR_STOCKS.items() for ticker in tickers}


def process_all_stocks():
    for ticker, sector in TICKER_SECTOR.items():
        safe_name = ticker.replace(".", "_").replace("&", "and")
        raw_path = RAW_STOCK_DIR / f"{safe_name}.csv"
        if not raw_path.exists():
            print(f"  WARNING: {raw_path} not found, skipping {ticker}.")
            continue

        df = pd.read_csv(raw_path)
        processed = engineer_features(df)
        processed["Sector"] = sector
        processed["Ticker"] = ticker
        out_path = PROCESSED_STOCK_DIR / f"{safe_name}_features.csv"
        processed.to_csv(out_path, index=False)
        print(f"{ticker}: {len(processed)} rows -> {out_path}  (positive target rate: {processed['Target'].mean():.2%})")


if __name__ == "__main__":
    process_all_stocks()
