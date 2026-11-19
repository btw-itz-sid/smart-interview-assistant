import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  MODES,
  PALETTE,
  RESUME_MODE,
  formatShortDate as formatDate,
  modeOf,
  scoreTone,
  type GameColor,
} from '../lib/interviewUi';
import { primeGameStats, type StreakData } from '../lib/useGameStats';
import { GameBar, IconTile, ScoreRing } from '../components/Game';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import {
  Award,
  BrainCircuit,
  CalendarCheck,
  Check,
  ChevronRight,
  FileCheck,
  Flame,
  Gem,
  Gift,
  Layers,
  Lock,
  Play,
  Rocket,
  Shield,
  Star,
  Swords,
  Target,
  Timer,
  TrendingUp,
  Trophy,
  Zap,
} from 'lucide-react';

/* ── Types ── */
interface Topic { topic: string; avgScore: number; totalAttempts: number }
interface RecentInterview { id: number; topic: string; type?: string; score: number | null; createdAt: string }
interface Analytics { totalInterviews: number; averageScore: number; topicWiseProgress: Topic[]; recentInterviews: RecentInterview[] }
interface Readiness {
  readinessScore: number; readinessLabel: string; readinessColor: string;
  breakdown?: Record<string, number>; recommendations?: string[];
}
interface BadgeItem { type: string; label: string; description: string; earned: boolean }
interface Badges { badges: BadgeItem[]; totalEarned: number; totalAvailable: number }

/* ── Display metadata ── */
const CHALLENGES = [
  { mode: 'general',    desc: 'Topic questions with instant AI feedback' },
  { mode: 'company',    desc: 'Google, Amazon, TCS style rounds' },
  { mode: 'jd',         desc: 'Questions built from a job description' },
  { mode: 'behavioral', desc: 'Tell great stories with STAR-L' },
] as const;

const BADGE_META: Record<string, { icon: React.ElementType; color: GameColor }> = {
  FIRST_INTERVIEW:  { icon: Rocket,        color: 'blue' },
  WEEK_WARRIOR:     { icon: Flame,         color: 'orange' },
  MONTH_MASTER:     { icon: CalendarCheck, color: 'red' },
  PERFECT_10:       { icon: Star,          color: 'yellow' },
  FIVE_TOPICS:      { icon: Layers,        color: 'purple' },
  TEN_INTERVIEWS:   { icon: Target,        color: 'green' },
  FIFTY_INTERVIEWS: { icon: Trophy,        color: 'yellow' },
  RESUME_PRO:       { icon: FileCheck,     color: 'green' },
  SPEED_DEMON:      { icon: Timer,         color: 'blue' },
  BEHAVIORAL_ACE:   { icon: BrainCircuit,  color: 'pink' },
};

const READINESS_LABELS: Record<string, string> = {
  topicBreadth: 'Topics covered',
  averageScore: 'Answer quality',
  consistency: 'Consistency',
  volume: 'Practice volume',
  weakTopics: 'Few weak topics',
};

const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

/* ── Building blocks ── */
const Card = ({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) => (
  <section className={`card animate-slide-up ${className}`} style={{ animationDelay: `${delay}ms` }}>
    {children}
  </section>
);

const CardTitle = ({ icon, color, title, action }: { icon: React.ElementType; color: GameColor; title: string; action?: React.ReactNode }) => (
  <div className="flex items-center justify-between gap-3 mb-5">
    <div className="flex items-center gap-3 min-w-0">
      <IconTile icon={icon} color={color} size="sm" />
      <h2 className="section-title truncate">{title}</h2>
    </div>
    {action}
  </div>
);

const TrendTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div className="rounded-2xl bg-white border-2 border-game-line px-3 py-2" style={{ boxShadow: '0 3px 0 #E5E5F0' }}>
      <p className="text-sm font-extrabold text-game-ink">{p.topic}</p>
      <p className="text-xs font-bold text-game-muted mt-0.5">
        {p.date} · <span style={{ color: scoreTone(p.score).hex }}>{p.score}/10</span>
      </p>
    </div>
  );
};

const Skeleton = () => (
  <div className="p-5 md:p-8 max-w-7xl mx-auto space-y-6 animate-pulse">
    <div className="h-56 bg-[#E9E9F3] rounded-3xl" />
    <div className="grid lg:grid-cols-3 gap-6">
      {[0, 1, 2].map((i) => <div key={i} className="h-56 bg-[#E9E9F3] rounded-3xl" />)}
    </div>
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[0, 1, 2, 3].map((i) => <div key={i} className="h-44 bg-[#E9E9F3] rounded-3xl" />)}
    </div>
  </div>
);

