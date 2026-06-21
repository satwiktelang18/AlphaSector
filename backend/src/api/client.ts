import type { PredictionResult } from "../types";

const BASE_URL = "/api";

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
