import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const api = axios.create({ baseURL: API_BASE_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("placementai_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const register = (payload) => api.post("/register", payload);

export const login = (email, password) => {
  const form = new URLSearchParams();
  form.append("username", email);
  form.append("password", password);
  return api.post("/login", form, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
};

export const predict = (payload) => api.post("/predict", payload);
export const getHistory = () => api.get("/history");
export const getRecommendations = () => api.get("/recommendations");
export const getAnalytics = () => api.get("/analytics");

export default api;
