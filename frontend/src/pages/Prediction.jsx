import { useState } from "react";
import { predict } from "../services/api";
import { motion } from "framer-motion";
import Loading from "../components/Loading";

const initialForm = {
  cgpa: 7.5, tenth_pct: 80, twelfth_pct: 78, semester: 7, backlogs: 0,
  programming_skill: 6, dsa_rating: 900, communication_skill: 6, aptitude_score: 60,
  technical_test_score: 60, projects_completed: 2, internships: 0, hackathons: 1,
  certifications: 1, attendance_pct: 80, branch: "CSE", gender: "Male",
  preferred_role: "SDE", expected_salary_lpa: 6, soft_skills_score: 6,
  linkedin_active: 1, github_activity_score: 40, resume_score: 60,
};

const numericFields = Object.keys(initialForm).filter(
  (k) => !["branch", "gender", "preferred_role"].includes(k)
);

export default function Prediction() {
  const [form, setForm] = useState(initialForm);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (key, value) => setForm({ ...form, [key]: value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setResult(null);
    try {
      const payload = { ...form };
      numericFields.forEach((k) => (payload[k] = Number(payload[k])));
      const res = await predict(payload);
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || "Prediction failed. Please login again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold text-white mb-6">Placement Prediction</h1>

      <form onSubmit={handleSubmit} className="glass rounded-2xl p-6 grid sm:grid-cols-2 gap-4">
        {numericFields.map((key) => (
          <div key={key}>
            <label className="text-slate-400 text-xs capitalize block mb-1">
              {key.replace(/_/g, " ")}
            </label>
            <input
              type="number" step="any"
              value={form[key]}
              onChange={(e) => handleChange(key, e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-brand-purple"
            />
          </div>
        ))}
        <div>
          <label className="text-slate-400 text-xs block mb-1">Branch</label>
          <select
            value={form.branch} onChange={(e) => handleChange("branch", e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
          >
            {["CSE", "IT", "AI-DS", "ECE", "Mechanical", "Civil", "EEE"].map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-slate-400 text-xs block mb-1">Gender</label>
          <select
            value={form.gender} onChange={(e) => handleChange("gender", e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
          >
            {["Male", "Female", "Other"].map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
        <div>
          <label className="text-slate-400 text-xs block mb-1">Preferred Role</label>
          <select
            value={form.preferred_role} onChange={(e) => handleChange("preferred_role", e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
          >
            {["SDE", "Data Analyst", "ML Engineer", "Backend Dev", "Frontend Dev", "Core Engineer"].map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        <button className="sm:col-span-2 bg-brand-gradient text-white rounded-xl py-3 font-medium mt-2">
          Predict Placement
        </button>
      </form>

      {error && <p className="text-red-400 text-center mt-4">{error}</p>}
      {loading && <Loading label="Running model + SHAP explanation..." />}

      {result && (
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-6 mt-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold text-lg">
              {result.predicted_label === 1 ? "✅ Likely to be Placed" : "⚠️ At Risk — Not Likely Yet"}
            </h2>
            <span className="text-brand-purple font-bold text-xl">
              {(result.placement_probability * 100).toFixed(1)}%
            </span>
          </div>
          <p className="text-slate-400 text-sm mb-4">
            Model confidence: {(result.confidence * 100).toFixed(1)}%
          </p>

          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div>
              <h3 className="text-green-400 text-sm font-semibold mb-2">Top Positive Factors</h3>
              {result.top_positive_factors.map((f) => (
                <p key={f.feature} className="text-slate-300 text-sm">
                  {f.feature.replace(/_/g, " ")} (+{f.impact})
                </p>
              ))}
            </div>
            <div>
              <h3 className="text-red-400 text-sm font-semibold mb-2">Top Negative Factors</h3>
              {result.top_negative_factors.map((f) => (
                <p key={f.feature} className="text-slate-300 text-sm">
                  {f.feature.replace(/_/g, " ")} ({f.impact})
                </p>
              ))}
            </div>
          </div>

          <h3 className="text-white text-sm font-semibold mb-2">Recommendations</h3>
          <ul className="list-disc list-inside text-slate-300 text-sm space-y-1">
            {result.recommendations.map((r, i) => <li key={i}>{r}</li>)}
          </ul>
        </motion.div>
      )}
    </div>
  );
}
