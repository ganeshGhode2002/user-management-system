// src/router/index.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "@/components/ProtectedRoute";

const LandingPage = React.lazy(() => import("@/pages/Landing/LandingPage.jsx"));
const RegisterPage = React.lazy(() => import("@/pages/Register/RegisterPage.jsx"));
const LoginPage = React.lazy(() => import("@/pages/Login/LoginPage.jsx"));
const DashboardPage = React.lazy(() => import("@/pages/Dashboard/DashboardPage.jsx"));
const ProfilePage = React.lazy(() => import("@/pages/Profile/ProfilePage.jsx"));
const EditUserPage = React.lazy(() => import("@/pages/Dashboard/EditUserPage.jsx"));

function Loader() {
  return (
    <div className="w-full h-40 flex items-center justify-center">
      <div className="text-slate-400">Loading...</div>
    </div>
  );
}

export default function AppRoutes() {
  return (
    <React.Suspense fallback={<Loader />}>
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/profile/:id" element={<ProfilePage />} />
          <Route path="/users/:id/edit" element={<EditUserPage />} />
        </Route>

        {/* fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </React.Suspense>
  );
}