export default function Dashboard() {
  const [data, setData] = useState<Analytics | null>(null);
  const [streak, setStreak] = useState<StreakData | null>(null);
  const [readiness, setReadiness] = useState<Readiness | null>(null);
  const [badges, setBadges] = useState<Badges | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    (async () => {
      const [analyticsRes, streakRes, readinessRes, badgesRes] = await Promise.allSettled([
        api.get('/progress/analytics'),
        api.get('/progress/streak'),
        api.get('/progress/readiness'),
        api.get('/progress/badges'),
      ]);
      if (analyticsRes.status === 'fulfilled') setData(analyticsRes.value.data.data);
      if (streakRes.status === 'fulfilled') {
        setStreak(streakRes.value.data.data);
        primeGameStats(streakRes.value.data.data);
      }
      if (readinessRes.status === 'fulfilled') setReadiness(readinessRes.value.data.data);
      if (badgesRes.status === 'fulfilled') setBadges(badgesRes.value.data.data);
      setLoading(false);
    })();
  }, []);

  const topics = data?.topicWiseProgress || [];
  const recent = data?.recentInterviews || [];
  const total = data?.totalInterviews ?? 0;
  const avgScore = data?.averageScore ?? 0;

  const trendData = useMemo(
    () =>
      [...recent]
        .filter((r) => r.score !== null)
        .reverse()
        .map((r) => ({ date: formatDate(r.createdAt), score: r.score as number, topic: r.topic })),
    [recent],
  );

  const sortedTopics = useMemo(() => [...topics].sort((a, b) => b.avgScore - a.avgScore), [topics]);
  const weakestTopic = sortedTopics[sortedTopics.length - 1];

  // Last 7 days, oldest first, marked when an interview happened that day
  const week = useMemo(() => {
    const active = new Set(recent.map((r) => dayKey(new Date(r.createdAt))));
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return {
        label: d.toLocaleDateString('en-IN', { weekday: 'short' }).slice(0, 2),
        done: active.has(dayKey(d)),
        isToday: i === 6,
      };
    });
  }, [recent]);

  const quests = useMemo(() => {
    const todayKey = dayKey(new Date());
    const today = recent.filter((r) => dayKey(new Date(r.createdAt)) === todayKey);
    const best = Math.max(0, ...today.map((r) => r.score ?? 0));
    return [
      {
        icon: Play, color: 'blue' as GameColor, title: 'Complete an interview', reward: '+50 XP/ans',
        value: Math.min(today.length, 1), goal: 1,
      },
      {
        icon: Star, color: 'yellow' as GameColor, title: 'Score 7 or more', reward: '+30 bonus',
        value: Math.min(best, 7), goal: 7,
      },
      {
        icon: Swords, color: 'pink' as GameColor, title: 'Finish 3 interviews today', reward: 'Streak boost',
        value: Math.min(today.length, 3), goal: 3,
      },
    ];
  }, [recent]);

  if (loading) return <Skeleton />;

  const firstName = user?.name?.split(' ')[0] || 'there';
  const isNewUser = total === 0;
  const current = streak?.currentStreak ?? 0;
  const practicedToday = week[6].done;
  const questsDone = quests.filter((q) => q.value >= q.goal).length;
  const level = streak?.level ?? 1;
  const xpInfo = streak?.xpProgress;
  const xpToNext = xpInfo ? Math.max(0, xpInfo.next - (streak?.totalXP ?? 0)) : 0;
  const readinessScore = readiness?.readinessScore ?? 0;
  const startFocus = () => navigate('/interview', { state: weakestTopic ? { topic: weakestTopic.topic } : undefined });

  return (
    <div className="min-h-full p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* ── Hero ── */}
      <section
        className="auth-bg relative overflow-hidden rounded-3xl text-white animate-slide-up"
        style={{ boxShadow: '0 6px 0 #5B3FD9' }}
      >
        <div className="relative grid lg:grid-cols-[1.4fr_1fr] gap-8 p-6 sm:p-8">
          <div className="min-w-0">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-extrabold uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5" fill="currentColor" />
              {isNewUser ? 'Your journey starts here' : practicedToday ? 'Streak safe for today' : 'Keep your streak alive'}
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-[44px] font-black leading-[1.05] mt-4 text-outline">
              {isNewUser ? `Hey ${firstName}, ready to play?` : `Let's go, ${firstName}!`}
            </h1>
            <p className="text-base sm:text-lg font-bold text-white/85 mt-3 max-w-xl">
              {isNewUser
                ? 'Answer 3 questions, earn your first 150 XP and unlock your readiness score.'
                : weakestTopic
                  ? `Today's mission: level up ${weakestTopic.topic}. You're at ${weakestTopic.avgScore}/10 there.`
                  : 'Pick a challenge and keep climbing.'}
            </p>

            <div className="flex flex-wrap gap-3 mt-6">
              <button onClick={startFocus} className="btn-white !text-base !px-6 !py-3.5">
                <Play className="w-5 h-5" fill="currentColor" />
                {isNewUser ? 'Start first interview' : 'Start mission'}
              </button>
              <button
                onClick={() => navigate(RESUME_MODE.path)}
                className="btn !text-white bg-white/15 hover:bg-white/25 border-2 border-white/30"
              >
                <FileCheck className="w-5 h-5" />
                Check resume
              </button>
            </div>
          </div>

          {/* Streak panel */}
          <div className="rounded-3xl bg-white text-game-ink p-5 sm:p-6 self-center" style={{ boxShadow: '0 5px 0 rgba(0,0,0,0.15)' }}>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Flame
                  className={`w-16 h-16 ${current > 0 ? 'text-game-orange animate-flicker' : 'text-[#D5D5E3]'}`}
                  fill="currentColor"
                  strokeWidth={1.5}
                />
              </div>
              <div>
                <p className="text-5xl font-black leading-none" style={{ color: current > 0 ? PALETTE.orange.face : '#B0B0C8' }}>
                  {current}
                </p>
                <p className="text-sm font-extrabold text-game-muted mt-1">
                  day streak · best {streak?.longestStreak ?? 0}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1.5 sm:gap-2 mt-5">
              {week.map((d, i) => (
                <div key={i} className="flex flex-col items-center gap-1.5">
                  <span className={`text-[11px] font-black uppercase ${d.isToday ? 'text-game-orange' : 'text-game-muted'}`}>
                    {d.label}
                  </span>
                  <div
                    className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center border-2 ${
                      d.done ? 'bg-game-orange border-game-orange text-white' : d.isToday ? 'border-game-orange border-dashed' : 'border-game-line bg-game-bg'
                    }`}
                    style={d.done ? { boxShadow: '0 3px 0 #D97F00' } : undefined}
                  >
                    {d.done && <Check className="w-4 h-4" strokeWidth={4} />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Quests · Level · Readiness ── */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        <Card delay={60}>
          <CardTitle
            icon={Gift}
            color="orange"
            title="Daily quests"
            action={<span className="badge badge-yellow">{questsDone}/{quests.length}</span>}
          />
          <div className="space-y-4">
            {quests.map((q) => {
              const done = q.value >= q.goal;
              return (
                <div key={q.title} className="flex items-center gap-3">
                  <IconTile icon={done ? Check : q.icon} color={done ? 'green' : q.color} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <p className={`text-sm font-extrabold truncate ${done ? 'text-game-muted line-through' : 'text-game-ink'}`}>{q.title}</p>
                      <span className="text-xs font-black text-game-yellow-edge whitespace-nowrap">{q.reward}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <GameBar value={(q.value / q.goal) * 100} color={done ? 'green' : q.color} height={12} className="flex-1" />
                      <span className="text-xs font-extrabold text-game-muted w-9 text-right">{q.value}/{q.goal}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card delay={120}>
          <CardTitle icon={Shield} color="purple" title="Your level" />
          <div className="flex items-center gap-5">
            <div className="relative w-24 h-24 flex-shrink-0 animate-floaty">
              <Shield className="w-24 h-24 text-game-purple" fill="#7C5CFC" strokeWidth={1.5} />
              <span className="absolute inset-0 flex items-center justify-center pb-1 text-3xl font-black text-white">{level}</span>
            </div>
            <div className="min-w-0">
              <p className="text-3xl font-black text-game-ink leading-none flex items-center gap-2">
                <Gem className="w-7 h-7 text-game-blue" fill="#1CB0F6" fillOpacity={0.2} strokeWidth={2.5} />
                {(streak?.totalXP ?? 0).toLocaleString('en-IN')}
              </p>
              <p className="text-sm font-extrabold text-game-muted mt-1.5">total XP earned</p>
            </div>
          </div>
          <div className="mt-6">
            <div className="flex items-center justify-between text-sm font-extrabold mb-2">
              <span className="text-game-ink">Level {level}</span>
              <span className="text-game-muted">{level >= 10 ? 'Max level' : `Level ${level + 1}`}</span>
            </div>
            <GameBar value={xpInfo?.progress ?? 0} color="purple" height={20} />
            <p className="text-xs font-bold text-game-muted mt-2">
              {level >= 10 ? 'You reached the top level.' : `${xpToNext} XP to go. Every answer earns at least 50 XP.`}
            </p>
          </div>
        </Card>

        <Card delay={180} className="md:col-span-2 xl:col-span-1">
          <CardTitle icon={Target} color="green" title="Interview readiness" />
          <div className="flex items-center gap-5">
            <ScoreRing value={readinessScore} size={112} stroke={13} color={PALETTE.green.face}>
              <span className="text-3xl font-black text-game-ink leading-none">{readinessScore}</span>
              <span className="text-[11px] font-extrabold text-game-muted">of 100</span>
            </ScoreRing>
            <div className="min-w-0">
              <p className="text-xl font-black text-game-green-edge">{readiness?.readinessLabel ?? 'Not started'}</p>
              <p className="text-sm font-semibold text-game-muted mt-1 leading-snug line-clamp-3">
                {readiness?.recommendations?.[0] ?? 'Finish an interview to calculate your score.'}
              </p>
            </div>
          </div>
          {readiness?.breakdown && (
            <div className="grid grid-cols-2 gap-x-4 gap-y-3 mt-5">
              {Object.entries(readiness.breakdown).slice(0, 4).map(([key, val]) => (
                <div key={key}>
                  <div className="flex justify-between text-xs font-extrabold mb-1">
                    <span className="text-game-muted truncate">{READINESS_LABELS[key] ?? key}</span>
                    <span className="text-game-ink">{val}%</span>
                  </div>
                  <GameBar value={val} color={val >= 70 ? 'green' : val >= 40 ? 'blue' : 'orange'} height={10} />
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* ── Challenges ── */}
      <section className="animate-slide-up" style={{ animationDelay: '220ms' }}>
        <div className="flex items-end justify-between mb-4">
          <div>
            <h2 className="text-2xl font-black text-game-ink">Choose your challenge</h2>
            <p className="text-sm font-bold text-game-muted mt-0.5">Every interview earns XP and keeps your streak going</p>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {CHALLENGES.map(({ mode, desc }) => {
            const m = MODES[mode];
            const p = PALETTE[m.color];
            return (
              <button
                key={mode}
                onClick={() => navigate(m.path)}
                className="group relative overflow-hidden text-left rounded-3xl p-5 text-white transition-transform duration-150 hover:-translate-y-1 active:translate-y-1"
                style={{ background: p.face, boxShadow: `0 6px 0 ${p.edge}` }}
              >
                <div className="absolute -right-6 -bottom-6 opacity-20 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
                  <m.icon className="w-32 h-32" strokeWidth={2} />
                </div>
                <div className="relative">
                  <div className="w-12 h-12 rounded-2xl bg-white/25 flex items-center justify-center">
                    <m.icon className="w-6 h-6" strokeWidth={2.6} />
                  </div>
                  <p className="text-xl font-black mt-4 text-outline">{m.name}</p>
                  <p className="text-sm font-bold text-white/85 mt-1 leading-snug">{desc}</p>
                  <span className="inline-flex items-center gap-1 mt-4 rounded-full bg-white/25 px-2.5 py-1 text-xs font-black">
                    <Gem className="w-3.5 h-3.5" /> +50 XP per answer
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* ── Progress chart + skills ── */}
      {!isNewUser && (
        <div className="grid lg:grid-cols-5 gap-6">
          <Card className="lg:col-span-3" delay={260}>
            <CardTitle
              icon={TrendingUp}
              color="blue"
              title="Score journey"
              action={<span className="badge badge-indigo">avg {avgScore}/10</span>}
            />
            <div className="h-64 -ml-4">
              {trendData.length < 2 ? (
                <div className="h-full flex items-center justify-center text-sm font-bold text-game-muted">
                  Complete one more interview to see your journey.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid stroke="#EEEEF6" strokeWidth={2} vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#7A7A95', fontWeight: 800 }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 10]} ticks={[0, 5, 10]} tick={{ fontSize: 12, fill: '#7A7A95', fontWeight: 800 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<TrendTooltip />} cursor={{ stroke: '#BDE8FC', strokeWidth: 2 }} />
                    <Area
                      type="monotone"
                      dataKey="score"
                      stroke="#1CB0F6"
                      strokeWidth={4}
                      fill="#DFF4FE"
                      fillOpacity={1}
                      isAnimationActive={false}
                      dot={{ r: 6, fill: '#fff', stroke: '#1CB0F6', strokeWidth: 3 }}
                      activeDot={{ r: 8, fill: '#1CB0F6', stroke: '#fff', strokeWidth: 3 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>

          <Card className="lg:col-span-2" delay={300}>
            <CardTitle icon={Layers} color="purple" title="Skill tree" />
            <div className="space-y-4">
              {sortedTopics.length === 0 && <p className="text-sm font-bold text-game-muted">No topics yet.</p>}
              {sortedTopics.slice(0, 6).map((t) => {
                const tone = scoreTone(t.avgScore);
                return (
                  <div key={t.topic} className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-black text-white flex-shrink-0"
                      style={{ background: tone.hex, boxShadow: `0 3px 0 ${tone.edge}` }}
                    >
                      {t.avgScore}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-sm font-extrabold text-game-ink truncate">{t.topic}</span>
                        {t.avgScore < 7 ? (
                          <button
                            onClick={() => navigate('/interview', { state: { topic: t.topic } })}
                            className="text-xs font-black uppercase text-game-blue hover:text-game-blue-edge"
                          >
                            Train
                          </button>
                        ) : (
                          <span className="text-xs font-black uppercase text-game-green-edge">Mastered</span>
                        )}
                      </div>
                      <GameBar value={t.avgScore * 10} color={tone.color} height={12} />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}

      {/* ── Medals + recent ── */}
      <div className="grid lg:grid-cols-5 gap-6">
        <Card className={isNewUser ? 'lg:col-span-5' : 'lg:col-span-3'} delay={340}>
          <CardTitle
            icon={Award}
            color="yellow"
            title="Medals"
            action={badges && <span className="badge badge-yellow">{badges.totalEarned} of {badges.totalAvailable}</span>}
          />
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
            {[...(badges?.badges ?? [])]
              .sort((a, b) => Number(b.earned) - Number(a.earned))
              .map((b) => {
                const meta = BADGE_META[b.type] ?? { icon: Award, color: 'yellow' as GameColor };
                const p = PALETTE[meta.color];
                return (
                  <div key={b.type} title={b.description} className="flex flex-col items-center text-center">
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center border-4"
                      style={
                        b.earned
                          ? { background: p.face, borderColor: p.soft, boxShadow: `0 4px 0 ${p.edge}`, color: '#fff' }
                          : { background: '#ECECF4', borderColor: '#F7F7FC', color: '#B0B0C8' }
                      }
                    >
                      {b.earned ? <meta.icon className="w-6 h-6" strokeWidth={2.6} /> : <Lock className="w-5 h-5" strokeWidth={2.6} />}
                    </div>
                    <p className={`text-xs font-extrabold mt-2 leading-tight ${b.earned ? 'text-game-ink' : 'text-[#A9A9BF]'}`}>{b.label}</p>
                  </div>
                );
              })}
          </div>
        </Card>

        {!isNewUser && (
          <Card className="lg:col-span-2 !p-4 sm:!p-6" delay={380}>
            <CardTitle
              icon={CalendarCheck}
              color="green"
              title="Recent battles"
              action={
                <button onClick={() => navigate('/history')} className="text-xs font-black uppercase text-game-blue inline-flex items-center gap-0.5">
                  All <ChevronRight className="w-4 h-4" />
                </button>
              }
            />
            <div className="space-y-1">
              {recent.slice(0, 5).map((item) => {
                const m = modeOf(item.type);
                const tone = item.score !== null ? scoreTone(item.score) : null;
                return (
                  <button
                    key={item.id}
                    onClick={() => navigate(`/reports/${item.id}`)}
                    className="w-full flex items-center gap-3 p-2 rounded-2xl hover:bg-game-bg transition-colors text-left"
                  >
                    <IconTile icon={m.icon} color={m.color} size="sm" soft />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-extrabold text-game-ink truncate">{item.topic}</p>
                      <p className="text-xs font-bold text-game-muted">{m.label} · {formatDate(item.createdAt)}</p>
                    </div>
                    {tone && (
                      <span className="text-sm font-black px-2.5 py-1 rounded-xl" style={{ background: tone.soft, color: tone.textHex }}>
                        {item.score}/10
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
