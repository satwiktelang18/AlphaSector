import { humanizeFeature } from "../lib/format";

interface ImpactBarProps {
  feature: string;
  impact: number;
  maxAbsImpact: number;
}

export default function ImpactBar({ feature, impact, maxAbsImpact }: ImpactBarProps) {
  const widthPct = Math.min(100, (Math.abs(impact) / maxAbsImpact) * 100);
  const isPositive = impact > 0;

  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="w-32 shrink-0 truncate text-text-muted text-xs">{humanizeFeature(feature)}</span>
      <div className="flex-1 h-1.5 bg-surface-hover rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${isPositive ? "bg-accent" : "bg-text-muted/50"}`}
          style={{ width: `${widthPct}%` }}
        />
      </div>
      <span className={`font-mono text-xs w-12 text-right shrink-0 ${isPositive ? "text-accent" : "text-text-muted"}`}>
        {isPositive ? "+" : ""}{impact.toFixed(3)}
      </span>
    </div>
  );
}
