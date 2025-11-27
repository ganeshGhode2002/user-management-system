import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import API from "@/api/axios"; // make sure this points to baseURL: `${VITE_API_URL}/api`

export default function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "", remember: false });
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((s) => ({ ...s, [name]: type === "checkbox" ? checked : value }));
  }

  function validate() {
    if (!form.email.trim()) return "Email is required";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return "Enter a valid email";
    if (!form.password) return "Password is required";
    return null;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const err = validate();
    if (err) return toast.error(err);

    setLoading(true);
    try {
      // adjust endpoint if your backend uses a different route (e.g. /auth/login)
      const res = await API.post("/users/login", {
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });

      // expected shapes:
      // 1) { token: "...", user: {...} }
      // 2) { success: true, data: { token, user } }
      const payload = res.data?.data ?? res.data;
      const token = payload?.token ?? res.data?.token;
      const user = payload?.user ?? res.data?.user ?? payload;

      if (!token && !user) {
        // maybe the API returns { success: true } or message-only
        toast.error(res.data?.message || "Login failed");
        return;
      }

      // Save token (or user) depending on your backend
      if (token) {
        // remember: if user unchecks remember => sessionStorage (clears on tab close)
        const storage = form.remember ? localStorage : sessionStorage;
        storage.setItem("authToken", token);
      }

      // optionally store user info
      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
      }

      toast.success("Logged in successfully");
      // navigate to dashboard/home
      navigate("/dashboard");
    } catch (error) {
      console.error("login error", error);
      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Server error — login failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-white p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border p-6">
        <h2 className="text-2xl font-semibold text-slate-900 mb-1">Welcome back</h2>
        <p className="text-sm text-slate-500 mb-6">Login to manage your account and access the dashboard.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Email</span>
            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              type="email"
              autoComplete="email"
              className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              placeholder="you@example.com"
            />
          </label>

          <label className="block">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">Password</span>
              <span className="text-xs text-slate-400">{/* optional forgot link */}</span>
            </div>

            <div className="mt-1 relative">
              <input
                name="password"
                value={form.password}
                onChange={handleChange}
                type={showPw ? "text" : "password"}
                autoComplete="current-password"
                className="block w-full rounded-lg border border-slate-200 px-3 py-2 pr-12 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                placeholder="Enter your password"
              />
              <button
                type="button"
                aria-label={showPw ? "Hide password" : "Show password"}
                onClick={() => setShowPw((s) => !s)}
                className="absolute right-2 top-2.5 text-sm text-slate-500 px-2 py-1 rounded"
              >
                {showPw ? "Hide" : "Show"}
              </button>
            </div>
          </label>

          <div className="flex items-center justify-between">
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="remember"
                checked={form.remember}
                onChange={handleChange}
                className="w-4 h-4 rounded border-slate-300"
              />
              <span className="text-slate-600">Remember me</span>
            </label>

            <button
              type="button"
              onClick={() => navigate("/forgot-password")}
              className="text-sm text-indigo-600 hover:underline"
            >
              Forgot?
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 font-medium transition ${
              loading ? "bg-slate-300 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700 text-white"
            }`}
          >
            {loading ? (
              <>
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                  <path fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                Logging in...
              </>
            ) : (
              "Sign in"
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-500">
          Don’t have an account?{" "}
          <button onClick={() => navigate("/register")} className="text-indigo-600 hover:underline">
            Register
          </button>
        </div>
      </div>
    </div>
  );
}

