import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Brain, ShieldCheck, TrendingUp, Sparkles } from "lucide-react";

const features = [
  { icon: Brain, title: "AI Placement Prediction", desc: "XGBoost-powered model trained on 10,000 student records." },
  { icon: ShieldCheck, title: "Explainable AI", desc: "SHAP-based reasoning shows exactly why a prediction was made." },
  { icon: TrendingUp, title: "Personalized Recommendations", desc: "Dynamic, actionable guidance to improve placement odds." },
];

export default function Landing() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <span className="inline-flex items-center gap-2 glass px-4 py-1.5 rounded-full text-xs text-brand-purple font-medium mb-6">
          <Sparkles size={14} /> AI-Powered Career Intelligence
        </span>
        <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight">
          Know Your Placement <br />
          <span className="bg-brand-gradient bg-clip-text text-transparent">Probability, Instantly.</span>
        </h1>
        <p className="text-slate-400 mt-6 max-w-2xl mx-auto">
          PlacementAI analyzes your academics, skills, and profile to predict placement likelihood,
          explain the reasoning, and give you a clear action plan to improve it.
        </p>
        <div className="mt-10 flex justify-center gap-4">
          <Link to="/register" className="bg-brand-gradient text-white px-8 py-3 rounded-full font-medium">
            Get Started Free
          </Link>
          <Link to="/login" className="glass text-white px-8 py-3 rounded-full font-medium">
            Login
          </Link>
        </div>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-6 mt-24">
        {features.map(({ icon: Icon, title, desc }, i) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.15 }}
            className="glass rounded-2xl p-6"
          >
            <Icon className="text-brand-purple mb-4" size={28} />
            <h3 className="text-white font-semibold text-lg mb-2">{title}</h3>
            <p className="text-slate-400 text-sm">{desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
