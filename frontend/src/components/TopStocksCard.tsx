import { Link } from "react-router-dom";
import type { TopStock } from "../types";

export default function TopStocksCard({ stocks }: { stocks: TopStock[] }) {
  return (
    <div className="bg-surface border border-border rounded-2xl p-6">
      <p className="text-xs text-text-muted uppercase tracking-wide font-medium mb-4">
        Top Stocks in This Sector (30D Return)
      </p>
      <div className="space-y-1">
        {stocks.map((stock, idx) => {
          const isPositive = stock.return_30d_pct >= 0;
          const ticker = stock.ticker.replace(".NS", "");
          return (
            <Link
              key={stock.ticker}
              to={`/search?ticker=${ticker}`}
              className="flex items-center justify-between py-2.5 px-2 -mx-2 rounded-lg hover:bg-surface-hover transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-text-muted text-xs font-mono w-4">{idx + 1}</span>
                <span className="text-text font-medium text-sm">{ticker}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-text-muted font-mono text-xs">
                  ₹{stock.latest_close.toLocaleString("en-IN")}
                </span>
                <span className={`font-mono text-sm font-semibold w-16 text-right ${isPositive ? "text-positive" : "text-negative"}`}>
                  {isPositive ? "+" : ""}{stock.return_30d_pct.toFixed(2)}%
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
