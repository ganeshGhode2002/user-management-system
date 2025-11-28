// src/layouts/MainLayout.jsx
import React from "react";
import { useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Toaster } from "sonner";

export default function MainLayout({ children }) {
  const { pathname } = useLocation();

  // Pages where navbar should NOT show
  const hideNavbar = ["/login", "/register"].includes(pathname);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      
      {/* Navbar hidden on login/register */}
      {!hideNavbar && <Navbar />}

      {/* Page content */}
      <main className="flex-1 w-full container mx-auto px-4 py-6">
        {children}
      </main>

      {/* Footer */}
      {!hideNavbar && (
        <footer className="text-center text-sm py-4 text-slate-500">
          © {new Date().getFullYear()} — User Management Made By ❤️ Ganesh Ghode
        </footer>
      )}

      {/* Global toaster (shadcn-sonner) */}
      <Toaster richColors position="top-right" />
    </div>
  );
}
