import { NavLink, Outlet } from "react-router-dom";

const navItems = [
  { to: "/", label: "Dashboard" },
  { to: "/search", label: "Search" },
  { to: "/compare", label: "Compare" },
  { to: "/history", label: "History" },
  { to: "/performance", label: "Performance" },
];

export default function Layout() {
  return (
    <div className="min-h-screen">
      <nav className="border-b border-border px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center gap-6">
          <span className="font-bold text-text tracking-tight">StockSense</span>
          <div className="flex gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive ? "bg-accent/15 text-accent" : "text-text-muted hover:text-text"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>
      </nav>
      <Outlet />
    </div>
  );
}
