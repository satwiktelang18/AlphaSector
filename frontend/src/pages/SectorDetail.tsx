import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchHistory, fetchPrediction, fetchTopStocks } from "../api/client";
import type { HistoryPoint, PredictionResult, TopStock } from "../types";
import PriceChart, { RsiChart } from "../components/PriceChart";
import ImpactBar from "../components/ImpactBar";
import RadialGauge from "../components/RadialGauge";
import TopStocksCard from "../components/TopStocksCard";
import { sectorIcons } from "../lib/sectorIcons";
import { predictionBadgeClass } from "../lib/format";
import { Box, ArrowLeft } from "lucide-react";

export default function SectorDetail() {
  const { sector } = useParams<{ sector: string }>();
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [topStocks, setTopStocks] = useState<TopStock[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sector) return;
    setLoading(true);
    Promise.all([fetchHistory(sector, 180), fetchPrediction(sector), fetchTopStocks(sector)])
      .then(([h, p, t]) => {
        setHistory(h);
        setPrediction(p);
        setTopStocks(t.top_stocks);
      })
      .finally(() => setLoading(false));
  }, [sector]);

  if (loading || !sector) {
    return <div className="px-8 py-12 text-text-muted">Loading {sector}...</div>;
  }

  const maxAbsImpact = prediction
    ? Math.max(...prediction.top_features.map((f) => Math.abs(f.impact)))
    : 1;
  const Icon = sectorIcons[sector] ?? Box;

  return (
    <div className="px-8 py-12">
      <div className="max-w-7xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-1.5 text-text-muted text-sm hover:text-accent transition-colors">
          <ArrowLeft size={14} /> Back to dashboard
        </Link>

        <header className="mt-5 mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-accent/10 text-accent">
              <Icon size={26} strokeWidth={1.75} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-text tracking-tight">{sector}</h1>
              <p className="text-text-muted text-sm mt-1">Historical performance &amp; indicators</p>
            </div>
          </div>
          {prediction && (
            <div className="flex items-center gap-4 bg-surface border border-border rounded-2xl px-5 py-4">
              <RadialGauge value={prediction.growth_probability} size={64} strokeWidth={6} />
              <span className={`px-2.5 py-1 rounded-md text-xs font-mono font-semibold ${predictionBadgeClass(prediction.prediction)}`}>
                {prediction.prediction}
              </span>
            </div>
          )}
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <PriceChart data={history} />
            <RsiChart data={history} />
          </div>

          <div className="space-y-6">
            {prediction && (
              <div className="bg-surface border border-border rounded-2xl p-6">
                <p className="text-xs text-text-muted uppercase tracking-wide font-medium mb-4">Why this prediction</p>
                <div className="space-y-2.5">
                  {prediction.top_features.map((f) => (
                    <ImpactBar key={f.feature} feature={f.feature} impact={f.impact} maxAbsImpact={maxAbsImpact} />
                  ))}
                </div>
              </div>
            )}
            {topStocks.length > 0 && <TopStocksCard stocks={topStocks} />}
          </div>
        </div>
      </div>
    </div>
  );
}
