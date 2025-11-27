import axios from "axios";

// Backend URL (from .env or fallback)
const BACKEND = import.meta.env.VITE_API_URL || "http://localhost:5000";

// FINAL axios client
const API = axios.create({
  baseURL: `${BACKEND}/api`,   // <-- THIS IS THE ONLY VALID baseURL
  timeout: 20000,
  headers: {
    "Content-Type": "application/json",
  },
});

API.interceptors.request.use((config) => {
  const token =
    localStorage.getItem("authToken") ||
    sessionStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
