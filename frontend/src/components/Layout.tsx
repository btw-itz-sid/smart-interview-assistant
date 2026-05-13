import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User as UserIcon, Menu, X, LayoutDashboard, History, MessageSquare, Building2, FileText, Zap, BrainCircuit } from 'lucide-react';
import AppLogo from './AppLogo';

interface NavItem {
  icon: any;
  label: string;
  path: string;
  badge?: string;
}

interface NavSection {
  label: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    label: 'Overview',
    items: [
      { icon: LayoutDashboard, label: 'Dashboard',        path: '/' },
      { icon: History,         label: 'Interview History', path: '/history' },
    ],
  },
  {
    label: 'Practice',
    items: [
      { icon: MessageSquare, label: 'Mock Interview',    path: '/interview' },
      { icon: Building2,     label: 'Company Interview',  path: '/company-interview' },
      { icon: Zap,           label: 'JD Interview',       path: '/jd-interview' },
      { icon: BrainCircuit,  label: 'Behavioral (STAR)',  path: '/behavioral' },
    ],
  },
  {
    label: 'Tools',
    items: [
      { icon: FileText, label: 'Resume Analyzer', path: '/resume' },
    ],
  },
];

const SidebarNavItem: React.FC<{
  item: NavItem;
  active: boolean;
  onClick: () => void;
}> = ({ item: { icon: Icon, label, badge }, active, onClick }) => (
  <button
    onClick={onClick}
    className={`nav-item group ${active ? 'active' : ''}`}
    style={{
      borderLeft: active ? '2px solid #818cf8' : '2px solid transparent',
      paddingLeft: active ? '10px' : '12px',
    }}
  >
    <Icon className={`w-4 h-4 flex-shrink-0 transition-colors duration-200 ${active ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
    <span className="flex-1 text-left">{label}</span>
    {badge && (
      <span className="ml-auto px-1.5 py-px rounded text-[9px] font-bold tracking-wide uppercase"
        style={{ background: 'rgba(99,102,241,0.15)', color: '#a5b4fc' }}>
        {badge}
      </span>
    )}
  </button>
);

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

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

  return (
    <div className="flex h-screen overflow-hidden bg-[#f7f8fa]">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-[260px] flex flex-col
          transform transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
          lg:translate-x-0
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{
          background: 'linear-gradient(180deg, #0c0e18 0%, #111424 100%)',
          borderRight: '1px solid rgba(255,255,255,0.04)',
        }}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 pt-7 pb-6">
          <div className="flex items-center gap-3">
            <AppLogo size={34} />
            <div>
              <p className="text-white font-semibold text-[14px] leading-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
                Smart Interview
              </p>
              <p className="text-[10px] leading-tight font-semibold uppercase tracking-[0.15em]"
                style={{ color: 'rgba(165, 180, 252, 0.6)' }}>
                AI Prep Platform
              </p>
            </div>
          </div>
          <button
            className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/10 transition-colors"
            onClick={() => setMobileOpen(false)}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav sections */}
        <nav className="flex-1 px-3 overflow-y-auto pb-4 space-y-5 dark-scrollbar">
          {navSections.map((section) => (
            <div key={section.label}>
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] px-3 mb-2"
                style={{ color: 'rgba(148,163,184,0.35)' }}>
                {section.label}
              </p>
              <div className="space-y-0.5">
                {section.items.map((item) => (
                  <SidebarNavItem
                    key={item.path}
                    item={item}
                    active={isActive(item.path)}
                    onClick={() => go(item.path)}
                  />
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Divider */}
        <div className="mx-5 border-t" style={{ borderColor: 'rgba(255,255,255,0.04)' }} />

        {/* User section */}
        <div className="p-4 space-y-2">
          <div className="flex items-center gap-3 px-2 py-2.5 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.03)' }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
              <UserIcon className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold text-white truncate leading-tight">
                {user?.name || 'User'}
              </p>
              <p className="text-[11px] truncate mt-0.5" style={{ color: 'rgba(148,163,184,0.5)' }}>
                {user?.email || 'user@example.com'}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="nav-item w-full text-left hover:!text-red-400"
            style={{ border: '1px solid transparent' }}
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* ── Main area ── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile top bar */}
        <header className="lg:hidden bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 py-3.5 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-2.5">
            <AppLogo size={28} />
            <span className="font-semibold text-slate-900 text-sm" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Smart Interview
            </span>
          </div>
          <button
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>
        </header>

        {/* Page content */}
        <div className="flex-1 overflow-auto">
          <div className="animate-fade-in h-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
