import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import AuthShell, { AuthField } from '../components/AuthShell';

export default function Login() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd]   = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const { login }  = useAuth();
  const navigate   = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        login(res.data.data.user, res.data.data.token);
        navigate('/');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      headline={<>Welcome back,<br />champion!</>}
      blurb="Your streak is waiting. Jump back in and keep levelling up."
      title="Sign in"
      subtitle={
        <>
          New here?{' '}
          <Link to="/register" className="text-game-purple font-black hover:underline">Create a free account</Link>
        </>
      }
      error={error}
    >
      <form onSubmit={handleLogin} className="space-y-5">
        <AuthField
          label="Email"
          icon={Mail}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="you@example.com"
        />
        <AuthField
          label="Password"
          icon={Lock}
          type={showPwd ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="••••••••"
          trailing={
            <button
              type="button"
              onClick={() => setShowPwd(!showPwd)}
              className="p-1.5 rounded-lg text-[#A9A9BF] hover:text-game-ink"
              tabIndex={-1}
              aria-label={showPwd ? 'Hide password' : 'Show password'}
            >
              {showPwd ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          }
        />

        <button type="submit" disabled={loading} className="btn-primary w-full !py-4 !text-base !mt-7">
          {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Signing in…</> : 'Sign in'}
        </button>
      </form>
    </AuthShell>
  );
}
