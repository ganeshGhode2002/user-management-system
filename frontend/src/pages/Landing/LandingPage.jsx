import React from "react";
import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <div className="min-h-[72vh] flex items-center justify-center bg-linear-to-b from-slate-50 to-white">
      <div className="max-w-6xl mx-auto px-6  lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          {/* Left */}
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-sm font-medium">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M12 2v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M20 12h-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 20v-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M4 12h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Secure • Fast • Modern
            </div>

            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900">
              Manage users with clarity — secure, fast and beautiful.
            </h1>

            <p className="text-lg text-slate-600 max-w-2xl">
              A modern user management system — onboard users, manage profiles, and keep control with role-based access. Sign up to get started or try the demo.
            </p>

            <div className="flex items-center gap-4 mt-4">
              <Link to="/register" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-indigo-600 text-white text-sm font-semibold shadow hover:bg-indigo-700">
                Get started — Register
              </Link>

              <Link to="/login" className="inline-flex items-center gap-2 px-5 py-2 rounded-lg border border-slate-200 text-sm font-medium hover:bg-slate-50">
                Login
              </Link>
            </div>

            <div className="mt-8 text-sm text-slate-500">
              <span className="font-medium text-slate-700">Pro tip:</span> You can protect routes so only authenticated users can view the full users list and edit profiles.
            </div>
          </div>

          {/* Right - feature cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl p-5 shadow-lg border border-slate-100">
              <h3 className="font-semibold text-slate-900">Secure access</h3>
              <p className="mt-2 text-sm text-slate-500">JWT token based auth; only authenticated users access the dashboard and profile editing features.</p>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-lg border border-slate-100">
              <h3 className="font-semibold text-slate-900">Responsive design</h3>
              <p className="mt-2 text-sm text-slate-500">Beautiful UI that adapts to mobile, tablet and desktop — ready for 2025.</p>
            </div>

            <div className="bg-gradient-to-br from-indigo-600 to-sky-500 text-white rounded-2xl p-5 shadow-xl">
              <h3 className="font-semibold text-white">Fast admin tools</h3>
              <p className="mt-2 text-sm">Search, edit, delete and paginate users with smooth UI interactions.</p>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-lg border border-slate-100">
              <h3 className="font-semibold text-slate-900">Extensible</h3>
              <p className="mt-2 text-sm text-slate-500">Add roles, email verification, or public profile toggles as your app grows.</p>
            </div>
          </div>
        </div>

        {/* Bottom spotlight: small public preview */}
        <div className="mt-10 bg-slate-900 text-white rounded-2xl p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <h4 className="font-semibold">Preview</h4>
            <p className="text-sm text-slate-200 mt-2">Only authenticated users see the full dashboard with the user list and edit controls.</p>
          </div>
          <div>
            <h4 className="font-semibold">Privacy</h4>
            <p className="text-sm text-slate-200 mt-2">We don’t expose private user data publicly by default.</p>
          </div>
          <div className="text-right md:text-left">
            <Link to="/register" className="inline-block px-4 py-2 mt-2 rounded-lg bg-white text-indigo-700 font-semibold">Create account</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
