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
