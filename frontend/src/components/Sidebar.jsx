import { NavLink } from "react-router-dom";
import { LayoutDashboard, Target, BarChart3, History, User } from "lucide-react";

const links = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/prediction", label: "Prediction", icon: Target },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/history", label: "History", icon: History },
  { to: "/profile", label: "Profile", icon: User },
];

export default function Sidebar() {
  return (
    <aside className="hidden md:flex flex-col w-56 glass rounded-2xl p-4 gap-1 h-fit sticky top-24">
      {links.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
              isActive
                ? "bg-brand-gradient text-white"
                : "text-slate-300 hover:bg-white/10"
            }`
          }
        >
          <Icon size={18} />
          {label}
        </NavLink>
      ))}
    </aside>
  );
}
