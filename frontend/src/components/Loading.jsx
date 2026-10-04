import { motion } from "framer-motion";

export default function Loading({ label = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16">
      <motion.div
        className="w-10 h-10 rounded-full border-4 border-brand-purple border-t-transparent"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
      />
      <p className="text-slate-400 text-sm">{label}</p>
    </div>
  );
}
