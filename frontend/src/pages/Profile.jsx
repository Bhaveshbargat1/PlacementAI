import { useEffect, useState } from "react";
import { getHistory } from "../services/api";
import { User } from "lucide-react";
import Loading from "../components/Loading";

// Decodes the JWT payload (no verification needed client-side, just display)
function decodeToken(token) {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

export default function Profile() {
  const [records, setRecords] = useState(null);
  const token = localStorage.getItem("placementai_token");
  const decoded = token ? decodeToken(token) : null;

  useEffect(() => {
    getHistory().then((res) => setRecords(res.data)).catch(() => setRecords([]));
  }, []);

  if (!records) return <Loading label="Loading profile..." />;

  const latest = records[0];

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold text-white mb-6">Profile</h1>

      <div className="glass rounded-2xl p-6 flex items-center gap-4 mb-6">
        <div className="bg-brand-gradient p-4 rounded-full">
          <User className="text-white" size={28} />
        </div>
        <div>
          <p className="text-white font-semibold">{decoded?.sub || "Student"}</p>
          <p className="text-slate-400 text-sm">PlacementAI account</p>
        </div>
      </div>

      <div className="glass rounded-2xl p-6">
        <h2 className="text-white font-semibold mb-4">Latest Prediction Summary</h2>
        {latest ? (
          <div className="flex justify-between items-center">
            <div>
              <p className="text-slate-300 text-sm">
                {latest.predicted_label === 1 ? "Predicted Placed" : "Predicted Not Placed"}
              </p>
              <p className="text-slate-500 text-xs">
                {new Date(latest.created_at).toLocaleString()}
              </p>
            </div>
            <p className="text-brand-purple font-bold text-xl">
              {(latest.placement_probability * 100).toFixed(1)}%
            </p>
          </div>
        ) : (
          <p className="text-slate-400 text-sm">No predictions yet.</p>
        )}
      </div>
    </div>
  );
}
