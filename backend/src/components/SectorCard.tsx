import { useEffect, useState } from "react";
import { fetchPrediction } from "../api/client";
import type { PredictionResult } from "../types";
import ImpactBar from "./ImpactBar";

export default function SectorCard({ sector }: { sector: string }) {
  const [data, setData] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPrediction(sector)
      .then(setData)
      .catch(() => setError("Could not load prediction"))
      .finally(() => setLoading(false));
  }, [sector]);

  if (loading) {
    return <div className="bg-surface border border-border rounded-xl p-5 animate-pulse h-64" />;
  }

  if (error || !data) {
    return (
      <div className="bg-surface border border-border rounded-xl p-5 text-text-muted text-sm">
        {error ?? "No data"}
      </div>
    );
  }

  const maxAbsImpact = Math.max(...data.top_features.map((f) => Math.abs(f.impact)));
  const isBuy = data.prediction === "BUY";

  return (
    <div className="bg-surface border border-border rounded-xl p-5 hover:border-accent/40 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-text tracking-tight">{data.sector}</h3>
          <p className="text-xs text-text-muted mt-0.5">as of {data.as_of_date}</p>
        </div>
        <span
          className={`px-2.5 py-1 rounded-md text-xs font-mono font-medium ${
            isBuy ? "bg-accent/15 text-accent" : "bg-surface-hover text-text-muted"
          }`}
        >
          {data.prediction}
        </span>
      </div>

      <div className="mb-5">
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-mono font-semibold text-text">
            {data.growth_probability.toFixed(1)}
          </span>
          <span className="text-text-muted text-sm">% growth probability</span>
        </div>
        <div className="h-1.5 bg-surface-hover rounded-full mt-2 overflow-hidden">
          <div className="h-full bg-accent rounded-full" style={{ width: `${data.growth_probability}%` }} />
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs text-text-muted uppercase tracking-wide font-medium mb-2">Top drivers</p>
        {data.top_features.map((f) => (
          <ImpactBar key={f.feature} feature={f.feature} impact={f.impact} maxAbsImpact={maxAbsImpact} />
        ))}
      </div>
    </div>
  );
}
