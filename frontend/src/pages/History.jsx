import { useEffect, useState } from "react";
import { getHistory } from "../services/api";
import Loading from "../components/Loading";

export default function History() {
  const [records, setRecords] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getHistory()
      .then((res) => setRecords(res.data))
      .catch(() => setError("Could not load history. Please login again."));
  }, []);

  if (error) return <p className="text-red-400 text-center mt-10">{error}</p>;
  if (!records) return <Loading label="Loading history..." />;

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold text-white mb-6">Prediction History</h1>

      {records.length === 0 && (
        <p className="text-slate-400">No predictions yet — run one from the Prediction tab.</p>
      )}

      <div className="space-y-4">
        {records.map((r) => (
          <div key={r.id} className="glass rounded-2xl p-5 flex items-center justify-between">
            <div>
              <p className="text-white font-semibold">
                {r.predicted_label === 1 ? "✅ Predicted Placed" : "⚠️ Predicted Not Placed"}
              </p>
              <p className="text-slate-400 text-xs mt-1">
                {new Date(r.created_at).toLocaleString()}
              </p>
              <ul className="text-slate-300 text-xs mt-2 list-disc list-inside space-y-0.5">
                {r.recommendations.slice(0, 2).map((rec, i) => <li key={i}>{rec}</li>)}
              </ul>
            </div>
            <div className="text-right">
              <p className="text-brand-purple font-bold text-xl">
                {(r.placement_probability * 100).toFixed(1)}%
              </p>
              <p className="text-slate-500 text-xs">confidence {(r.confidence * 100).toFixed(1)}%</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
