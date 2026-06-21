import numpy as np
import pandas as pd
import ta
from pathlib import Path

RAW_DIR = Path(__file__).resolve().parents[2] / "data" / "raw"
PROCESSED_DIR = Path(__file__).resolve().parents[2] / "data" / "processed"
PROCESSED_DIR.mkdir(parents=True, exist_ok=True)

SECTORS = ["it", "banking", "pharma", "auto", "fmcg", "energy", "metal"]

FUTURE_WINDOW = 30
TARGET_THRESHOLD = 0.05


def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    df["Date"] = pd.to_datetime(df["Date"])
    df.sort_values("Date", inplace=True)
    df.reset_index(drop=True, inplace=True)

    df["DailyReturn"] = df["Close"].pct_change()
    df["Momentum_10_Pct"] = df["Close"].pct_change(10)

    sma_20 = ta.trend.sma_indicator(df["Close"], window=20)
    sma_50 = ta.trend.sma_indicator(df["Close"], window=50)
    ema_20 = ta.trend.ema_indicator(df["Close"], window=20)
    rolling_mean_10 = df["Close"].rolling(10).mean()

    # Raw values kept for charting/display
    df["SMA_20"], df["SMA_50"], df["EMA_20"], df["RollingMean_10"] = sma_20, sma_50, ema_20, rolling_mean_10
    # Relative versions used for ML training
    df["Price_to_SMA20"] = df["Close"] / sma_20 - 1
    df["Price_to_SMA50"] = df["Close"] / sma_50 - 1
    df["Price_to_EMA20"] = df["Close"] / ema_20 - 1
    df["Price_to_RollingMean10"] = df["Close"] / rolling_mean_10 - 1

    df["RSI_14"] = ta.momentum.rsi(df["Close"], window=14)

    macd = ta.trend.MACD(df["Close"])
    df["MACD"], df["MACD_Signal"], df["MACD_Diff"] = macd.macd(), macd.macd_signal(), macd.macd_diff()
    df["MACD_Norm"] = df["MACD"] / df["Close"]
    df["MACD_Signal_Norm"] = df["MACD_Signal"] / df["Close"]
    df["MACD_Diff_Norm"] = df["MACD_Diff"] / df["Close"]

    bb = ta.volatility.BollingerBands(df["Close"], window=20, window_dev=2)
    df["BB_High"], df["BB_Low"] = bb.bollinger_hband(), bb.bollinger_lband()
    df["BB_PctB"] = (df["Close"] - df["BB_Low"]) / (df["BB_High"] - df["BB_Low"])
    df["BB_Width"] = bb.bollinger_wband()

    atr = ta.volatility.average_true_range(df["High"], df["Low"], df["Close"], window=14)
    df["ATR_14"] = atr
    df["ATR_Pct"] = atr / df["Close"]

    obv = ta.volume.on_balance_volume(df["Close"], df["Volume"])
    df["OBV"] = obv
    df["OBV_Zscore"] = (obv - obv.rolling(60).mean()) / obv.rolling(60).std()

    df["ADX_14"] = ta.trend.adx(df["High"], df["Low"], df["Close"], window=14)
    df["Volatility_20"] = df["DailyReturn"].rolling(20).std()

    high_52w = df["Close"].rolling(252, min_periods=50).max()
    low_52w = df["Close"].rolling(252, min_periods=50).min()
    df["Dist_From_52w_High"] = (df["Close"] - high_52w) / high_52w
    df["Dist_From_52w_Low"] = (df["Close"] - low_52w) / low_52w

    df["VolumeChange"] = df["Volume"].pct_change()

    df["FutureClose"] = df["Close"].shift(-FUTURE_WINDOW)
    df["FutureReturn"] = (df["FutureClose"] - df["Close"]) / df["Close"]
    df["Target"] = (df["FutureReturn"] > TARGET_THRESHOLD).astype(int)
    df = df[df["FutureClose"].notna()]
    df.drop(columns=["FutureClose"], inplace=True)

    df.replace([np.inf, -np.inf], np.nan, inplace=True)
    df.dropna(inplace=True)
    return df


def process_all_sectors():
    for sector in SECTORS:
        raw_path = RAW_DIR / f"{sector}.csv"
        if not raw_path.exists():
            print(f"  WARNING: {raw_path} not found, skipping {sector}.")
            continue
        df = pd.read_csv(raw_path)
        processed = engineer_features(df)
        processed["Sector"] = sector.upper()
        out_path = PROCESSED_DIR / f"{sector}_features.csv"
        processed.to_csv(out_path, index=False)
        print(f"{sector.upper()}: {len(processed)} rows -> {out_path}  (positive target rate: {processed['Target'].mean():.2%})")


if __name__ == "__main__":
    process_all_sectors()
