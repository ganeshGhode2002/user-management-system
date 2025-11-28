// src/api/axios.js
import axios from "axios";

/* ---------------------------------------------
   ENV HANDLING (CLEAN & SAFE)
---------------------------------------------- */
const API_URL = import.meta.env.VITE_API_URL?.replace(/\/+$/, "") || 
                "http://localhost:5000/api";

const SERVER_URL =
  import.meta.env.VITE_SERVER_URL?.replace(/\/+$/, "") ||
  API_URL.replace(/\/api$/i, "") ||
  "http://localhost:5000";

/* ---------------------------------------------
   AXIOS INSTANCE
---------------------------------------------- */
const API = axios.create({
  baseURL: API_URL,
  timeout: 15000,
});

/* ---------------------------------------------
   GET TOKEN HELPER
---------------------------------------------- */
function getToken() {
  return (
    localStorage.getItem("authToken") ||
    sessionStorage.getItem("authToken") ||
    null
  );
}

/* ---------------------------------------------
   REQUEST INTERCEPTOR
---------------------------------------------- */
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

/* ---------------------------------------------
   RESPONSE INTERCEPTOR (HANDLE 401)
---------------------------------------------- */
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;

    if (status === 401) {
      // clear all auth data
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      sessionStorage.removeItem("authToken");

      // notify app (Navbar, Providers)
      window.dispatchEvent(
        new CustomEvent("authChanged", {
          detail: { token: null, user: null },
        })
      );
    }

    return Promise.reject(error);
  }
);

/* ---------------------------------------------
   EXPORTS
---------------------------------------------- */
export const SERVER_BASE = SERVER_URL;
export default API;
