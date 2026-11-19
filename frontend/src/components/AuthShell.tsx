import React from 'react';
import { Link } from 'react-router-dom';
import { Flame, Gem, Trophy, Check, AlertCircle } from 'lucide-react';
import AppLogo from './AppLogo';
import { IconTile } from './Game';

/** Two-panel layout shared by Login and Register. */
export default function AuthShell({
  headline,
  blurb,
  title,
  subtitle,
  error,
  children,
}: {
  headline: React.ReactNode;
  blurb: string;
  title: string;
  subtitle: React.ReactNode;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex bg-white">
      <div className="hidden lg:flex lg:w-[46%] relative auth-bg flex-col justify-between p-12 overflow-hidden text-white">
        <Link to="/" className="flex items-center gap-3 relative z-10">
          <AppLogo size={38} />
          <span className="font-black text-xl">Smart Interview</span>
        </Link>

        <div className="relative z-10">
          <h2 className="text-5xl font-black leading-[1.05] text-outline">{headline}</h2>
          <p className="text-lg font-bold text-white/85 mt-4 max-w-sm">{blurb}</p>

          {/* Floating game cards */}
          <div className="relative h-56 mt-10 max-w-md">
            <div className="absolute left-0 top-0 rounded-3xl bg-white text-game-ink p-4 flex items-center gap-3 animate-floaty" style={{ boxShadow: '0 5px 0 rgba(0,0,0,0.15)' }}>
              <Flame className="w-10 h-10 text-game-orange" fill="currentColor" strokeWidth={1.5} />
              <div>
                <p className="text-2xl font-black leading-none text-game-orange">12</p>
                <p className="text-xs font-extrabold text-game-muted">day streak</p>
              </div>
            </div>
            <div className="absolute right-4 top-6 rounded-3xl bg-white text-game-ink p-4 flex items-center gap-3 animate-floaty" style={{ boxShadow: '0 5px 0 rgba(0,0,0,0.15)', animationDelay: '0.8s' }}>
              <Gem className="w-9 h-9 text-game-blue" strokeWidth={2.4} />
              <div>
                <p className="text-2xl font-black leading-none text-game-blue">+180</p>
                <p className="text-xs font-extrabold text-game-muted">XP today</p>
              </div>
            </div>
            <div className="absolute left-16 bottom-0 rounded-3xl bg-white text-game-ink p-4 flex items-center gap-3 animate-floaty" style={{ boxShadow: '0 5px 0 rgba(0,0,0,0.15)', animationDelay: '1.6s' }}>
              <IconTile icon={Trophy} color="yellow" size="md" />
              <div>
                <p className="text-base font-black leading-tight">Medal unlocked</p>
                <p className="text-xs font-extrabold text-game-muted">Perfect Score</p>
              </div>
              <span className="w-7 h-7 rounded-full bg-game-green text-white flex items-center justify-center ml-1">
                <Check className="w-4 h-4" strokeWidth={4} />
              </span>
            </div>
          </div>
        </div>

        <p className="text-white/60 text-xs font-bold relative z-10">© 2026 Smart Interview Assistant</p>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm animate-scale-in">
          <Link to="/" className="flex items-center gap-2.5 mb-10 lg:hidden">
            <AppLogo size={32} />
            <span className="font-black text-lg text-game-purple">Smart Interview</span>
          </Link>

          <h1 className="text-3xl font-black text-game-ink">{title}</h1>
          <p className="text-game-muted text-[15px] font-bold mt-1.5 mb-8">{subtitle}</p>

          {error && (
            <div className="bg-game-red-soft border-2 border-[#FFC2C2] text-game-red-edge rounded-2xl px-4 py-3 text-sm font-bold mb-5 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {children}
        </div>
      </div>
    </div>
  );
}

/** Labelled input with a leading icon and optional trailing control. */
export function AuthField({
  label,
  icon: Icon,
  trailing,
  ...input
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string; icon: React.ElementType; trailing?: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-black text-game-ink mb-2">{label}</label>
      <div className="relative">
        <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A9A9BF] pointer-events-none" strokeWidth={2.4} />
        <input {...input} className={`input-field !pl-12 ${trailing ? '!pr-12' : ''}`} />
        {trailing && <div className="absolute right-3 top-1/2 -translate-y-1/2">{trailing}</div>}
      </div>
    </div>
  );
}
