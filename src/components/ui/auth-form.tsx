"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface AuthFormProps {
  onSuccess?: () => void;
  redirectTo?: string;
  className?: string;
}

export function AuthForm({ onSuccess, redirectTo = "/", className = "" }: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showEmailConfirm, setShowEmailConfirm] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const supabase = createClient();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (showForgotPassword) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/login`,
        });
        if (error) throw error;
        setResetSent(true);
        return;
      }

      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        onSuccess?.();
      } else {
        if (password.length < 6) {
          throw new Error("Password must be at least 6 characters.");
        }
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        setShowEmailConfirm(true);
        return;
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  // Email confirmation screen
  if (showEmailConfirm) {
    return (
      <div className={`flex flex-col items-center text-center gap-4 ${className}`}>
        <div className="w-12 h-12 rounded-full bg-green-500/10 border border-green-400/30 flex items-center justify-center mb-2">
          <span className="text-green-400 text-xl">✓</span>
        </div>
        <h2 className="text-[24px] font-serif font-light text-[#f7f7f5]">
          Check your email.
        </h2>
        <p className="text-[13px] text-white/50 max-w-[300px]">
          We sent a confirmation link to <span className="text-white/70 font-medium">{email}</span>. Click it to activate your account.
        </p>
        <button
          onClick={() => { setShowEmailConfirm(false); setMode("login"); }}
          className="text-[11px] font-medium text-white/40 hover:text-white/70 transition-colors uppercase tracking-wider mt-4 cursor-pointer"
        >
          Back to sign in
        </button>
      </div>
    );
  }

  // Password reset sent screen
  if (resetSent) {
    return (
      <div className={`flex flex-col items-center text-center gap-4 ${className}`}>
        <h2 className="text-[24px] font-serif font-light text-[#f7f7f5]">
          Reset link sent.
        </h2>
        <p className="text-[13px] text-white/50 max-w-[300px]">
          Check <span className="text-white/70 font-medium">{email}</span> for a password reset link.
        </p>
        <button
          onClick={() => { setResetSent(false); setShowForgotPassword(false); }}
          className="text-[11px] font-medium text-white/40 hover:text-white/70 transition-colors uppercase tracking-wider mt-4 cursor-pointer"
        >
          Back to sign in
        </button>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="mb-8">
        <span className="text-[10px] font-mono tracking-[0.25em] text-white/30 uppercase block mb-2">
          {showForgotPassword ? "PASSWORD RESET" : "SECURE PORTAL"}
        </span>
        <h2 className="text-[28px] font-serif font-light text-[#f7f7f5] leading-tight">
          {showForgotPassword
            ? "Reset password."
            : mode === "login"
            ? "Access Studio."
            : "Register Profile."}
        </h2>
        <p className="text-[12px] font-serif italic text-white/45 mt-2">
          {showForgotPassword
            ? "Enter your email and we'll send a reset link."
            : mode === "login"
            ? "Enter your credentials to access the archives."
            : "Create a secure profile to persist your intelligence dossiers."}
        </p>
      </div>

      <form onSubmit={handleAuth} className="space-y-5">
        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-mono tracking-wider text-white/40 uppercase mb-1.5">
              Email address
            </label>
            <input
              type="email"
              required
              className="w-full bg-[#141412]/60 border border-white/[0.06] focus:border-white/40 px-4 py-2.5 text-[14px] text-white focus:outline-none transition-all duration-300 font-sans rounded-lg"
              placeholder="name@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          {!showForgotPassword && (
            <div>
              <label className="block text-[10px] font-mono tracking-wider text-white/40 uppercase mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                className="w-full bg-[#141412]/60 border border-white/[0.06] focus:border-white/40 px-4 py-2.5 text-[14px] text-white focus:outline-none transition-all duration-300 font-sans rounded-lg"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {mode === "signup" && (
                <p className="text-[10px] text-white/25 mt-1.5">Minimum 6 characters</p>
              )}
            </div>
          )}
        </div>

        {error && (
          <p className="text-[#ff453a]/80 text-[11px] font-medium text-center">
            {error}
          </p>
        )}

        <div className="flex flex-col gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-b from-white to-[#e2e2e7] text-[#1d1d1f] text-[11px] font-semibold tracking-[0.15em] uppercase rounded-full border border-white/20 transition-all duration-200 shadow-sm hover:brightness-95 hover:shadow-md hover:scale-[1.01] active:scale-[0.98] cursor-pointer disabled:opacity-50"
          >
            {loading
              ? "Verifying..."
              : showForgotPassword
              ? "Send Reset Link"
              : mode === "login"
              ? "Initiate Access"
              : "Create Profile"}
          </button>

          {!showForgotPassword && (
            <>
              {mode === "login" && (
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-center text-[10px] font-mono tracking-wider text-white/25 hover:text-white/50 transition-colors uppercase cursor-pointer"
                >
                  Forgot password?
                </button>
              )}
              <button
                type="button"
                onClick={() => setMode(mode === "login" ? "signup" : "login")}
                className="text-center text-[10px] font-mono tracking-wider text-white/30 hover:text-white/60 transition-colors uppercase py-1 cursor-pointer"
              >
                {mode === "login" ? "Need an account? Register" : "Have an account? Access"}
              </button>
            </>
          )}

          {showForgotPassword && (
            <button
              type="button"
              onClick={() => setShowForgotPassword(false)}
              className="text-center text-[10px] font-mono tracking-wider text-white/30 hover:text-white/60 transition-colors uppercase py-1 cursor-pointer"
            >
              Back to sign in
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
