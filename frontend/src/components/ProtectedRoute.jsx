// src/components/ProtectedRoute.jsx
import React, { useContext } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { AuthContext } from "@/context/AuthContext";

export default function ProtectedRoute({ children, redirectTo = "/login" }) {
  const { token } = useContext(AuthContext);
  const location = useLocation();

  // If token exists, allow access
  if (token) {
    return children ?? <Outlet />;
  }

  // Otherwise redirect to login and keep the original location
  return <Navigate to={redirectTo} state={{ from: location }} replace />;
}
