import type { PredictionResult, HistoryPoint, CompareResult, PredictionLogEntry, ModelPerformanceResult } from "../types";

const BASE_URL = import.meta.env.VITE_API_URL ?? "/api";

export async function fetchSectors(): Promise<string[]> {
  const res = await fetch(`${BASE_URL}/sectors`);
  const data = await res.json();
  return data.sectors;
}

export async function fetchPrediction(sector: string): Promise<PredictionResult> {
  const res = await fetch(`${BASE_URL}/predict/${sector}`);
  if (!res.ok) throw new Error(`Failed to fetch prediction for ${sector}`);
  return res.json();
}

export async function fetchHistory(sector: string, days = 180): Promise<HistoryPoint[]> {
  const res = await fetch(`${BASE_URL}/history/${sector}?days=${days}`);
  if (!res.ok) throw new Error(`Failed to fetch history for ${sector}`);
  return res.json();
}

export async function fetchCompare(sectorA: string, sectorB: string): Promise<CompareResult> {
  const res = await fetch(`${BASE_URL}/compare?sector_a=${sectorA}&sector_b=${sectorB}`);
  if (!res.ok) throw new Error("Failed to fetch comparison");
  return res.json();
}

export async function fetchPredictionHistory(): Promise<PredictionLogEntry[]> {
  const res = await fetch(`${BASE_URL}/predictions/history`);
  if (!res.ok) throw new Error("Failed to fetch prediction history");
  return res.json();
}

export async function fetchModelPerformance(): Promise<ModelPerformanceResult> {
  const res = await fetch(`${BASE_URL}/model-performance`);
  if (!res.ok) throw new Error("Failed to fetch model performance");
  return res.json();
}

export async function fetchStockPrediction(ticker: string): Promise<StockPredictionResult> {
  const res = await fetch(`${BASE_URL}/stock/${encodeURIComponent(ticker)}`);
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.detail || `Failed to fetch prediction for ${ticker}`);
  }
  return res.json();
}

export async function fetchTopStocks(sector: string): Promise<TopStocksResult> {
  const res = await fetch(`${BASE_URL}/top-stocks/${sector}`);
  if (!res.ok) throw new Error(`Failed to fetch top stocks for ${sector}`);
  return res.json();
}
