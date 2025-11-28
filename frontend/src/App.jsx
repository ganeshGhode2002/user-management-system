// src/App.jsx
import React from "react";
import MainLayout from "@/layouts/MainLayout";
import AppRoutes from "@/router";

export default function App() {
  return (
    <MainLayout>
      <AppRoutes />
    </MainLayout>
  );
}
