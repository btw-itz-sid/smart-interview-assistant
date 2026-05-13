import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

import {
  Play,
  TrendingUp,
  Award,
  Clock,
  Presentation,
  ChevronRight,
  BarChart2,
  Flame,
  ArrowUpRight,
  Zap,
} from 'lucide-react';

/* ── Premium Custom Trademark SVGs ── */
const CustomMockIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="4" width="16" height="16" rx="4" fill="currentColor" fillOpacity="0.2" />
    <path d="M10 9L15 12L10 15V9Z" fill="currentColor" />
    <path d="M7 4V20" stroke="currentColor" strokeOpacity="0.3" strokeWidth="2" />
  </svg>
);

const CustomCompanyIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="5" y="10" width="6" height="10" rx="1" fill="currentColor" fillOpacity="0.2" />
    <rect x="13" y="4" width="6" height="16" rx="1" fill="currentColor" />
    <circle cx="16" cy="7" r="1" fill="white" />
    <circle cx="16" cy="11" r="1" fill="white" />
  </svg>
);

const CustomJDIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7 4C7 2.89543 7.89543 2 9 2H14L19 7V20C19 21.1046 18.1046 22 17 22H9C7.89543 22 7 21.1046 7 20V4Z" fill="currentColor" fillOpacity="0.2" />
    <path d="M14 2V7H19" fill="currentColor" fillOpacity="0.3" />
    <line x1="10" y1="12" x2="16" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <line x1="10" y1="16" x2="14" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const CustomResumeIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="6" width="16" height="12" rx="2" fill="currentColor" fillOpacity="0.2" />
    <path d="M12 21V18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M8 21H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <circle cx="12" cy="12" r="2" fill="currentColor" />
  </svg>
);

const CustomHistoryIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="9" fill="currentColor" fillOpacity="0.2" />
    <path d="M12 7V12L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="12" cy="12" r="1.5" fill="currentColor" />
  </svg>
);

const CustomBehavioralIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4" />
    <circle cx="12" cy="12" r="4" fill="currentColor" fillOpacity="0.2" />
    <circle cx="12" cy="12" r="2" fill="currentColor" />
    <circle cx="8" cy="8" r="1.5" fill="currentColor" />
    <circle cx="16" cy="8" r="1.5" fill="currentColor" />
    <path d="M8.5 8.5L11 11M15.5 8.5L13 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

/* ── Metric Card — premium elevated design ── */
const MetricCard = ({
  title,
  value,
  sub,
  icon: Icon,
  iconBg,
  iconColor,
  delay = 0,
}: {
  title: string;
  value: string | number;
  sub?: string;
  icon: any;
  iconBg: string;
  iconColor: string;
  delay?: number;
}) => (
  <div
    className="bg-white rounded-2xl p-5 animate-slide-up hover:-translate-y-1 transition-all duration-300 cursor-default"
    style={{
      animationDelay: `${delay}ms`,
      border: '1px solid rgba(226,232,240,0.7)',
      boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)',
    }}
  >
    <div className="flex items-start justify-between">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-2">{title}</p>
        <p className="text-3xl font-bold text-slate-900 leading-none" style={{ fontFamily: 'Outfit, sans-serif' }}>
          {value}
        </p>
        {sub && (
          <span className="inline-flex items-center gap-1 mt-2.5 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md">
            <TrendingUp className="w-3 h-3" /> {sub}
          </span>
        )}
      </div>
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
    </div>
  </div>
);

/* ── Quick Action Card — premium hover lift ── */
const ActionCard = ({
  title,
  desc,
  icon: Icon,
  onClick,
  iconBg,
  iconColor,
}: {
  title: string;
  desc: string;
  icon: any;
  onClick?: () => void;
  iconBg: string;
  iconColor: string;
}) => (
  <button
    onClick={onClick}
    className="w-full text-left group flex items-center gap-3.5 px-3.5 py-3 rounded-xl hover:bg-slate-50/80 transition-all duration-200 border border-transparent hover:border-slate-200/80 hover:shadow-sm"
  >
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
      <Icon className={`w-4.5 h-4.5 ${iconColor}`} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[13px] font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors leading-tight">{title}</p>
      <p className="text-[11px] text-slate-400 mt-0.5">{desc}</p>
    </div>
    <ArrowUpRight className="w-3.5 h-3.5 text-slate-200 group-hover:text-indigo-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all flex-shrink-0" />
  </button>
);

