import React from 'react';
import { PALETTE, type GameColor } from '../lib/interviewUi';

/** Solid coloured square with a darker bottom edge, holding a white icon. */
export const IconTile: React.FC<{
  icon: React.ElementType;
  color: GameColor;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  soft?: boolean;
  className?: string;
}> = ({ icon: Icon, color, size = 'md', soft = false, className = '' }) => {
  const p = PALETTE[color];
  const dims = {
    sm: { box: 'w-9 h-9 rounded-xl', icon: 'w-[18px] h-[18px]', edge: 3 },
    md: { box: 'w-12 h-12 rounded-2xl', icon: 'w-6 h-6', edge: 4 },
    lg: { box: 'w-14 h-14 rounded-2xl', icon: 'w-7 h-7', edge: 4 },
    xl: { box: 'w-20 h-20 rounded-3xl', icon: 'w-10 h-10', edge: 5 },
  }[size];

  return (
    <div
      className={`${dims.box} flex items-center justify-center flex-shrink-0 ${className}`}
      style={
        soft
          ? { background: p.soft, color: p.face }
          : { background: p.face, color: '#fff', boxShadow: `0 ${dims.edge}px 0 ${p.edge}` }
      }
    >
      <Icon className={dims.icon} strokeWidth={2.6} />
    </div>
  );
};

/** Thick rounded progress bar with a glossy stripe. */
export const GameBar: React.FC<{
  value: number;
  color: GameColor;
  height?: number;
  track?: string;
  className?: string;
}> = ({ value, color, height = 16, track, className = '' }) => (
  <div className={`bar-track ${className}`} style={{ height, background: track }}>
    <div
      className="bar-fill"
      style={{ width: `${Math.max(0, Math.min(100, value))}%`, background: PALETTE[color].face, minWidth: value > 0 ? height : 0 }}
    />
  </div>
);

/** Small pill showing a value with a coloured icon, for the top stats bar. */
export const StatPill: React.FC<{
  icon: React.ElementType;
  color: GameColor;
  value: React.ReactNode;
  title: string;
  onClick?: () => void;
}> = ({ icon: Icon, color, value, title, onClick }) => (
  <button
    type="button"
    title={title}
    onClick={onClick}
    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-2xl hover:bg-game-bg transition-colors"
  >
    <Icon className="w-6 h-6" style={{ color: PALETTE[color].face }} strokeWidth={2.6} fill={PALETTE[color].face} fillOpacity={0.2} />
    <span className="text-[15px] font-black" style={{ color: PALETTE[color].face }}>{value}</span>
  </button>
);

/** Big score ring used on reports, dashboard and history. */
export const ScoreRing: React.FC<{
  value: number;
  max?: number;
  size?: number;
  stroke?: number;
  color: string;
  track?: string;
  children?: React.ReactNode;
}> = ({ value, max = 100, size = 120, stroke = 12, color, track = '#ECECF4', children }) => {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, value / max));
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          style={{ transition: 'stroke-dashoffset 1s ease-out' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">{children}</div>
    </div>
  );
};
