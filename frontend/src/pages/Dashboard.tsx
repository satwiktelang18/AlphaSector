import { useEffect, useState } from "react";
import { fetchSectors } from "../api/client";
import SectorCard from "../components/SectorCard";

export default function Dashboard() {
  const [sectors, setSectors] = useState<string[]>([]);

  useEffect(() => {
    fetchSectors().then(setSectors).catch(() => setSectors([]));
  }, []);

  return (
    <div className="px-8 py-12">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10">
          <div className="flex items-center gap-2 mb-3">
            <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
            <span className="text-xs text-text-muted uppercase tracking-widest font-medium">Live predictions</span>
          </div>
          <h1 className="text-4xl font-bold text-text tracking-tight">StockSense</h1>
          <p className="text-text-muted mt-2 text-base">
            Sector-wise growth predictions for the Indian market, powered by XGBoost
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sectors.map((sector) => (
            <SectorCard key={sector} sector={sector} />
          ))}
        </div>
      </div>
    </div>
  );
}
