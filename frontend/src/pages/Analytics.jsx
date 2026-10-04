import { useEffect, useState } from "react";
import { getAnalytics } from "../services/api";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import Loading from "../components/Loading";

const COLORS = ["#5B6CFF", "#9B5CFF", "#22c55e", "#f97316", "#ef4444", "#06b6d4", "#eab308"];

export default function Analytics() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getAnalytics().then((res) => setData(res.data)).catch(() => setError("Could not load analytics."));
  }, []);

  if (error) return <p className="text-red-400 text-center mt-10">{error}</p>;
  if (!data) return <Loading label="Loading analytics..." />;

  const pieData = Object.entries(data.branch_wise_placement_rate).map(([name, value]) => ({ name, value }));

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold text-white mb-6">Analytics</h1>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="glass rounded-2xl p-6">
          <h2 className="text-white font-semibold mb-4">Placement Rate by Branch</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={100} label>
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "#0f172a", border: "none", borderRadius: 8 }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="glass rounded-2xl p-6">
          <h2 className="text-white font-semibold mb-4">Model Metrics</h2>
          <div className="space-y-3">
            {Object.entries(data.model_metrics)
              .filter(([k]) => k !== "confusion_matrix")
              .map(([k, v]) => (
                <div key={k} className="flex justify-between text-sm">
                  <span className="text-slate-400 capitalize">{k.replace("_", " ")}</span>
                  <span className="text-white font-semibold">{(v * 100).toFixed(2)}%</span>
                </div>
              ))}
          </div>
          <h3 className="text-white font-semibold mt-6 mb-2">Confusion Matrix</h3>
          <div className="grid grid-cols-2 gap-2 text-center text-sm">
            {data.model_metrics.confusion_matrix.flat().map((v, i) => (
              <div key={i} className="bg-white/5 rounded-lg py-3 text-white">{v}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
