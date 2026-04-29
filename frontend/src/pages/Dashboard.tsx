import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';
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
  Building2,
  FileText,
} from 'lucide-react';

/* ── Metric Card — clean flat design, no glow ── */
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
    className="bg-white rounded-xl border border-slate-200 p-5 animate-slide-up hover:-translate-y-0.5 hover:border-slate-300 transition-all duration-200 cursor-default"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">{title}</p>
        <p className="text-3xl font-bold text-slate-900 leading-none" style={{ fontFamily: 'Outfit, sans-serif' }}>
          {value}
        </p>
        {sub && (
          <span className="inline-flex items-center gap-1 mt-2.5 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md">
            <TrendingUp className="w-3 h-3" /> {sub}
          </span>
        )}
      </div>
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${iconBg}`}>
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
    </div>
  </div>
);

/* ── Quick Action Card — flat, no glow ── */
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
    className="w-full text-left group flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-50 transition-colors duration-150 border border-transparent hover:border-slate-200"
  >
    <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${iconBg}`}>
      <Icon className={`w-4 h-4 ${iconColor}`} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors leading-tight">{title}</p>
      <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
    </div>
    <ArrowUpRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-indigo-400 transition-colors flex-shrink-0" />
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
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const res = await api.get('/progress/analytics');
      setData(res.data.data);
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

      {/* ── Main two-column ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">

        {/* Topic Proficiency — wider */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200 p-6 animate-slide-up" style={{ animationDelay: '320ms' }}>
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
          <div className="bg-white rounded-xl border border-slate-200 p-4 animate-slide-up" style={{ animationDelay: '400ms' }}>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-2 px-1">Quick Start</p>
            <div className="space-y-0.5">
              <ActionCard
                title="Mock Interview"
                desc="AI-powered Q&A session"
                icon={Play}
                iconBg="bg-indigo-50"
                iconColor="text-indigo-600"
                onClick={() => navigate('/interview')}
              />
              <ActionCard
                title="Company Interview"
                desc="Google, Amazon, TCS & more"
                icon={Building2}
                iconBg="bg-purple-50"
                iconColor="text-purple-600"
                onClick={() => navigate('/company-interview')}
              />
              <ActionCard
                title="JD → Interview"
                desc="Paste JD, get custom questions"
                icon={FileText}
                iconBg="bg-rose-50"
                iconColor="text-rose-600"
                onClick={() => navigate('/jd-interview')}
              />
              <ActionCard
                title="Analyze Resume"
                desc="5-dimension ATS score"
                icon={Presentation}
                iconBg="bg-emerald-50"
                iconColor="text-emerald-600"
                onClick={() => navigate('/resume')}
              />
              <ActionCard
                title="View History"
                desc="Review past sessions"
                icon={Flame}
                iconBg="bg-amber-50"
                iconColor="text-amber-600"
                onClick={() => navigate('/history')}
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

      {/* ── Score Trend Chart ── */}
      {recent.length >= 2 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 animate-slide-up mb-6" style={{ animationDelay: '520ms' }}>
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp className="w-4 h-4 text-indigo-500" />
            <h2 className="text-base font-semibold text-slate-800" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Score Trend
            </h2>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={[...recent].reverse().slice(0, 10).map((r: any, i: number) => ({
              session: `#${i + 1}`,
              score: r.score ?? 0,
              topic: r.topic,
            }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="session" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 10]} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={24} />
              <Tooltip
                contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '12px' }}
                formatter={(val: any, _: any, props: any) => [`${val}/10`, props.payload.topic || 'Score']}
                labelStyle={{ color: '#64748b', fontWeight: 600 }}
              />
              <Line type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={2.5}
                dot={{ r: 4, fill: '#6366f1', strokeWidth: 0 }}
                activeDot={{ r: 6, fill: '#6366f1', strokeWidth: 0 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ── Recent Sessions ── */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 animate-slide-up" style={{ animationDelay: '480ms' }}>
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