/* ── Topic Progress Bar ── */
const TopicBar = ({ topic, avgScore, totalAttempts }: any) => {
  const pct = Math.round((avgScore / 10) * 100);
  const color =
    pct >= 70 ? '#10b981' : pct >= 40 ? '#f59e0b' : '#ef4444';

  return (
    <div className="group">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm font-medium text-slate-700">{topic}</span>
        <span className="text-xs font-bold text-slate-600">{avgScore}/10</span>
      </div>
      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <p className="text-[11px] text-slate-400 mt-1">{totalAttempts} attempt{totalAttempts !== 1 ? 's' : ''}</p>
    </div>
  );
};

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [streak, setStreak] = useState<any>(null);
  const [readiness, setReadiness] = useState<any>(null);
  const [badges, setBadges] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [analyticsRes, streakRes, readinessRes, badgesRes] = await Promise.allSettled([
        api.get('/progress/analytics'),
        api.get('/progress/streak'),
        api.get('/progress/readiness'),
        api.get('/progress/badges'),
      ]);
      if (analyticsRes.status === 'fulfilled') setData(analyticsRes.value.data.data);
      if (streakRes.status === 'fulfilled') setStreak(streakRes.value.data.data);
      if (readinessRes.status === 'fulfilled') setReadiness(readinessRes.value.data.data);
      if (badgesRes.status === 'fulfilled') setBadges(badgesRes.value.data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-3 border-indigo-200 border-t-indigo-500 animate-spin" />
          <p className="text-sm text-slate-400 font-medium">Loading your dashboard…</p>
        </div>
      </div>
    );
  }

  const topics   = data?.topicWiseProgress || [];
  const recent   = data?.recentInterviews  || [];
  const avgScore = data?.averageScore       ?? 0;
  const total    = data?.totalInterviews    ?? 0;

  /* greeting */
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="min-h-full p-6 md:p-8 max-w-7xl mx-auto">

      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 mb-8 animate-fade-in">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-indigo-400 mb-1">{greeting}</p>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 leading-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
            {user?.name ? `Welcome back, ${user.name.split(' ')[0]}!` : 'Welcome back!'}
          </h1>
          <p className="text-slate-500 text-sm mt-1">Here's a snapshot of your interview performance.</p>
        </div>
        <button
          onClick={() => navigate('/interview')}
          className="btn-primary shrink-0"
        >
          <Play className="w-4 h-4 fill-current" />
          Start New Interview
        </button>
      </div>

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <MetricCard
          title="Total Interviews"
          value={total}
          sub={total > 0 ? `${total} session${total !== 1 ? 's' : ''} completed` : undefined}
          icon={Presentation}
          iconBg="bg-indigo-50"
          iconColor="text-indigo-600"
          delay={80}
        />
        <MetricCard
          title="Average Score"
          value={total > 0 ? `${avgScore}/10` : '—'}
          sub={total > 0 && avgScore > 0 ? `Across ${total} interview${total !== 1 ? 's' : ''}` : undefined}
          icon={Award}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
          delay={160}
        />
        <MetricCard
          title="Recent Sessions"
          value={recent.length}
          sub={recent.length > 0 ? 'Active this week' : undefined}
          icon={Clock}
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
          delay={240}
        />
      </div>

      {/* ── Readiness Score + Streak Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">

        {/* Readiness Score Gauge */}
        {readiness && (
          <div className="bg-white rounded-2xl p-6 animate-slide-up" style={{ animationDelay: '280ms', border: '1px solid rgba(226,232,240,0.7)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-4 h-4 text-indigo-500" />
              <h2 className="text-base font-semibold text-slate-800" style={{ fontFamily: 'Outfit, sans-serif' }}>
                Interview Readiness
              </h2>
            </div>
            <div className="flex items-center gap-6">
              {/* Circular gauge */}
              <div className="relative w-28 h-28 flex-shrink-0">
                <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="#f1f5f9" strokeWidth="8" />
                  <circle
                    cx="50" cy="50" r="42" fill="none"
                    stroke={readiness.readinessColor}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${readiness.readinessScore * 2.64} 264`}
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'Outfit, sans-serif' }}>{readiness.readinessScore}</span>
                  <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">/ 100</span>
                </div>
              </div>
              <div className="flex-1 space-y-2">
                <p className="text-sm font-bold" style={{ color: readiness.readinessColor }}>{readiness.readinessLabel}</p>
                {readiness.breakdown && Object.entries(readiness.breakdown).map(([key, val]: any) => (
                  <div key={key} className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400 w-20 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-indigo-400 transition-all duration-700" style={{ width: `${val}%` }} />
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 w-6 text-right">{val}%</span>
                  </div>
                ))}
                {readiness.recommendations?.[0] && (
                  <div className="flex items-start gap-2 text-[11px] text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-2.5 py-1.5 mt-2">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="flex-shrink-0 mt-px"><path d="M7 1L8.5 5H12.5L9.5 7.5L10.5 11.5L7 9L3.5 11.5L4.5 7.5L1.5 5H5.5L7 1Z" fill="currentColor" opacity="0.7"/></svg>
                    <span>{readiness.recommendations[0]}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Streak & XP Widget */}
        {streak && (
          <div className="bg-white rounded-2xl p-6 animate-slide-up" style={{ animationDelay: '340ms', border: '1px solid rgba(226,232,240,0.7)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div className="flex items-center gap-2 mb-4">
              <Flame className="w-4 h-4 text-orange-500" />
              <h2 className="text-base font-semibold text-slate-800" style={{ fontFamily: 'Outfit, sans-serif' }}>
                Streak & XP
              </h2>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center p-3 bg-orange-50 rounded-xl border border-orange-100">
                <p className="text-2xl font-bold text-orange-600" style={{ fontFamily: 'Outfit, sans-serif' }}>{streak.currentStreak}</p>
                <p className="text-[10px] font-semibold text-orange-400 uppercase tracking-wider mt-0.5">Day Streak</p>
              </div>
              <div className="text-center p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                <p className="text-2xl font-bold text-indigo-600" style={{ fontFamily: 'Outfit, sans-serif' }}>Lv {streak.level}</p>
                <p className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wider mt-0.5">Level</p>
              </div>
              <div className="text-center p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                <p className="text-2xl font-bold text-emerald-600" style={{ fontFamily: 'Outfit, sans-serif' }}>{streak.totalXP}</p>
                <p className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider mt-0.5">Total XP</p>
              </div>
            </div>
            {/* XP Progress to next level */}
            {streak.xpProgress && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-slate-400">Progress to Level {streak.level + 1}</span>
                  <span className="text-xs font-bold text-slate-500">{streak.xpProgress.progress}%</span>
                </div>
                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-violet-500 transition-all duration-1000"
                    style={{ width: `${streak.xpProgress.progress}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">{streak.totalXP} / {streak.xpProgress.next} XP</p>
              </div>
            )}
            {/* Badges preview */}
            {badges && badges.badges && (
              <div className="mt-4 pt-3 border-t border-slate-100">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2">
                  Badges ({badges.totalEarned}/{badges.totalAvailable})
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {badges.badges.slice(0, 8).map((b: any) => (
                    <span
                      key={b.type}
                      className={`px-2 py-1 rounded-md text-[10px] font-semibold border ${
                        b.earned
                          ? 'bg-indigo-50 text-indigo-600 border-indigo-100'
                          : 'bg-slate-50 text-slate-300 border-slate-100'
                      }`}
                      title={b.description}
                    >
                      {b.earned ? (
                        <><svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="inline mr-0.5"><path d="M5 0.5L6.1 3.5H9.5L6.8 5.3L7.7 8.5L5 6.5L2.3 8.5L3.2 5.3L0.5 3.5H3.9L5 0.5Z" fill="currentColor"/></svg> {b.label}</>
                      ) : (
                        <><svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="inline mr-0.5"><rect x="2.5" y="4" width="5" height="4.5" rx="0.5" stroke="currentColor" strokeWidth="1"/><path d="M3.5 4V3C3.5 1.9 4.17 1 5 1C5.83 1 6.5 1.9 6.5 3V4" stroke="currentColor" strokeWidth="1"/></svg> {b.label}</>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Main two-column ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">

        {/* Topic Proficiency — wider */}
        <div className="lg:col-span-3 bg-white rounded-2xl p-6 animate-slide-up" style={{ animationDelay: '320ms', border: '1px solid rgba(226,232,240,0.7)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-indigo-500" />
              <h2 className="text-base font-semibold text-slate-800" style={{ fontFamily: 'Outfit, sans-serif' }}>
                Topic Proficiency
              </h2>
            </div>
          </div>

          {topics.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-4">
                <Award className="w-6 h-6 text-slate-300" />
              </div>
              <p className="text-sm font-medium text-slate-500 mb-1">No data yet</p>
              <p className="text-xs text-slate-400">Complete a few interviews to see your topic breakdown.</p>
            </div>
          ) : (
            <div className="space-y-5">
              {topics.map((t: any) => (
                <TopicBar key={t.topic} {...t} />
              ))}
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* Quick actions */}
          <div className="bg-white rounded-2xl p-5 animate-slide-up" style={{ animationDelay: '400ms', border: '1px solid rgba(226,232,240,0.7)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-2 px-1">Quick Start</p>
            <div className="space-y-0.5">
              <ActionCard
                title="Mock Interview"
                desc="AI-powered Q&A session"
                icon={CustomMockIcon}
                iconBg="bg-indigo-50"
                iconColor="text-indigo-600"
                onClick={() => navigate('/interview')}
              />
              <ActionCard
                title="Company Interview"
                desc="Google, Amazon, TCS & more"
                icon={CustomCompanyIcon}
                iconBg="bg-purple-50"
                iconColor="text-purple-600"
                onClick={() => navigate('/company-interview')}
              />
              <ActionCard
                title="JD → Interview"
                desc="Paste JD, get custom questions"
                icon={CustomJDIcon}
                iconBg="bg-rose-50"
                iconColor="text-rose-600"
                onClick={() => navigate('/jd-interview')}
              />
              <ActionCard
                title="Analyze Resume"
                desc="5-dimension ATS score"
                icon={CustomResumeIcon}
                iconBg="bg-emerald-50"
                iconColor="text-emerald-600"
                onClick={() => navigate('/resume')}
              />
              <ActionCard
                title="View History"
                desc="Review past sessions"
                icon={CustomHistoryIcon}
                iconBg="bg-amber-50"
                iconColor="text-amber-600"
                onClick={() => navigate('/history')}
              />
              <ActionCard
                title="Behavioral (STAR)"
                desc="Practice STAR-L framework"
                icon={CustomBehavioralIcon}
                iconBg="bg-violet-50"
                iconColor="text-violet-600"
                onClick={() => navigate('/behavioral')}
              />
            </div>
          </div>

          {/* Daily Practice Recommendation */}
          {topics.length > 0 && (() => {
            const weakest = [...topics].sort((a: any, b: any) => a.avgScore - b.avgScore)[0];
            return (
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 rounded-xl p-4 animate-slide-up" style={{ animationDelay: '480ms' }}>
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-indigo-500" />
                  <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">Daily Suggestion</p>
                </div>
                <p className="text-sm text-indigo-900 font-medium leading-snug">
                  Practice <span className="font-bold">{weakest.topic}</span> today
                </p>
                <p className="text-xs text-indigo-600 mt-0.5 mb-3">Your lowest score: {weakest.avgScore}/10</p>
                <button onClick={() => navigate('/interview')} className="w-full text-xs font-semibold text-indigo-700 bg-white border border-indigo-200 py-2 rounded-lg hover:bg-indigo-50 transition-colors">
                  Start Practice →
                </button>
              </div>
            );
          })()}
        </div>
      </div>

      {/* ── Recent Sessions ── */}
      <div className="bg-white rounded-2xl p-6 animate-slide-up" style={{ animationDelay: '480ms', border: '1px solid rgba(226,232,240,0.7)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-500" />
            <h2 className="text-base font-semibold text-slate-800" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Recent Sessions
            </h2>
          </div>
          <button
            className="text-xs font-semibold text-indigo-500 hover:text-indigo-700 flex items-center gap-1 transition-colors"
            onClick={() => navigate('/history')}
          >
            View all <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recent.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-3">
              <Clock className="w-6 h-6 text-slate-300" />
            </div>
            <p className="text-sm font-medium text-slate-500 mb-1">No sessions yet</p>
            <p className="text-xs text-slate-400">Start your first mock interview to see it here.</p>
            <button
              onClick={() => navigate('/interview')}
              className="mt-4 btn-primary text-xs py-2 px-4"
            >
              <Play className="w-3.5 h-3.5 fill-current" /> Start Interview
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {recent.slice(0, 5).map((item: any, i: number) => {
              const score = item.score ?? null;
              const scoreColor =
                score === null ? 'text-slate-400 bg-slate-50' :
                score >= 7 ? 'text-emerald-700 bg-emerald-50' :
                score >= 4 ? 'text-amber-700 bg-amber-50' :
                'text-red-700 bg-red-50';

              return (
                <div
                  key={item.id || i}
                  className="flex items-center gap-4 py-3.5 group cursor-pointer hover:bg-slate-50/70 -mx-2 px-2 rounded-xl transition-colors"
                >
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                    <Presentation className="w-4 h-4 text-indigo-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate group-hover:text-indigo-600 transition-colors">
                      {item.topic}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {item.date ? new Date(item.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recent'}
                    </p>
                  </div>
                  {score !== null && (
                    <span className={`badge ${scoreColor} text-xs`}>
                      {score}/10
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
