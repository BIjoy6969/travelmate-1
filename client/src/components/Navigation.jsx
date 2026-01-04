import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/", label: "Dashboard", icon: "📊" },
  { to: "/weather", label: "Weather", icon: "🌤️" },
  { to: "/currency", label: "Currency", icon: "💱" },
  { to: "/flights", label: "Flights", icon: "🛫" },
  { to: "/trips", label: "Trips", icon: "✈️" },
  { to: "/expenses", label: "Expenses", icon: "💰" },
];

export default function Navigation() {
  return (
    <nav className="border-b border-slate-200 bg-white">
      {/* full-width nav area */}
      <div className="w-full px-3 sm:px-4">
        {/* centered container but full use inside */}
        <div className="mx-auto max-w-6xl">
          {/* tabs row */}
          <div className="tm-nav-row">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  `tm-nav-btn ${isActive ? "is-active" : ""}`
                }
              >
                <span className="tm-nav-ico">{item.icon}</span>
                <span className="tm-nav-text">{item.label}</span>
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
