import { Link, useNavigate } from "react-router-dom";
import { Sparkles, LogOut, Moon, Sun } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const navigate = useNavigate();
  const [dark, setDark] = useState(true);
  const isAuthed = !!localStorage.getItem("placementai_token");

  const logout = () => {
    localStorage.removeItem("placementai_token");
    navigate("/login");
  };

  const toggleDark = () => {
    document.documentElement.classList.toggle("dark");
    setDark(!dark);
  };

  return (
    <nav className="sticky top-0 z-50 glass px-6 py-4 flex items-center justify-between">
      <Link to="/" className="flex items-center gap-2 text-white font-bold text-lg">
        <Sparkles className="text-brand-purple" size={22} />
        PlacementAI
      </Link>
      <div className="flex items-center gap-5 text-sm text-slate-200">
        {isAuthed ? (
          <>
            <Link to="/dashboard" className="hover:text-white">Dashboard</Link>
            <Link to="/prediction" className="hover:text-white">Predict</Link>
            <Link to="/analytics" className="hover:text-white">Analytics</Link>
            <Link to="/history" className="hover:text-white">History</Link>
            <button onClick={toggleDark} className="hover:text-white">
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button onClick={logout} className="flex items-center gap-1 hover:text-red-400">
              <LogOut size={16} /> Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="hover:text-white">Login</Link>
            <Link
              to="/register"
              className="bg-brand-gradient px-4 py-2 rounded-full font-medium text-white"
            >
              Get Started
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
