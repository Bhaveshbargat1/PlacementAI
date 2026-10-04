export default function Footer() {
  return (
    <footer className="text-center text-slate-500 text-sm py-8">
      © {new Date().getFullYear()} PlacementAI by Bhavesh Bargat. Built with FastAPI, XGBoost & React.
    </footer>
  );
}
