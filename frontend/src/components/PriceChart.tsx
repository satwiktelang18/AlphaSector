import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import type { HistoryPoint } from "../types";

export default function PriceChart({ data }: { data: HistoryPoint[] }) {
  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <p className="text-xs text-text-muted uppercase tracking-wide font-medium mb-4">
        Price &amp; Moving Averages
      </p>
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={data}>
          <CartesianGrid stroke="#262932" strokeDasharray="3 3" />
          <XAxis dataKey="Date" stroke="#8b92a0" fontSize={11} tickFormatter={(d: string) => d.slice(5)} minTickGap={40} />
          <YAxis stroke="#8b92a0" fontSize={11} domain={["auto", "auto"]} />
          <Tooltip
            contentStyle={{ background: "#15171c", border: "1px solid #262932", borderRadius: 8 }}
            labelStyle={{ color: "#e7e9ec" }}
            itemStyle={{ fontFamily: "JetBrains Mono, monospace", fontSize: 12 }}
          />
          <Line type="monotone" dataKey="Close" stroke="#d9a441" strokeWidth={2} dot={false} name="Close" />
          <Line type="monotone" dataKey="SMA_20" stroke="#4ade80" strokeWidth={1.5} dot={false} name="SMA 20" />
          <Line type="monotone" dataKey="SMA_50" stroke="#8b92a0" strokeWidth={1.5} dot={false} name="SMA 50" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function RsiChart({ data }: { data: HistoryPoint[] }) {
  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <p className="text-xs text-text-muted uppercase tracking-wide font-medium mb-4">RSI (14)</p>
      <ResponsiveContainer width="100%" height={140}>
        <LineChart data={data}>
          <CartesianGrid stroke="#262932" strokeDasharray="3 3" />
          <XAxis dataKey="Date" stroke="#8b92a0" fontSize={11} tickFormatter={(d: string) => d.slice(5)} minTickGap={40} />
          <YAxis stroke="#8b92a0" fontSize={11} domain={[0, 100]} />
          <Tooltip contentStyle={{ background: "#15171c", border: "1px solid #262932", borderRadius: 8 }} />
          <Line type="monotone" dataKey="RSI_14" stroke="#d9a441" strokeWidth={1.5} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
