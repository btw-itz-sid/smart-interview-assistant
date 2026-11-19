import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Menu, X, Home, History, Flame, Gem, Shield, Rocket } from 'lucide-react';
import AppLogo from './AppLogo';
import { IconTile, StatPill, GameBar } from './Game';
import { MODES, RESUME_MODE, type GameColor } from '../lib/interviewUi';
import { useGameStats } from '../lib/useGameStats';

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
  color: GameColor;
}

const navSections: { label: string; items: NavItem[] }[] = [
  {
    label: 'Learn',
    items: [
      { icon: Home,    label: 'Dashboard', path: '/',        color: 'green' },
      { icon: History, label: 'History',   path: '/history', color: 'yellow' },
    ],
  },
  {
    label: 'Practice',
    items: [
      ...Object.values(MODES).map((m) => ({ icon: m.icon, label: m.name, path: m.path, color: m.color })),
      { icon: RESUME_MODE.icon, label: RESUME_MODE.name, path: RESUME_MODE.path, color: RESUME_MODE.color },
    ],
  },
];

const initials = (name?: string) =>
  (name || 'U')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const stats = useGameStats();

  const go = (path: string) => {
    navigate(path);
    setMobileOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  const streak = stats?.currentStreak ?? 0;
  const xp = stats?.totalXP ?? 0;
  const level = stats?.level ?? 1;
  const levelPct = stats?.xpProgress?.progress ?? 0;

  return (
    <div className="flex h-screen overflow-hidden bg-game-bg">
      {mobileOpen && (
        <div className="fixed inset-0 bg-game-ink/40 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-[264px] flex flex-col bg-white border-r-2 border-game-line
          transform transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] lg:translate-x-0
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex items-center justify-between px-5 pt-6 pb-5">
          <button onClick={() => go('/')} className="flex items-center gap-2.5">
            <AppLogo size={36} />
            <div className="text-left">
              <p className="font-black text-[18px] leading-none text-game-purple tracking-tight">Smart Interview</p>
              <p className="text-[11px] font-extrabold text-game-muted mt-1">Practice. Level up. Get hired.</p>
            </div>
          </button>
          <button
            className="lg:hidden p-2 rounded-xl text-game-muted hover:bg-game-bg"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-3 overflow-y-auto pb-4 space-y-5">
          {navSections.map((section) => (
            <div key={section.label}>
              <p className="eyebrow text-[#B0B0C8] px-3.5 mb-2">{section.label}</p>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const active = isActive(item.path);
                  return (
                    <button key={item.path} onClick={() => go(item.path)} className={`nav-item ${active ? 'active' : ''}`}>
                      <IconTile icon={item.icon} color={item.color} size="sm" soft={!active} />
                      <span className="flex-1 truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Level card */}
        <div className="px-4 pb-3">
          <div className="rounded-2xl border-2 border-game-line p-3.5" style={{ boxShadow: '0 3px 0 #E5E5F0' }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-black text-game-ink flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-game-purple" fill="#7C5CFC" fillOpacity={0.2} strokeWidth={2.6} />
                Level {level}
              </span>
              <span className="text-xs font-extrabold text-game-muted">
                {stats ? `${stats.xpProgress.current}/${stats.xpProgress.next} XP` : '—'}
              </span>
            </div>
            <GameBar value={levelPct} color="purple" height={12} />
          </div>
        </div>

        <div className="p-4 pt-1 border-t-2 border-game-line">
          <div className="flex items-center gap-3 px-1 py-2">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-black text-sm flex-shrink-0 bg-game-blue"
              style={{ boxShadow: '0 3px 0 #1593CF' }}
            >
              {initials(user?.name)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-extrabold text-game-ink truncate leading-tight">{user?.name || 'User'}</p>
              <p className="text-xs font-semibold text-game-muted truncate mt-0.5">{user?.email || ''}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl text-game-muted hover:text-game-red hover:bg-game-red-soft transition-colors"
              title="Sign out"
              aria-label="Sign out"
            >
              <LogOut className="w-5 h-5" strokeWidth={2.4} />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main area ── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white border-b-2 border-game-line px-3 sm:px-6 h-16 flex items-center justify-between flex-shrink-0 z-30">
          <div className="flex items-center gap-2">
            <button
              className="lg:hidden p-2 rounded-xl text-game-muted hover:bg-game-bg"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="lg:hidden"><AppLogo size={30} /></div>
            <button onClick={() => go('/interview')} className="hidden md:inline-flex btn-green !py-2 !px-4 !text-xs ml-1 lg:ml-0">
              <Rocket className="w-4 h-4" strokeWidth={2.6} />
              Quick practice
            </button>
          </div>

          <div className="flex items-center gap-0.5 sm:gap-2">
            <StatPill icon={Flame} color={streak > 0 ? 'orange' : 'red'} value={streak} title={`${streak}-day streak`} onClick={() => go('/')} />
            <StatPill icon={Gem} color="blue" value={xp.toLocaleString('en-IN')} title="Total XP" onClick={() => go('/')} />
            <StatPill icon={Shield} color="purple" value={`Lv ${level}`} title={`Level ${level}`} onClick={() => go('/')} />
          </div>
        </header>

        <div className="flex-1 overflow-auto">
          <div className="animate-fade-in h-full">{children}</div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
