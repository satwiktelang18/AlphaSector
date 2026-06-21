import { useEffect, useState } from "react";
import { fetchModelPerformance } from "../api/client";
import type { ModelPerformanceResult } from "../types";
import { humanizeFeature } from "../lib/format";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const MODEL_COLORS: Record<string, string> = {
  "Logistic Regression": "#8b92a0",
  "Random Forest": "#8b92a0",
  XGBoost: "#d9a441",
  LightGBM: "#8b92a0",
};

export default function ModelPerformancePage() {
  const [data, setData] = useState<ModelPerformanceResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchModelPerformance()
      .then(setData)
      .catch(() => setError("No model metrics found yet — run train_model.py on the backend first."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="px-8 py-12 text-text-muted">Loading model performance...</div>;
  if (error || !data) return <div className="px-8 py-12 text-text-muted">{error}</div>;

  const modelRows = Object.entries(data.models).map(([name, m]) => ({ name, ...m }));
  const rocData = modelRows.map((m) => ({ name: m.name, roc_auc: m.roc_auc }));
  const importanceData = data.feature_importance.map((f) => ({
    name: humanizeFeature(f.feature),
    importance: f.importance,
  }));

  return (
    <div className="px-8 py-12">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-text tracking-tight">Model Performance</h1>
          <p className="text-text-muted mt-2">
            Trained on {data.train_rows.toLocaleString()} rows, validated on {data.test_rows.toLocaleString()} rows
            (chronological split, no shuffling)
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-surface border border-border rounded-2xl p-6">
            <p className="text-xs text-text-muted uppercase tracking-wide font-medium mb-4">ROC-AUC by Model</p>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={rocData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid stroke="#262932" strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" domain={[0, 1]} stroke="#8b92a0" fontSize={11} />
                <YAxis type="category" dataKey="name" stroke="#8b92a0" fontSize={12} width={130} />
                <Tooltip contentStyle={{ background: "#15171c", border: "1px solid #262932", borderRadius: 8 }} />
                <Bar dataKey="roc_auc" radius={[0, 6, 6, 0]}>
                  {rocData.map((entry) => (
                    <Cell key={entry.name} fill={MODEL_COLORS[entry.name] ?? "#8b92a0"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-surface border border-border rounded-2xl p-6">
            <p className="text-xs text-text-muted uppercase tracking-wide font-medium mb-4">
              Top Feature Importance (XGBoost)
            </p>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={importanceData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid stroke="#262932" strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" stroke="#8b92a0" fontSize={11} />
                <YAxis type="category" dataKey="name" stroke="#8b92a0" fontSize={11} width={130} />
                <Tooltip contentStyle={{ background: "#15171c", border: "1px solid #262932", borderRadius: 8 }} />
                <Bar dataKey="importance" fill="#d9a441" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-text-muted text-xs uppercase tracking-wide">
                <th className="text-left font-medium px-5 py-3">Model</th>
                <th className="text-left font-medium px-5 py-3">Accuracy</th>
                <th className="text-left font-medium px-5 py-3">Precision</th>
                <th className="text-left font-medium px-5 py-3">Recall</th>
                <th className="text-left font-medium px-5 py-3">F1</th>
                <th className="text-left font-medium px-5 py-3">ROC-AUC</th>
              </tr>
            </thead>
            <tbody>
              {modelRows.map((m) => (
                <tr key={m.name} className="border-b border-border last:border-0">
                  <td className="px-5 py-3 font-semibold text-text">{m.name}</td>
                  <td className="px-5 py-3 font-mono text-text-muted">{(m.accuracy * 100).toFixed(1)}%</td>
                  <td className="px-5 py-3 font-mono text-text-muted">{(m.precision * 100).toFixed(1)}%</td>
                  <td className="px-5 py-3 font-mono text-text-muted">{(m.recall * 100).toFixed(1)}%</td>
                  <td className="px-5 py-3 font-mono text-text-muted">{(m.f1 * 100).toFixed(1)}%</td>
                  <td className={`px-5 py-3 font-mono font-semibold ${m.name === "XGBoost" ? "text-accent" : "text-text"}`}>
                    {m.roc_auc.toFixed(4)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
