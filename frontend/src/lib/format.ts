export function humanizeFeature(name: string): string {
  const overrides: Record<string, string> = {
    macd: "MACD",
    rsi: "RSI",
    atr: "ATR",
    adx: "ADX",
    bb: "BB",
    obv: "OBV",
    sma: "SMA",
    ema: "EMA",
    pct: "%",
    pctb: "%B",
  };

  return name
    .split("_")
    .map((part) => {
      const lower = part.toLowerCase();
      if (overrides[lower]) return overrides[lower];
      if (lower === "52w") return "52W";
      return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
    })
    .join(" ");
}

export function predictionBadgeClass(prediction: string): string {
  if (prediction === "BUY") return "bg-accent/15 text-accent";
  if (prediction === "SELL") return "bg-negative/15 text-negative";
  return "bg-surface-hover text-text-muted";
}
