import React from "react";
import { BrowserRouter } from "react-router-dom";
import MainLayout from "@/layouts/MainLayout";
import AppRoutes from "@/router";
import { AuthProvider } from "@/context/AuthContext";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <MainLayout>
          <AppRoutes />
        </MainLayout>
      </AuthProvider>
    </BrowserRouter>
  );
}
