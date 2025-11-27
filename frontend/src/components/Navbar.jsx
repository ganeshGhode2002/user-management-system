// src/components/Navbar.jsx
import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AuthContext } from "@/context/AuthContext";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const nav = useNavigate();

  return (
    <header className="bg-white border-b">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-linear-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white font-bold">
            UM
          </div>
          <div>
            <Link to="/" className="text-lg font-semibold text-slate-800">User Management</Link>
            <div className="text-xs text-slate-500">Manage Users</div>
          </div>
        </div>

        <nav className="flex items-center gap-3">
          <Link to="/" className="text-sm text-slate-600 hover:text-slate-800">Users</Link>
          <Link to="/register" className="text-sm text-slate-600 hover:text-slate-800">Register</Link>

          {user ? (
            <Button size="sm" onClick={() => { logout(); nav("/login"); }}>
              Logout
            </Button>
          ) : (
            <Button variant="default" size="sm" onClick={() => nav("/login")}>
              Login
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
