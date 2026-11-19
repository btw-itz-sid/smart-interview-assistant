import React from 'react';
import { PALETTE, type GameColor } from '../lib/interviewUi';

interface PageHeaderProps {
  icon: React.ElementType;
  title: string;
  subtitle?: string;
  color?: GameColor;
  /** Small pill shown above the title, e.g. "+50 XP" */
  tag?: React.ReactNode;
  actions?: React.ReactNode;
}

export default function PageHeader({ icon: Icon, title, subtitle, color = 'purple', tag, actions }: PageHeaderProps) {
  const p = PALETTE[color];
  return (
    <header
      className="relative overflow-hidden rounded-3xl text-white mb-6 animate-slide-up"
      style={{ background: p.face, boxShadow: `0 6px 0 ${p.edge}` }}
    >
      <Icon className="absolute -right-4 -bottom-8 w-40 h-40 opacity-20 rotate-12" strokeWidth={2} />

      <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-7">
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center flex-shrink-0" style={{ color: p.face, boxShadow: '0 4px 0 rgba(0,0,0,0.15)' }}>
            <Icon className="w-7 h-7" strokeWidth={2.6} />
          </div>
          <div className="min-w-0">
            {tag && (
              <span className="inline-flex items-center gap-1 rounded-full bg-white/25 px-2.5 py-0.5 text-[11px] font-black uppercase tracking-wider mb-1.5">
                {tag}
              </span>
            )}
            <h1 className="text-2xl md:text-[32px] font-black leading-tight text-outline">{title}</h1>
            {subtitle && <p className="text-sm md:text-base font-bold text-white/85 mt-1">{subtitle}</p>}
          </div>
        </div>
        {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
      </div>
    </header>
  );
}
