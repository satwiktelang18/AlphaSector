import { useEffect, useState } from "react";
import { fetchSectors, fetchCompare } from "../api/client";
import type { CompareResult, SectorSummary } from "../types";
import { sectorIcons } from "../lib/sectorIcons";
import RadialGauge from "../components/RadialGauge";
import { Box } from "lucide-react";
import { predictionBadgeClass } from "../lib/format";

function SectorPanel({ data }: { data: SectorSummary }) {
  const Icon = sectorIcons[data.sector] ?? Box;
  
  const isPositiveReturn = data.return_30d_pct >= 0;

  return (
    <div className="bg-surface border border-border rounded-2xl p-6 flex-1">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent">
          <Icon size={22} strokeWidth={1.75} />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-text tracking-tight leading-none">{data.sector}</h3>
          <span className={`inline-block mt-1.5 px-2 py-0.5 rounded-md text-xs font-mono font-semibold ${predictionBadgeClass(data.prediction)}`}>
            {data.prediction}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <RadialGauge value={data.growth_probability} size={80} strokeWidth={6} />
        <p className="text-xs text-text-muted uppercase tracking-wide font-medium">Growth probability</p>
      </div>

      <div className="grid grid-cols-3 gap-3 pt-5 border-t border-border">
        <div>
          <p className="text-xs text-text-muted uppercase tracking-wide">30D Return</p>
          <p className={`font-mono text-lg font-semibold mt-1 ${isPositiveReturn ? "text-positive" : "text-negative"}`}>
            {isPositiveReturn ? "+" : ""}{data.return_30d_pct.toFixed(2)}%
          </p>
        </div>
        <div>
          <p className="text-xs text-text-muted uppercase tracking-wide">RSI</p>
          <p className="font-mono text-lg font-semibold mt-1 text-text">{data.rsi.toFixed(1)}</p>
        </div>
        <div>
          <p className="text-xs text-text-muted uppercase tracking-wide">Volatility</p>
          <p className="font-mono text-lg font-semibold mt-1 text-text">{(data.volatility * 100).toFixed(2)}%</p>
        </div>
      </div>
    </div>
  );
}

export default function ComparePage() {
  const [sectors, setSectors] = useState<string[]>([]);
  const [sectorA, setSectorA] = useState("IT");
  const [sectorB, setSectorB] = useState("BANKING");
  const [result, setResult] = useState<CompareResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSectors().then(setSectors).catch(() => setSectors([]));
  }, []);

  useEffect(() => {
    if (sectorA === sectorB) return;
    setLoading(true);
    fetchCompare(sectorA, sectorB).then(setResult).finally(() => setLoading(false));
  }, [sectorA, sectorB]);

  return (
    <div className="px-8 py-12">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-text tracking-tight">Compare Sectors</h1>
          <p className="text-text-muted mt-2">See how two sectors stack up against each other</p>
        </header>

        <div className="flex items-center gap-4 mb-8">
          <select
            value={sectorA}
            onChange={(e) => setSectorA(e.target.value)}
            className="bg-surface border border-border rounded-lg px-4 py-2.5 text-text text-sm font-medium focus:outline-none focus:border-accent/50"
          >
            {sectors.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <span className="text-text-muted text-sm font-medium">vs</span>
          <select
            value={sectorB}
            onChange={(e) => setSectorB(e.target.value)}
            className="bg-surface border border-border rounded-lg px-4 py-2.5 text-text text-sm font-medium focus:outline-none focus:border-accent/50"
          >
            {sectors.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {sectorA === sectorB ? (
          <p className="text-text-muted text-sm">Pick two different sectors to compare.</p>
        ) : loading || !result ? (
          <div className="flex gap-6">
            <div className="bg-surface border border-border rounded-2xl p-6 flex-1 h-64 animate-pulse" />
            <div className="bg-surface border border-border rounded-2xl p-6 flex-1 h-64 animate-pulse" />
          </div>
        ) : (
          <div className="flex flex-col md:flex-row gap-6">
            <SectorPanel data={result.sector_a} />
            <SectorPanel data={result.sector_b} />
          </div>
        )}
      </div>
    </div>
  );
}
