"use client";

import { useActionState } from "react";
import { signup } from "../(app)/actions/auth.actions";

export default function SignupPage() {
  const [state, action, pending] = useActionState(signup, null);

  return (
    <div className="bg-[#f8f9ff] min-h-screen flex flex-col justify-center items-center p-4 md:p-10 font-sans text-[#0b1c30]">
      <main className="w-full max-w-[440px] bg-white rounded-xl border border-[#c6c6cd] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.04),0_2px_4px_-1px_rgba(0,0,0,0.04)] p-6 md:p-8 relative z-10">
        
        <div className="text-center mb-8">
          <img 
            alt="Business Convention" 
            className="mx-auto mb-4 max-h-[80px] object-contain" 
            src="/logo.png" 
          />
          <h1 className="text-2xl md:text-3xl font-semibold text-[#005596] tracking-tight mb-2">
            Create Account
          </h1>
          <p className="text-base text-[#45464d]">
            Sign up to access the registration system
          </p>
        </div>

        <form action={action} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm text-[#0b1c30] font-medium" htmlFor="email">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-[#005596] text-[20px]">mail</span>
              </div>
              <input 
                className="block w-full pl-10 pr-2 py-[10px] h-[40px] border border-[#c6c6cd] rounded-lg text-base bg-white text-[#0b1c30] placeholder-[#76777d] focus:outline-none focus:ring-2 focus:ring-[#005596] focus:border-transparent transition-shadow" 
                id="email" 
                name="email" 
                placeholder="you@example.com" 
                required 
                type="email"
                autoComplete="email"
                autoFocus
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm text-[#0b1c30] font-medium" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-[#005596] text-[20px]">lock</span>
              </div>
              <input 
                className="block w-full pl-10 pr-2 py-[10px] h-[40px] border border-[#c6c6cd] rounded-lg text-base bg-white text-[#0b1c30] placeholder-[#76777d] focus:outline-none focus:ring-2 focus:ring-[#005596] focus:border-transparent transition-shadow" 
                id="password" 
                name="password" 
                placeholder="Min. 6 characters" 
                required 
                minLength={6}
                type="password"
                autoComplete="new-password"
              />
            </div>
          </div>

          {state?.error && (
            <p className="rounded-lg bg-[#ffdad6] border border-[#ba1a1a]/20 px-4 py-2.5 text-sm text-[#93000a]">
              {state.error}
            </p>
          )}

          {state?.ok && (
            <p className="rounded-lg bg-[#eaf1ff] border border-[#005596]/20 px-4 py-2.5 text-sm text-[#005596]">
              {state.ok}
            </p>
          )}

          <div className="pt-2">
            <button 
              className="w-full h-[40px] bg-[#F15A24] hover:opacity-90 hover:-translate-y-[2px] transition-all duration-200 ease-in-out text-white text-base font-medium rounded-lg shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed" 
              type="submit"
              disabled={pending}
            >
              <span className="material-symbols-outlined text-[20px]">
                {pending ? "hourglass_empty" : "person_add"}
              </span>
              {pending ? "Creating account..." : "Sign Up"}
            </button>
          </div>
        </form>

        <div className="mt-8 text-center text-xs font-bold uppercase tracking-wider text-[#76777d]">
          © 2026 Business Convention. Secured System.
        </div>
        
        <p className="text-center mt-6 text-sm text-[#45464d]">
          Already have an account?{" "}
          <a href="/login" className="text-[#005596] hover:underline font-medium">
            Sign in
          </a>
        </p>
      </main>
    </div>
  );
}
