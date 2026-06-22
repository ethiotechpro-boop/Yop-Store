'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';

export default function AdminLogin() {
  const router = useRouter();
  const [email,      setEmail]      = useState('');
  const [password,   setPassword]   = useState('');
  const [remember,   setRemember]   = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState(null);
  const [showPass,   setShowPass]   = useState(false);

  // Load saved credentials on mount
  useEffect(() => {
    const savedEmail    = localStorage.getItem('adminSavedEmail');
    const savedPassword = localStorage.getItem('adminSavedPassword');
    if (savedEmail && savedPassword) {
      setEmail(savedEmail);
      setPassword(savedPassword);
      setRemember(true);
    }
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error: dbError } = await supabase
      .from('admin_users')
      .select('id')
      .eq('email', email.trim().toLowerCase())
      .eq('password', password)
      .maybeSingle();

    setLoading(false);

    if (dbError || !data) {
      setError('❌ Invalid Admin Email or Password');
      return;
    }

    // Save or clear remembered credentials
    if (remember) {
      localStorage.setItem('adminSavedEmail',    email.trim().toLowerCase());
      localStorage.setItem('adminSavedPassword', password);
    } else {
      localStorage.removeItem('adminSavedEmail');
      localStorage.removeItem('adminSavedPassword');
    }

    localStorage.setItem('isAdminAuthenticated', 'true');
    router.push('/admin');
  }

  const inputBase =
    'w-full rounded-lg bg-slate-800 border px-4 py-3 text-sm text-white placeholder-slate-500 ' +
    'focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition';

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-4">

      {/* Card */}
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <a href="/" className="inline-block">
            <span className="text-3xl font-black tracking-tighter text-white">
              YOP <span className="text-amber-500">STORE</span>
            </span>
          </a>
          <p className="mt-2 text-xs text-slate-500 uppercase tracking-widest font-semibold">
            Admin Gateway
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-8">
          <div className="mb-6">
            <h1 className="text-xl font-bold text-white">Sign in to Dashboard</h1>
            <p className="text-xs text-slate-500 mt-1">
              Restricted access — authorised personnel only.
            </p>
          </div>

          {/* Error banner */}
          {error && (
            <div className="mb-5 flex items-center gap-3 rounded-lg bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-400 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Admin Email
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                placeholder="admin@yopstore.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className={`${inputBase} ${error ? 'border-red-500/50' : 'border-slate-700'}`}
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className={`${inputBase} pr-11 ${error ? 'border-red-500/50' : 'border-slate-700'}`}
                />
                {/* Show/hide toggle */}
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPass ? (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                    </svg>
                  ) : (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={e => setRemember(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="h-4 w-4 rounded border border-slate-600 bg-slate-800 peer-checked:bg-amber-500 peer-checked:border-amber-500 transition-colors flex items-center justify-center">
                  {remember && (
                    <svg className="h-2.5 w-2.5 text-slate-950" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5} aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                    </svg>
                  )}
                </div>
              </div>
              <span className="text-xs text-slate-400">Remember my email &amp; password</span>
            </label>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex items-center justify-center gap-2 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:bg-amber-800 disabled:cursor-not-allowed px-6 py-3 text-sm font-bold text-slate-950 transition-colors"
            >
              {loading ? (
                <>
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Verifying…
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"/>
                  </svg>
                  Sign In
                </>
              )}
            </button>
          </form>
        </div>

        {/* Back to storefront */}
        <p className="mt-6 text-center text-xs text-slate-600">
          Not an admin?{' '}
          <a href="/" className="text-amber-500 hover:text-amber-400 font-semibold transition-colors">
            ← Return to Storefront
          </a>
        </p>
      </div>
    </div>
  );
}
