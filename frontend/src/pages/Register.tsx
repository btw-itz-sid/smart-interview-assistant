import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Mail, Lock, User as UserIcon, Eye, EyeOff, Loader2 } from 'lucide-react';
import AuthShell, { AuthField } from '../components/AuthShell';

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
    <AuthShell
      headline={<>Turn interview prep<br />into a game.</>}
      blurb="Earn XP for every answer, build daily streaks and unlock medals on your way to the offer."
      title="Create your profile"
      subtitle={
        <>
          Already playing?{' '}
          <Link to="/login" className="text-game-purple font-black hover:underline">Sign in</Link>
        </>
      }
      error={error}
    >
      <form onSubmit={handleRegister} className="space-y-5">
        <AuthField
          label="Full name"
          icon={UserIcon}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="Rahul Sharma"
        />
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
          minLength={6}
          placeholder="Min. 6 characters"
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

        <button type="submit" disabled={loading} className="btn-green w-full !py-4 !text-base !mt-7">
          {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Creating account…</> : 'Start playing free'}
        </button>

        <p className="text-center text-xs font-bold text-game-muted">
          By creating an account, you agree to our Terms of Service.
        </p>
      </form>
    </AuthShell>
  );
}
