"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleRegister = async () => {
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signUp({ email, password, options: { data: { name } } });
      if (error) throw error;
      setMessage("Account created. Check your email to confirm, then log in.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Registration failed");
    }
  };
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sand-50 via-white to-amber-50 px-6 dark:from-ink-950 dark:via-ink-900 dark:to-ink-950">
      <div className="w-full max-w-md rounded-3xl border border-slate-200/40 bg-white/90 p-8 shadow-soft dark:border-white/10 dark:bg-ink-900/80">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-sand-50">Create an account</h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-sand-200">Your data stays private to your account.</p>
        <div className="mt-6 space-y-3">
          <input
            type="text"
            placeholder="Full name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="w-full rounded-2xl border border-slate-200/60 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-ink-950"
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-2xl border border-slate-200/60 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-ink-950"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-2xl border border-slate-200/60 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-ink-950"
          />
          <button
            type="button"
            onClick={handleRegister}
            className="btn w-full rounded-full bg-slate-900 px-5 py-3 text-xs font-semibold uppercase tracking-[0.25em] text-white dark:bg-sand-200 dark:text-ink-900"
          >
            Create Account
          </button>
          {message && <p className="text-xs text-slate-500 dark:text-sand-200">{message}</p>}
        </div>
      </div>
    </div>
  );
}
