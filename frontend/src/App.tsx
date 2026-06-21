import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import SectorDetail from "./pages/SectorDetail";
import ComparePage from "./pages/ComparePage";
import HistoryPage from "./pages/HistoryPage";
import ModelPerformancePage from "./pages/ModelPerformancePage";
import StockSearchPage from "./pages/StockSearchPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/sector/:sector" element={<SectorDetail />} />
          <Route path="/compare" element={<ComparePage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/performance" element={<ModelPerformancePage />} />
          <Route path="/search" element={<StockSearchPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
