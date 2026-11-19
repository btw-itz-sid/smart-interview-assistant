import { BrainCircuit, Building2, FileText, MessageSquare, Zap } from 'lucide-react';

export type GameColor = 'purple' | 'green' | 'orange' | 'yellow' | 'blue' | 'pink' | 'red';

/** Hex values for each palette colour: face, darker bottom edge, soft tint background. */
export const PALETTE: Record<GameColor, { face: string; edge: string; soft: string; text: string }> = {
  purple: { face: '#7C5CFC', edge: '#5B3FD9', soft: '#F1EDFF', text: '#5B3FD9' },
  green:  { face: '#58CC02', edge: '#46A302', soft: '#E9F9DC', text: '#3D8F02' },
  orange: { face: '#FF9600', edge: '#D97F00', soft: '#FFF2DE', text: '#C77400' },
  yellow: { face: '#FFC800', edge: '#E0A800', soft: '#FFF8D6', text: '#A67C00' },
  blue:   { face: '#1CB0F6', edge: '#1593CF', soft: '#DFF4FE', text: '#1180B5' },
  pink:   { face: '#FF4B91', edge: '#D93A79', soft: '#FFE4EF', text: '#C42E68' },
  red:    { face: '#FF4B4B', edge: '#D93636', soft: '#FFE5E5', text: '#C42B2B' },
};

export const MODES = {
  general:    { label: 'Mock',       name: 'Mock Interview',    icon: MessageSquare, color: 'blue'   as GameColor, path: '/interview' },
  company:    { label: 'Company',    name: 'Company Interview', icon: Building2,     color: 'purple' as GameColor, path: '/company-interview' },
  jd:         { label: 'JD',         name: 'JD Interview',      icon: Zap,           color: 'orange' as GameColor, path: '/jd-interview' },
  behavioral: { label: 'Behavioral', name: 'Behavioral (STAR)', icon: BrainCircuit,  color: 'pink'   as GameColor, path: '/behavioral' },
} as const;

export const RESUME_MODE = { label: 'Resume', name: 'Resume Analyzer', icon: FileText, color: 'green' as GameColor, path: '/resume' };

export type InterviewType = keyof typeof MODES;

export const modeOf = (type?: string | null) => MODES[(type as InterviewType) || 'general'] || MODES.general;

export const scoreColor = (score: number): GameColor => (score >= 7 ? 'green' : score >= 5 ? 'orange' : 'red');

export const scoreTone = (score: number) => {
  const p = PALETTE[scoreColor(score)];
  return { color: scoreColor(score), hex: p.face, edge: p.edge, soft: p.soft, textHex: p.text };
};

export const formatShortDate = (d: string | Date) =>
  new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
