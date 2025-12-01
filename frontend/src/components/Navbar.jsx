// src/components/Navbar.jsx
import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "@/context/AuthContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success("Logged out");
    navigate("/login", { replace: true });
  };

  return (
    <header className="bg-white/80 backdrop-blur border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold shadow-md">
            UM
          </div>
          <div>
            <h1 className="text-lg font-semibold text-slate-800">User Management</h1>
            <p className="text-xs text-slate-500">Admin Dashboard</p>
          </div>
        </Link>

        {/* Actions */}
        {!user ? (
          <div className="flex items-center gap-3">
            <Link
              to="/register"
              className="text-sm text-slate-600 hover:text-slate-800"
            >
              Register
            </Link>
            <Button size="sm" onClick={() => navigate("/login")}>
              Login
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/dashboard`)}
            >
              Dashboard
            </Button>

            <Button

              size="sm"
              onClick={handleLogout}
            >
              Logout
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
