import { useEffect, useState } from "react";
import { fetchSectors } from "./api/client";
import SectorCard from "./components/SectorCard";

export default function App() {
  const [sectors, setSectors] = useState<string[]>([]);

  useEffect(() => {
    fetchSectors().then(setSectors).catch(() => setSectors([]));
  }, []);

  return (
    <div className="min-h-screen bg-bg px-8 py-10">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold text-text tracking-tight">StockSense</h1>
        <p className="text-text-muted text-sm mt-1">Sector-wise growth predictions, powered by XGBoost</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {sectors.map((sector) => (
          <SectorCard key={sector} sector={sector} />
        ))}
      </div>
    </div>
  );
}
