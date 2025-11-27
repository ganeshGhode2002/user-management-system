// src/router/index.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// lazy pages (placeholders or real pages)
const RegisterPage = React.lazy(() =>
  import("@/pages/Register/RegisterPage.jsx").catch(() => ({ default: () => <div>Register Page (not created)</div> }))
);
const LoginPage = React.lazy(() =>
  import("@/pages/Login/LoginPage.jsx").catch(() => ({ default: () => <div>Login Page (not created)</div> }))
);
const DashboardPage = React.lazy(() =>
  import("@/pages/Dashboard/DashboardPage.jsx").catch(() => ({ default: () => <div>Dashboard Page (not created)</div> }))
);
const ProfilePage = React.lazy(() =>
  import("@/pages/Profile/ProfilePage.jsx").catch(() => ({ default: () => <div>Profile Page (not created)</div> }))
);

function Loader() {
  return (
    <div className="w-full h-40 flex items-center justify-center">
      <div className="text-slate-50">Loading...</div>
    </div>
  );
}

export default function AppRoutes() {
  return (
    <React.Suspense fallback={<Loader />}>
      <Routes>
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/" element={<DashboardPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </React.Suspense>
  );
}
