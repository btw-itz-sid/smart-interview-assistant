import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Mail, Lock, User as UserIcon, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';
import AppLogo from '../components/AppLogo';

const features = [
  'Interview questions tailored to any topic',
  'Per-answer scoring and written feedback',
  'Topic-wise progress and streak tracking',
  'ATS resume analyzer with 5-dimension score',
];

export default function Register() {
  const [name, setName]       = useState('');
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const { login }  = useAuth();
  const navigate   = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/register', { name, email, password });
      if (res.data.success) {
        login(res.data.data.user, res.data.data.token);
        navigate('/');
      }
    } catch (err: any) {
      if (err.response?.data?.errors) {
        setError(err.response.data.errors[0].message);
      } else {
        setError(err.response?.data?.message || 'Registration failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* ── Left panel ── */}
      <div className="hidden lg:flex lg:w-[45%] relative auth-bg flex-col justify-between p-12 overflow-hidden">

        {/* Logo */}
        <div className="flex items-center gap-3 relative z-10">
          <AppLogo size={36} />
          <span className="text-white font-semibold" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Smart Interview
          </span>
        </div>

        {/* Center content */}
        <div className="relative z-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-indigo-400 mb-5">Get started free</p>
          <h2 className="text-4xl font-bold text-white leading-[1.15] mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Built for serious<br />
            job seekers.
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed max-w-[280px] mb-9">
            No generic questions. Every session is tailored to your topic, difficulty, and target company.
          </p>

          <div className="space-y-0">
            {features.map((f) => (
              <div key={f} className="flex items-center gap-3 py-3 border-b border-white/[0.06]">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 flex-shrink-0" />
                <span className="text-sm text-slate-300">{f}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-slate-700 text-xs relative z-10">© 2026 Smart Interview Assistant</p>
      </div>

      {/* ── Right panel (form) ── */}
      <div className="flex-1 flex items-center justify-center p-6 bg-white">
        <div className="w-full max-w-sm animate-scale-in">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <AppLogo size={30} />
            <span className="font-semibold text-slate-900" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Smart Interview
            </span>
          </div>

          <h1 className="text-2xl font-bold text-slate-900 mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Create your account
          </h1>
          <p className="text-slate-500 text-sm mb-7">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-600 font-semibold hover:text-indigo-700 transition-colors">
              Sign in
            </Link>
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm mb-5 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">
                Full Name
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Rahul Sharma"
                  className="input-field pl-10"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="input-field pl-10"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="Min. 6 characters"
                  className="input-field pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 mt-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account…
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Create free account <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </button>

            <p className="text-center text-[11px] text-slate-400 mt-3">
              By creating an account, you agree to our Terms of Service.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
