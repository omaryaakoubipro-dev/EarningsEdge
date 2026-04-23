'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { TrendingUp, Eye, EyeOff } from 'lucide-react';

interface Props {
  mode: 'login' | 'signup';
}

export default function AuthForm({ mode }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
        });
        if (error) throw error;
        setSuccess('Check your email for a confirmation link.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-6">
            <div className="w-9 h-9 bg-accent rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">EarningsEdge</span>
          </div>
          <h1 className="text-xl font-semibold text-white">
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            {mode === 'login'
              ? 'Sign in to your EarningsEdge account'
              : 'Start monitoring earnings with AI'}
          </p>
        </div>

        <div className="card p-6 shadow-xl shadow-black/30">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="label">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="input"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label htmlFor="password" className="label">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === 'signup' ? 'Min. 8 characters' : '••••••••'}
                  className="input pr-10"
                  required
                  minLength={mode === 'signup' ? 8 : undefined}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-miss text-sm bg-miss/10 border border-miss/30 rounded-lg px-3 py-2">
                {error}
              </p>
            )}
            {success && (
              <p className="text-beat text-sm bg-beat/10 border border-beat/30 rounded-lg px-3 py-2">
                {success}
              </p>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
              {loading
                ? mode === 'login' ? 'Signing in…' : 'Creating account…'
                : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-5">
            {mode === 'login' ? (
              <>
                Don&apos;t have an account?{' '}
                <Link href="/auth/signup" className="text-accent hover:text-accent-hover font-medium">
                  Sign up free
                </Link>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <Link href="/auth/login" className="text-accent hover:text-accent-hover font-medium">
                  Sign in
                </Link>
              </>
            )}
          </p>
        </div>

        {/* Feature highlights */}
        <div className="mt-8 grid grid-cols-3 gap-3 text-center">
          {[
            { emoji: '🤖', label: 'AI Analysis' },
            { emoji: '📊', label: 'Real-time Data' },
            { emoji: '📱', label: 'Telegram Alerts' },
          ].map(({ emoji, label }) => (
            <div key={label} className="text-xs text-gray-500">
              <span className="text-lg block mb-1">{emoji}</span>
              {label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
