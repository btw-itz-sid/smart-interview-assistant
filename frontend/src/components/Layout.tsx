import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, MessageSquare, History, FileText, LogOut, User as UserIcon, Menu, X } from 'lucide-react';
import AppLogo from './AppLogo';

interface NavItem {
  icon: any;
  label: string;
  path: string;
  badge?: string;
}

const navItems: NavItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard',      path: '/' },
  { icon: MessageSquare,   label: 'Mock Interview', path: '/interview' },
  { icon: History,         label: 'Chat History',   path: '/history' },
  { icon: FileText,        label: 'Resume Analyzer',path: '/resume' },
];

const SidebarNavItem: React.FC<{
  item: NavItem;
  active: boolean;
  onClick: () => void;
}> = ({ item: { icon: Icon, label, badge }, active, onClick }) => (
  <button
    onClick={onClick}
    className={`nav-item ${active ? 'active' : ''}`}
    style={{
      borderLeft: active ? '2px solid #6366f1' : '2px solid transparent',
      paddingLeft: active ? '10px' : '12px',
    }}
  >
    <Icon className={`nav-icon w-4 h-4 flex-shrink-0`} />
    <span className="flex-1">{label}</span>
    {badge && (
      <span className="ml-auto px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-400">
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
    <div className="flex h-screen overflow-hidden bg-[#f8f9fc]">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 flex flex-col
          bg-[#0f1117] border-r border-white/[0.06]
          transform transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
          lg:translate-x-0
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 pt-6 pb-5">
          <div className="flex items-center gap-3">
            <AppLogo size={32} />
            <div>
              <p className="text-white font-semibold text-sm leading-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
                Smart Interview
              </p>
              <p className="text-[10px] text-indigo-400/80 leading-tight font-medium uppercase tracking-widest">
                AI Prep
              </p>
            </div>
          </div>
          <button
            className="lg:hidden p-1 rounded-md text-slate-500 hover:text-white hover:bg-white/10 transition-colors"
            onClick={() => setMobileOpen(false)}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav label */}
        <div className="px-5 pb-2">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600">Navigation</p>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto pb-4">
          {navItems.map((item) => (
            <SidebarNavItem
              key={item.path}
              item={item}
              active={isActive(item.path)}
              onClick={() => go(item.path)}
            />
          ))}
        </nav>

        {/* Divider */}
        <div className="mx-4 border-t border-white/[0.06]" />

        {/* User section */}
        <div className="p-4 space-y-2">
          <div className="flex items-center gap-3 px-2 py-2 rounded-xl">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-violet-400 flex items-center justify-center text-white flex-shrink-0">
              <UserIcon className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white truncate leading-tight">
                {user?.name || 'User'}
              </p>
              <p className="text-xs text-slate-500 truncate mt-0.5">
                {user?.email || 'user@example.com'}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="nav-item w-full text-left hover:text-red-400"
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
        <header className="lg:hidden bg-white border-b border-slate-200 px-4 py-3.5 flex items-center justify-between sticky top-0 z-30">
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
