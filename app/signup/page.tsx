"use client";

import { useActionState } from "react";
import { signup } from "../(app)/actions";

export default function SignupPage() {
  const [state, action, pending] = useActionState(signup, null);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <div
        className="w-full max-w-3xl flex rounded-3xl overflow-hidden shadow-2xl"
        style={{ minHeight: "460px" }}
      >
        {/* ── LEFT BRAND PANEL ───────────────────────────────────────── */}
        <div
          className="hidden md:flex flex-col items-center justify-center gap-6 w-2/5 relative p-10"
          style={{
            background:
              "linear-gradient(145deg, #0f2d6e 0%, #1a4fbf 55%, #e85d20 100%)",
          }}
        >
          {/* decorative blob */}
          <div
            className="absolute -bottom-10 -right-10 w-48 h-48 rounded-full opacity-20"
            style={{ background: "#e85d20" }}
          />
          <div
            className="absolute -top-10 -left-10 w-36 h-36 rounded-full opacity-10"
            style={{ background: "#ffffff" }}
          />

          {/* Logo */}
          <img
            src="/logo.png"
            alt="12th Business Convention 2026"
            className="relative z-10 w-full max-w-[220px] object-contain drop-shadow-xl"
          />

          {/* Tag line */}
          <div className="relative z-10 text-center">
            <p className="text-white/90 text-sm font-medium leading-relaxed">
              Already have an account?
            </p>
            <a
              href="/login"
              className="mt-3 inline-block border-2 border-white/70 text-white text-sm font-semibold px-6 py-2 rounded-full hover:bg-white hover:text-blue-900 transition-all duration-200"
            >
              SIGN IN
            </a>
          </div>
        </div>

        {/* ── RIGHT FORM PANEL ────────────────────────────────────────── */}
        <div className="flex flex-col justify-center bg-white w-full md:w-3/5 px-10 py-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-1">
            Create Account
          </h2>
          <p className="text-slate-400 text-sm mb-8">
            Sign up to access the registration system
          </p>

          <form action={action} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5"
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                autoFocus
                placeholder="you@example.com"
                className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
                placeholder="Min. 6 characters"
                className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>

            {state?.error && (
              <p className="rounded-xl bg-red-50 border border-red-200 px-4 py-2.5 text-sm text-red-600">
                {state.error}
              </p>
            )}

            {state?.ok && (
              <p className="rounded-xl bg-green-50 border border-green-200 px-4 py-2.5 text-sm text-green-700">
                {state.ok}
              </p>
            )}

            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-xl py-3 font-bold text-sm text-white shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: pending
                  ? "#94a3b8"
                  : "linear-gradient(90deg, #e85d20 0%, #f08040 100%)",
                boxShadow: pending ? "none" : "0 4px 20px rgba(232,93,32,0.35)",
              }}
            >
              {pending ? "Creating account…" : "SIGN UP"}
            </button>
          </form>

          {/* mobile-only sign-in link */}
          <p className="md:hidden text-center mt-6 text-sm text-slate-500">
            Already have an account?{" "}
            <a href="/login" className="text-blue-600 hover:underline font-medium">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
