import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import API from "@/api/axios";
import { AuthContext } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const navigate = useNavigate();
  const auth = useContext(AuthContext);

  const [form, setForm] = useState({
    email: "",
    password: "",
    remember: false,
  });
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  function change(e) {
    const { name, value, type, checked } = e.target;
    setForm((s) => ({ ...s, [name]: type === "checkbox" ? checked : value }));
  }

  function validate() {
    if (!form.email.trim()) return "Email is required";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return "Enter a valid email";
    if (!form.password.trim()) return "Password is required";
    return null;
  }

  async function submit(e) {
    e.preventDefault();
    const err = validate();
    if (err) return toast.error(err);

    setLoading(true);
    try {
      const res = await API.post("/users/login", {
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });

      const token = res.data?.token || res.data?.data?.token;
      const user = res.data?.user || res.data?.data?.user;

      if (!token || !user) {
        toast.error(res.data?.message || "Login failed");
        return;
      }

      auth.login({ token, user, remember: form.remember });

      toast.success("Welcome back!");
      navigate("/dashboard", { replace: true });
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Server error";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-100 to-white px-4 py-12">
      <div className="w-full max-w-md bg-white shadow-xl border border-slate-200 rounded-2xl p-8">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center">
            UM
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Welcome back</h1>
            <p className="text-sm text-slate-600 mt-1">
              Login to access your dashboard.
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={submit} className="space-y-5" noValidate>
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              name="email"
              value={form.email}
              onChange={change}
              type="email"
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-200 focus:outline-none"
              placeholder="you@example.com"
            />
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-slate-700">
                Password
              </label>
              <button
                type="button"
                className="text-xs text-indigo-600 hover:underline"
              >
                Forgot?
              </button>
            </div>

            <div className="mt-2 relative">
              <input
                name="password"
                value={form.password}
                onChange={change}
                type={showPw ? "text" : "password"}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 pr-16 text-sm focus:ring-2 focus:ring-indigo-200 focus:outline-none"
                placeholder="Enter password"
              />

              <button
                type="button"
                onClick={() => setShowPw((s) => !s)}
                className="absolute right-2 top-2.5 text-xs text-slate-500 px-2 py-1 hover:bg-slate-100 rounded"
              >
                {showPw ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {/* Remember me */}
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="remember"
              checked={form.remember}
              onChange={change}
              className="h-4 w-4"
            />
            Remember me
          </label>

          {/* Submit */}
          <Button className="w-full py-3 bg-blue-600 text-white hover:bg-blue-700 cursor-pointer" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </Button>

          {/* Register link */}
          <p className="text-sm mt-4 text-center text-slate-600">
            New here?{" "}
            <button
              type="button"
              onClick={() => navigate("/register")}
              className="text-indigo-600 hover:underline"
            >
              Create an account
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}
