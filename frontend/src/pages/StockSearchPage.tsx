import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { fetchStockPrediction } from "../api/client";
import type { StockPredictionResult } from "../types";
import RadialGauge from "../components/RadialGauge";
import ImpactBar from "../components/ImpactBar";
import { predictionBadgeClass } from "../lib/format";
import { sectorIcons } from "../lib/sectorIcons";
import { Search, Box, TriangleAlert } from "lucide-react";

const POPULAR_TICKERS = ["TCS", "RELIANCE", "HDFCBANK", "INFY", "ITC", "MARUTI", "SUNPHARMA", "TATASTEEL"];

export default function StockSearchPage() {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<StockPredictionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runSearch = async (ticker: string) => {
    if (!ticker.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await fetchStockPrediction(ticker.trim());
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const tickerParam = searchParams.get("ticker");
    if (tickerParam) {
      setQuery(tickerParam);
      runSearch(tickerParam);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const Icon = result?.sector ? sectorIcons[result.sector] ?? Box : Box;
  const maxAbsImpact = result ? Math.max(...result.top_features.map((f) => Math.abs(f.impact))) : 1;

  return (
    <div className="px-8 py-12">
      <div className="max-w-3xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-text tracking-tight">Search Any Indian Stock</h1>
          <p className="text-text-muted mt-2">Live growth prediction for any NSE-listed stock, fetched and scored on demand</p>
        </header>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            runSearch(query);
          }}
          className="flex items-center gap-3 mb-4"
        >
          <div className="relative flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. TCS, RELIANCE, ETERNAL"
              className="w-full bg-surface border border-border rounded-xl pl-11 pr-4 py-3 text-text placeholder:text-text-muted focus:outline-none focus:border-accent/50"
            />
          </div>
          <button
            type="submit"
            className="bg-accent text-bg font-semibold px-5 py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </form>

        <div className="flex flex-wrap gap-2 mb-8">
          {POPULAR_TICKERS.map((t) => (
            <button
              key={t}
              onClick={() => {
                setQuery(t);
                runSearch(t);
              }}
              className="text-xs px-3 py-1.5 rounded-lg bg-surface border border-border text-text-muted hover:text-accent hover:border-accent/40 transition-colors"
            >
              {t}
            </button>
          ))}
        </div>

        {error && (
          <div className="bg-surface border border-border rounded-2xl p-5 text-negative text-sm flex items-start gap-2">
            <TriangleAlert size={16} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading && <div className="bg-surface border border-border rounded-2xl p-6 h-80 animate-pulse" />}

        {result && !loading && (
          <div className="bg-gradient-to-br from-surface to-[#101218] border border-border rounded-2xl p-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent">
                  <Icon size={22} strokeWidth={1.75} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-text tracking-tight leading-none">{result.ticker}</h3>
                  <p className="text-xs text-text-muted mt-1.5">
                    {result.sector ? `${result.sector} sector` : "Sector unclassified"} · as of {result.as_of_date}
                  </p>
                </div>
              </div>
              <span className={`px-2.5 py-1 rounded-md text-xs font-mono font-semibold ${predictionBadgeClass(result.prediction)}`}>
                {result.prediction}
              </span>
            </div>

            <div className="flex items-center gap-5 mb-6 pb-6 border-b border-border">
              <RadialGauge value={result.growth_probability} />
              <div>
                <p className="text-xs text-text-muted uppercase tracking-wide font-medium">Growth probability</p>
                <p className="text-sm text-text-muted mt-1">next 30 trading days, &gt;5% return</p>
              </div>
            </div>

            <div className="space-y-2.5 mb-5">
              <p className="text-xs text-text-muted uppercase tracking-wide font-medium mb-1">Top drivers</p>
              {result.top_features.map((f) => (
                <ImpactBar key={f.feature} feature={f.feature} impact={f.impact} maxAbsImpact={maxAbsImpact} />
              ))}
            </div>

            <p className="text-xs text-text-muted bg-surface-hover rounded-lg p-3 leading-relaxed">
              Individual stock predictions are noisier than sector-level ones — in testing, stock-level ROC-AUC
              (~0.53–0.60) trailed sector-level ROC-AUC (~0.64) due to company-specific volatility that generic
              technical indicators can't fully capture. Treat this as one input, not a sole signal.
            </p>
          </div>
        )}

        {!result && !loading && !error && (
          <div className="bg-surface border border-border rounded-2xl p-10 text-center text-text-muted text-sm">
            Search any NSE-listed stock above — works for stocks outside our 35-stock sector baskets too.
          </div>
        )}
      </div>
    </div>
  );
}
