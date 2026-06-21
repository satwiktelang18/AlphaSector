import { useEffect, useState } from "react";
import { fetchPredictionHistory } from "../api/client";
import type { PredictionLogEntry } from "../types";
import { predictionBadgeClass } from "../lib/format";

export default function HistoryPage() {
  const [logs, setLogs] = useState<PredictionLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPredictionHistory().then(setLogs).finally(() => setLoading(false));
  }, []);

  return (
    <div className="px-8 py-12">
      <div className="max-w-5xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-text tracking-tight">Prediction History</h1>
          <p className="text-text-muted mt-2">A log of every prediction StockSense has made</p>
        </header>

        <div className="bg-surface border border-border rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-text-muted text-xs uppercase tracking-wide">
                <th className="text-left font-medium px-5 py-3">Sector</th>
                <th className="text-left font-medium px-5 py-3">As of</th>
                <th className="text-left font-medium px-5 py-3">Growth Probability</th>
                <th className="text-left font-medium px-5 py-3">Prediction</th>
                <th className="text-left font-medium px-5 py-3">Logged At</th>
              </tr>
            </thead>
            <tbody>
              {!loading && logs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-text-muted">
                    No predictions logged yet — visit the dashboard to generate some.
                  </td>
                </tr>
              )}
              {logs.map((log) => (
                <tr key={log.id} className="border-b border-border last:border-0 hover:bg-surface-hover transition-colors">
                  <td className="px-5 py-3 font-semibold text-text">{log.sector}</td>
                  <td className="px-5 py-3 text-text-muted font-mono">{log.as_of_date}</td>
                  <td className="px-5 py-3 font-mono text-text">{log.growth_probability.toFixed(1)}%</td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded-md text-xs font-mono font-semibold ${predictionBadgeClass(log.prediction)}`}>
                      {log.prediction}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-text-muted font-mono text-xs">{new Date(log.logged_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
