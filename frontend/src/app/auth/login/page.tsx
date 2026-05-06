'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '../../../utils/api';
import { useAuthStore } from '../../../store/useAuthStore';
import { motion } from 'framer-motion';
import { Mail, Lock, ShoppingBag, ArrowRight } from 'lucide-react';

export default function Login() {
  const router = useRouter();
  const loginStore = useAuthStore((state) => state.login);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;
      loginStore(token, user);
      router.push('/');
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-zinc-950 px-6 py-12">
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-1/4 h-80 w-80 rounded-full bg-indigo-500/10 blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-violet-500/10 blur-[120px] pointer-events-none"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Brand logo */}
        <div className="flex flex-col items-center mb-8">
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/20 dark:border-zinc-800/20 shadow-md p-1.5">
              <img src="/favicon.ico" alt="TATAmart Logo" className="h-full w-full object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black text-white">TATAmart</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">Enterprise Trading</span>
            </div>
          </Link>
        </div>

        {/* Auth Glass Card */}
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-8 shadow-2xl backdrop-blur-xl">
          <h2 className="font-inter text-2xl font-bold tracking-tight text-white mb-2">Welcome Back</h2>
          <p className="text-sm font-semibold text-zinc-400 mb-6">Sign in to your enterprise trade portal</p>

          {error && (
            <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3.5 text-xs font-bold text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
                Corporate Email Address
              </label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3.5 h-4 w-4 text-zinc-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950/50 py-3 pl-11 pr-4 text-sm font-semibold text-white outline-none focus:border-indigo-500 transition-colors placeholder-zinc-600"
                  id="input-login-email"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
                Secret Password
              </label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3.5 h-4 w-4 text-zinc-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950/50 py-3 pl-11 pr-4 text-sm font-semibold text-white outline-none focus:border-indigo-500 transition-colors placeholder-zinc-600"
                  id="input-login-password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-600/15 transition-all hover:shadow-indigo-500/25 disabled:opacity-50 mt-6"
              id="btn-login-submit"
            >
              {loading ? <span>Connecting...</span> : (
                <>
                  <span>Access Portal</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-xs font-semibold text-zinc-400 border-t border-zinc-800/80 pt-6">
            <span>Don't have an account? </span>
            <Link href="/auth/register" className="text-indigo-400 hover:text-indigo-300" id="link-register">
              Create an Account
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
