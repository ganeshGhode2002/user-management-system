// src/api/axios.js
import axios from "axios";

// Default Render backend URL
const RENDER_SERVER_FALLBACK = "https://user-management-system-4ttm.onrender.com";

// Extract environment variables
const rawApiUrl = import.meta.env.VITE_API_URL;
const rawServerUrl = import.meta.env.VITE_SERVER_URL;

// Determine API URL
const API_URL = 
  (rawApiUrl && rawApiUrl.replace(/\/+$/, "")) ||
  ((rawServerUrl && rawServerUrl.replace(/\/+$/, "") + "/api") ||
    `${RENDER_SERVER_FALLBACK}/api`);

// Determine SERVER URL (without /api)
const SERVER_URL =
  (rawServerUrl && rawServerUrl.replace(/\/+$/, "")) ||
  API_URL.replace(/\/api$/i, "") ||
  RENDER_SERVER_FALLBACK;

// Create axios instance
const API = axios.create({
  baseURL: API_URL,
  timeout: 15000,
});

// Get authentication token from storage
function getToken() {
  return localStorage.getItem("authToken") || 
         sessionStorage.getItem("authToken") || 
         null;
}

// Request interceptor - add auth token to headers
API.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle 401 unauthorized
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      // Clear auth data
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      sessionStorage.removeItem("authToken");

      // Notify app of auth change
      window.dispatchEvent(
        new CustomEvent("authChanged", {
          detail: { token: null, user: null },
        })
      );
    }
    return Promise.reject(error);
  }
);

// Export
export const SERVER_BASE = SERVER_URL;
export default API;