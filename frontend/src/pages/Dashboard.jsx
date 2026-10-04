import { useEffect, useState } from "react";
import { getAnalytics } from "../services/api";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Users, CheckCircle2, XCircle, GraduationCap, FileText } from "lucide-react";
import Loading from "../components/Loading";

function Card({ icon: Icon, label, value, accent }) {
  return (
    <div className="glass rounded-2xl p-5 flex items-center gap-4">
      <div className={`p-3 rounded-xl bg-brand-gradient`}>
        <Icon className="text-white" size={22} />
      </div>
      <div>
        <p className="text-slate-400 text-xs">{label}</p>
        <p className="text-white text-xl font-bold">{value}</p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getAnalytics()
      .then((res) => setData(res.data))
      .catch(() => setError("Could not load analytics. Is the backend running?"));
  }, []);

  if (error) return <p className="text-red-400 text-center mt-10">{error}</p>;
  if (!data) return <Loading label="Loading dashboard..." />;

  const branchData = Object.entries(data.branch_wise_placement_rate).map(([branch, rate]) => ({
    branch, rate,
  }));

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold text-white mb-6">Dashboard</h1>

      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <Card icon={Users} label="Total Students" value={data.total_students.toLocaleString()} />
        <Card icon={CheckCircle2} label="Predicted Placed" value={data.predicted_placed.toLocaleString()} />
        <Card icon={XCircle} label="Predicted Not Placed" value={data.predicted_not_placed.toLocaleString()} />
        <Card icon={GraduationCap} label="Average CGPA" value={data.average_cgpa} />
        <Card icon={FileText} label="Avg Resume Score" value={data.average_resume_score} />
      </div>

      <div className="glass rounded-2xl p-6">
        <h2 className="text-white font-semibold mb-4">Branch-wise Placement Rate (%)</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={branchData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff1a" />
            <XAxis dataKey="branch" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip contentStyle={{ background: "#0f172a", border: "none", borderRadius: 8 }} />
            <Bar dataKey="rate" fill="#9B5CFF" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="glass rounded-2xl p-6 mt-6">
        <h2 className="text-white font-semibold mb-4">Model Performance</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          {Object.entries(data.model_metrics)
            .filter(([k]) => k !== "confusion_matrix")
            .map(([k, v]) => (
              <div key={k}>
                <p className="text-slate-400 text-xs capitalize">{k.replace("_", " ")}</p>
                <p className="text-white text-lg font-bold">{(v * 100).toFixed(1)}%</p>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
