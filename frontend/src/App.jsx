import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Sidebar from "./components/Sidebar.jsx";
import Footer from "./components/Footer.jsx";
import Landing from "./pages/Landing.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Prediction from "./pages/Prediction.jsx";
import Analytics from "./pages/Analytics.jsx";
import History from "./pages/History.jsx";
import Profile from "./pages/Profile.jsx";

function RequireAuth({ children }) {
  const isAuthed = !!localStorage.getItem("placementai_token");
  return isAuthed ? children : <Navigate to="/login" replace />;
}

function AppLayout({ children, withSidebar }) {
  return (
    <div className="min-h-screen bg-slate-950 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 flex gap-6">
        {withSidebar && <Sidebar />}
        <div className="flex-1">{children}</div>
      </div>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout><Landing /></AppLayout>} />
        <Route path="/login" element={<AppLayout><Login /></AppLayout>} />
        <Route path="/register" element={<AppLayout><Register /></AppLayout>} />

        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <AppLayout withSidebar><Dashboard /></AppLayout>
            </RequireAuth>
          }
        />
        <Route
          path="/prediction"
          element={
            <RequireAuth>
              <AppLayout withSidebar><Prediction /></AppLayout>
            </RequireAuth>
          }
        />
        <Route
          path="/analytics"
          element={
            <RequireAuth>
              <AppLayout withSidebar><Analytics /></AppLayout>
            </RequireAuth>
          }
        />
        <Route
          path="/history"
          element={
            <RequireAuth>
              <AppLayout withSidebar><History /></AppLayout>
            </RequireAuth>
          }
        />
        <Route
          path="/profile"
          element={
            <RequireAuth>
              <AppLayout withSidebar><Profile /></AppLayout>
            </RequireAuth>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
