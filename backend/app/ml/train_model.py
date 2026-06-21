import sys
import json
import pandas as pd
import joblib
from pathlib import Path

from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score
import xgboost as xgb
import lightgbm as lgb

PROCESSED_DIR = Path(__file__).resolve().parents[2] / "data" / "processed"
STOCK_PROCESSED_DIR = PROCESSED_DIR / "stocks"
MODELS_DIR = Path(__file__).resolve().parents[2] / "models"
MODELS_DIR.mkdir(parents=True, exist_ok=True)

SECTORS = ["it", "banking", "pharma", "auto", "fmcg", "energy", "metal"]
# Validated by experiment: sector_only outperforms stock_only and combined significantly.
# (sector_only XGBoost ROC-AUC 0.6415 vs combined 0.5596 vs stock_only 0.5347)
DATA_MODE = sys.argv[1] if len(sys.argv) > 1 else "sector_only"

FEATURE_COLS = [
    "DailyReturn", "Momentum_10_Pct", "Price_to_SMA20", "Price_to_SMA50", "Price_to_EMA20",
    "Price_to_RollingMean10", "RSI_14", "MACD_Norm", "MACD_Signal_Norm", "MACD_Diff_Norm",
    "BB_PctB", "BB_Width", "ATR_Pct", "OBV_Zscore", "ADX_14", "Volatility_20",
    "Dist_From_52w_High", "Dist_From_52w_Low", "VolumeChange",
]


def load_combined_data() -> pd.DataFrame:
    sector_frames = [pd.read_csv(PROCESSED_DIR / f"{s}_features.csv", parse_dates=["Date"]) for s in SECTORS]
    stock_frames = []
    if STOCK_PROCESSED_DIR.exists():
        stock_frames = [pd.read_csv(p, parse_dates=["Date"]) for p in STOCK_PROCESSED_DIR.glob("*_features.csv")]

    if DATA_MODE == "sector_only":
        frames = sector_frames
    elif DATA_MODE == "stock_only":
        frames = stock_frames
    else:
        frames = sector_frames + stock_frames

    print(f"Mode: {DATA_MODE} | sector files: {len(sector_frames)} | stock files: {len(stock_frames)} | using {len(frames)} files")
    return pd.concat(frames, axis=0, ignore_index=True)


def prepare_dataset(df: pd.DataFrame):
    df = pd.get_dummies(df, columns=["Sector"], prefix="Sector")
    sector_cols = [c for c in df.columns if c.startswith("Sector_")]
    df[sector_cols] = df[sector_cols].astype(int)
    feature_cols = FEATURE_COLS + sector_cols

    df = df.sort_values("Date").reset_index(drop=True)
    split_idx = int(len(df) * 0.8)
    cutoff_date = df["Date"].iloc[split_idx]

    train_df = df[df["Date"] <= cutoff_date]
    test_df = df[df["Date"] > cutoff_date]

    return (
        train_df[feature_cols], test_df[feature_cols],
        train_df["Target"], test_df["Target"],
        feature_cols,
    )


def evaluate(name, y_test, y_pred, y_proba, metrics_store):
    m = {
        "accuracy": float(accuracy_score(y_test, y_pred)),
        "precision": float(precision_score(y_test, y_pred, zero_division=0)),
        "recall": float(recall_score(y_test, y_pred, zero_division=0)),
        "f1": float(f1_score(y_test, y_pred, zero_division=0)),
        "roc_auc": float(roc_auc_score(y_test, y_proba)),
    }
    print(f"\n--- {name} ---")
    for k, v in m.items():
        print(f"{k.capitalize():10s}: {v:.4f}")
    metrics_store[name] = m
    return m["roc_auc"]


def main():
    df = load_combined_data()
    X_train, X_test, y_train, y_test, feature_cols = prepare_dataset(df)

    print(f"\nTrain rows: {len(X_train)} | Test rows: {len(X_test)}")
    print(f"Train target rate: {y_train.mean():.2%} | Test target rate: {y_test.mean():.2%}")

    metrics_store = {}
    results = {}

    scaler = StandardScaler()
    X_train_s = scaler.fit_transform(X_train)
    X_test_s = scaler.transform(X_test)
    log_reg = LogisticRegression(max_iter=1000, class_weight="balanced")
    log_reg.fit(X_train_s, y_train)
    results["Logistic Regression"] = evaluate(
        "Logistic Regression", y_test, log_reg.predict(X_test_s), log_reg.predict_proba(X_test_s)[:, 1], metrics_store
    )

    rf = RandomForestClassifier(n_estimators=300, max_depth=7, min_samples_leaf=20, class_weight="balanced", random_state=42, n_jobs=-1)
    rf.fit(X_train, y_train)
    results["Random Forest"] = evaluate(
        "Random Forest", y_test, rf.predict(X_test), rf.predict_proba(X_test)[:, 1], metrics_store
    )

    scale_pos_weight = (y_train == 0).sum() / (y_train == 1).sum()
    xgb_model = xgb.XGBClassifier(
        n_estimators=400, max_depth=5, learning_rate=0.03,
        subsample=0.8, colsample_bytree=0.8, min_child_weight=5,
        scale_pos_weight=scale_pos_weight, eval_metric="logloss", random_state=42,
    )
    xgb_model.fit(X_train, y_train)
    results["XGBoost"] = evaluate(
        "XGBoost", y_test, xgb_model.predict(X_test), xgb_model.predict_proba(X_test)[:, 1], metrics_store
    )

    lgb_model = lgb.LGBMClassifier(
        n_estimators=400, max_depth=5, learning_rate=0.03,
        subsample=0.8, colsample_bytree=0.8, min_child_samples=20,
        class_weight="balanced", random_state=42, verbose=-1,
    )
    lgb_model.fit(X_train, y_train)
    results["LightGBM"] = evaluate(
        "LightGBM", y_test, lgb_model.predict(X_test), lgb_model.predict_proba(X_test)[:, 1], metrics_store
    )

    print("\n=== Model Comparison (ROC-AUC, higher is better) ===")
    for name, auc in sorted(results.items(), key=lambda x: -x[1]):
        print(f"{name}: {auc:.4f}")

    joblib.dump(xgb_model, MODELS_DIR / "xgboost_model.pkl")
    joblib.dump(feature_cols, MODELS_DIR / "feature_columns.pkl")
    joblib.dump(scaler, MODELS_DIR / "scaler.pkl")

    importance = pd.Series(xgb_model.feature_importances_, index=feature_cols).sort_values(ascending=False)
    print("\n=== Top 10 Feature Importances (XGBoost) ===")
    print(importance.head(10))
    importance_df = importance.rename("importance").rename_axis("feature").reset_index()
    importance_df.to_csv(MODELS_DIR / "feature_importance.csv", index=False)

    with open(MODELS_DIR / "metrics.json", "w") as f:
        json.dump({
            "models": metrics_store,
            "train_rows": len(X_train),
            "test_rows": len(X_test),
            "train_target_rate": float(y_train.mean()),
            "test_target_rate": float(y_test.mean()),
            "data_mode": DATA_MODE,
        }, f, indent=2)

    print(f"\nSaved model -> {MODELS_DIR / 'xgboost_model.pkl'}")


if __name__ == "__main__":
    main()
