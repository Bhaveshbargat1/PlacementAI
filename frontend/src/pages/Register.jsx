import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register } from "../services/api";

const branches = ["CSE", "IT", "AI-DS", "ECE", "Mechanical", "Civil", "EEE"];

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "", email: "", password: "", branch: "CSE", semester: 5,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await register({ ...form, semester: Number(form.semester) });
      localStorage.setItem("placementai_token", res.data.access_token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.detail || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 glass rounded-2xl p-8">
      <h2 className="text-2xl font-bold text-white mb-6">Create your account</h2>
      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          placeholder="Full name" required
          className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-brand-purple"
          value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          type="email" placeholder="Email" required
          className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-brand-purple"
          value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          type="password" placeholder="Password" required
          className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-brand-purple"
          value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <select
          className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-brand-purple"
          value={form.branch} onChange={(e) => setForm({ ...form, branch: e.target.value })}
        >
          {branches.map((b) => <option key={b} value={b}>{b}</option>)}
        </select>
        <input
          type="number" min={1} max={8} placeholder="Semester" required
          className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-brand-purple"
          value={form.semester} onChange={(e) => setForm({ ...form, semester: e.target.value })}
        />
        <button
          disabled={loading}
          className="bg-brand-gradient text-white rounded-xl py-3 font-medium disabled:opacity-50"
        >
          {loading ? "Creating account..." : "Register"}
        </button>
      </form>
      <p className="text-slate-400 text-sm mt-6 text-center">
        Already have an account? <Link to="/login" className="text-brand-purple">Login</Link>
      </p>
    </div>
  );
}
