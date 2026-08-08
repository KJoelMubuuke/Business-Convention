"use client";

import { useActionState } from "react";
import { forgotPassword } from "../(app)/actions";

export default function ForgotPasswordPage() {
  const [state, action, pending] = useActionState(forgotPassword, null);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-10"
        style={{ backgroundImage: "url('/logo.png')" }}
      />
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <img src="/logo.png" alt="12th Business Convention 2026" className="h-16 w-auto mx-auto object-contain drop-shadow-sm mb-4" />
        </div>

        <div className="bg-white/90 backdrop-blur-md border border-slate-200/50 rounded-3xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Reset Password</h2>
            <p className="text-slate-500 text-sm">Enter your email and we'll send you a reset link</p>
          </div>

          {state?.ok ? (
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-5 py-4 text-emerald-700 text-sm text-center">
              {state.ok}
            </div>
          ) : (
            <form action={action} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoFocus
                  placeholder="you@example.com"
                  className="w-full rounded-xl bg-slate-50 border border-slate-300 px-4 py-2.5 text-slate-900 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                />
              </div>

              {state?.error && (
                <p className="rounded-xl bg-red-50 border border-red-200 px-4 py-2.5 text-sm text-red-600">{state.error}</p>
              )}

              <button
                type="submit"
                disabled={pending}
                className="w-full rounded-xl bg-blue-700 hover:bg-blue-800 px-4 py-2.5 font-semibold text-white transition-all disabled:opacity-50"
              >
                {pending ? "Sending…" : "Send Reset Link"}
              </button>
            </form>
          )}

          <p className="text-center mt-6 text-sm text-slate-500">
            Remembered it? <a href="/login" className="text-blue-600 hover:underline">Sign in</a>
          </p>
        </div>
      </div>
    </div>
  );
}
