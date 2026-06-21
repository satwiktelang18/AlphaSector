import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchPrediction } from "../api/client";
import type { PredictionResult } from "../types";
import { sectorIcons } from "../lib/sectorIcons";
import RadialGauge from "./RadialGauge";
import ImpactBar from "./ImpactBar";
import { predictionBadgeClass } from "../lib/format";
import { Box } from "lucide-react";

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
    return <div className="bg-surface border border-border rounded-2xl p-6 animate-pulse h-80" />;
  }

  if (error || !data) {
    return (
      <div className="bg-surface border border-border rounded-2xl p-6 text-text-muted text-sm">
        {error ?? "No data"}
      </div>
    );
  }

  const maxAbsImpact = Math.max(...data.top_features.map((f) => Math.abs(f.impact)));
  
  const Icon = sectorIcons[sector] ?? Box;

  return (
    <Link
      to={`/sector/${sector}`}
      className="group relative block overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-surface to-[#101218] p-6 transition-all duration-200 hover:-translate-y-1 hover:border-accent/40 hover:shadow-[0_16px_40px_-16px_rgba(217,164,65,0.3)]"
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent">
            <Icon size={22} strokeWidth={1.75} />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-text tracking-tight leading-none">{data.sector}</h3>
            <p className="text-xs text-text-muted mt-1.5">as of {data.as_of_date}</p>
          </div>
        </div>
        <span
          className={`px-2.5 py-1 rounded-md text-xs font-mono font-semibold tracking-wide ${
            predictionBadgeClass(data.prediction)
          }`}
        >
          {data.prediction}
        </span>
      </div>

      <div className="flex items-center gap-5 mb-6 pb-6 border-b border-border">
        <RadialGauge value={data.growth_probability} />
        <div>
          <p className="text-xs text-text-muted uppercase tracking-wide font-medium">Growth probability</p>
          <p className="text-sm text-text-muted mt-1">next 30 trading days, &gt;5% return</p>
        </div>
      </div>

      <div className="space-y-2.5">
        <p className="text-xs text-text-muted uppercase tracking-wide font-medium mb-1">Top drivers</p>
        {data.top_features.map((f) => (
          <ImpactBar key={f.feature} feature={f.feature} impact={f.impact} maxAbsImpact={maxAbsImpact} />
        ))}
      </div>
    </Link>
  );
}
