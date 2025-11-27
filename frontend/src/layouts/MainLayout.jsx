// src/layouts/MainLayout.jsx
import React from "react";
import Navbar from "@/components/Navbar";
import { Toaster } from "sonner";

export default function MainLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <main className="container mx-auto px-4 py-6 flex-1 w-full">
        {children}
      </main>

      <footer className="text-center text-sm py-4 text-slate-500">
        © {new Date().getFullYear()} User Management
      </footer>

      {/* Sonner toaster (positioned globally) */}
      <Toaster richColors position="top-right" />
    </div>
  );
}
