// // src/api/axios.js
// import axios from "axios";

// /* ---------------------------------------------
//    ENV HANDLING (CLEAN & SAFE)
// ---------------------------------------------- */
// const API_URL = import.meta.env.VITE_API_URL?.replace(/\/+$/, "") || 
//                 "http://localhost:5000/api";

// const SERVER_URL =
//   import.meta.env.VITE_SERVER_URL?.replace(/\/+$/, "") ||
//   API_URL.replace(/\/api$/i, "") ||
//   "http://localhost:5000";

// /* ---------------------------------------------
//    AXIOS INSTANCE
// ---------------------------------------------- */
// const API = axios.create({
//   baseURL: API_URL,
//   timeout: 15000,
// });

// /* ---------------------------------------------
//    GET TOKEN HELPER
// ---------------------------------------------- */
// function getToken() {
//   return (
//     localStorage.getItem("authToken") ||
//     sessionStorage.getItem("authToken") ||
//     null
//   );
// }

// /* ---------------------------------------------
//    REQUEST INTERCEPTOR
// ---------------------------------------------- */
// API.interceptors.request.use(
//   (config) => {
//     const token = getToken();
//     if (token) {
//       config.headers = config.headers || {};
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// /* ---------------------------------------------
//    RESPONSE INTERCEPTOR (HANDLE 401)
// ---------------------------------------------- */
// API.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     const status = error?.response?.status;

//     if (status === 401) {
//       // clear all auth data
//       localStorage.removeItem("authToken");
//       localStorage.removeItem("user");
//       sessionStorage.removeItem("authToken");

//       // notify app (Navbar, Providers)
//       window.dispatchEvent(
//         new CustomEvent("authChanged", {
//           detail: { token: null, user: null },
//         })
//       );
//     }

//     return Promise.reject(error);
//   }
// );

// /* ---------------------------------------------
//    EXPORTS
// ---------------------------------------------- */
// export const SERVER_BASE = SERVER_URL;
// export default API;


// src/api/axios.js
import axios from "axios";

/* ---------------------------------------------
   ENV HANDLING (CLEAN & SAFE)
---------------------------------------------- */
/**
 * Priority:
 * 1. VITE_API_URL (e.g. https://your-frontend-or-server/api)
 * 2. VITE_SERVER_URL  (e.g. https://your-server)
 * 3. FALLBACK to Render URL (production)
 *
 * Always strip trailing slashes.
 */
const RENDER_SERVER_FALLBACK = "https://user-management-system-4ttm.onrender.com";

const rawApiUrl = import.meta.env.VITE_API_URL;
const rawServerUrl = import.meta.env.VITE_SERVER_URL;

const API_URL =
  (rawApiUrl && rawApiUrl.replace(/\/+$/, "")) ||
  // if only VITE_SERVER_URL provided, assume /api
  ((rawServerUrl && rawServerUrl.replace(/\/+$/, "") + "/api") ||
    // or use render fallback + /api
    `${RENDER_SERVER_FALLBACK}/api`);

const SERVER_URL =
  (rawServerUrl && rawServerUrl.replace(/\/+$/, "")) ||
  // derive from API_URL if it ends with /api
  (API_URL.replace(/\/api$/i, "") || RENDER_SERVER_FALLBACK);

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