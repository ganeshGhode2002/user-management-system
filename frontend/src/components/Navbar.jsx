// src/components/Navbar.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button"; // shadcn button
import { cn } from "../lib/utils";

export default function Navbar() {
  const navigate = useNavigate();

  const logout = () => {
    // placeholder: clear auth storage and redirect to login
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <header className="bg-white border-b">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white font-bold">
            UM
          </div>
          <div>
            <Link to="/" className="text-lg font-semibold text-slate-800">
              User Management
            </Link>
            <div className="text-xs text-slate-500">MERN — ShadCN + Tailwind</div>
          </div>
        </div>

        <nav className="flex items-center gap-3">
          <Link to="/" className="hidden sm:inline text-sm text-slate-600 hover:text-slate-800">
            Users
          </Link>
          <Link to="/profile" className="hidden sm:inline text-sm text-slate-600 hover:text-slate-800">
            Profile
          </Link>
          <Button variant="ghost" size="sm" onClick={() => navigate("/register")}>
            Register
          </Button>
          <Button variant="outline" size="sm" onClick={logout}>
            Logout
          </Button>
        </nav>
      </div>
    </header>
  );
}
