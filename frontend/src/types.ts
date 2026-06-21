export interface PredictionFeature {
  feature: string;
  impact: number;
}

export interface PredictionResult {
  sector: string;
  as_of_date: string;
  growth_probability: number;
  prediction: "BUY" | "HOLD";
  top_features: PredictionFeature[];
}

export interface HistoryPoint {
  Date: string;
  Open: number;
  High: number;
  Low: number;
  Close: number;
  Volume: number;
  RSI_14: number;
  SMA_20: number;
  SMA_50: number;
  MACD: number;
  BB_High: number;
  BB_Low: number;
}

export interface SectorSummary {
  sector: string;
  growth_probability: number;
  prediction: "BUY" | "HOLD";
  return_30d_pct: number;
  rsi: number;
  volatility: number;
}

export interface CompareResult {
  sector_a: SectorSummary;
  sector_b: SectorSummary;
}

export interface PredictionLogEntry {
  id: number;
  sector: string;
  as_of_date: string;
  growth_probability: number;
  prediction: string;
  logged_at: string;
}

export interface ModelMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
  roc_auc: number;
}

export interface FeatureImportanceItem {
  feature: string;
  importance: number;
}

export interface ModelPerformanceResult {
  models: Record<string, ModelMetrics>;
  train_rows: number;
  test_rows: number;
  train_target_rate: number;
  test_target_rate: number;
  feature_importance: FeatureImportanceItem[];
}

export interface StockPredictionResult {
  ticker: string;
  sector: string | null;
  as_of_date: string;
  growth_probability: number;
  prediction: string;
  top_features: PredictionFeature[];
}

export interface TopStock {
  ticker: string;
  latest_close: number;
  return_30d_pct: number;
}

export interface TopStocksResult {
  sector: string;
  top_stocks: TopStock[];
}
