import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { api } from '../services/api';
import ChatBox from '../components/ChatBox';
import PageHeader from '../components/PageHeader';
import { IconTile } from '../components/Game';
import { MODES, PALETTE, scoreTone, type GameColor } from '../lib/interviewUi';
import { Play, Loader2, Target, AlertCircle, ListChecks, Bot, Timer, TrendingUp, Gem, Gauge, Flame } from 'lucide-react';

const TOPICS = [
  'React.js', 'TypeScript', 'Node.js', 'System Design',
  'Data Structures', 'Algorithms', 'SQL', 'Python',
];

const DIFFICULTIES: { label: string; value: 'easy' | 'medium' | 'hard'; color: GameColor; desc: string; bars: number }[] = [
  { label: 'Easy',   value: 'easy',   color: 'green',  desc: 'Warm-up',   bars: 1 },
  { label: 'Medium', value: 'medium', color: 'orange', desc: 'Standard',  bars: 2 },
  { label: 'Hard',   value: 'hard',   color: 'red',    desc: 'Challenge', bars: 3 },
];

const STEPS: { icon: React.ElementType; color: GameColor; title: string; desc: string }[] = [
  { icon: ListChecks, color: 'blue',   title: '3 tailored questions',  desc: 'Scenario-based, not textbook definitions' },
  { icon: Bot,        color: 'purple', title: 'AI feedback per answer', desc: 'A score out of 10 with what to improve' },
  { icon: TrendingUp, color: 'green',  title: 'XP and streak',          desc: '+50 XP per answer, +30 more while averaging 7+' },
];

const mode = MODES.general;

export default function Interview() {
  const location = useLocation();
  const [topic, setTopic]           = useState<string>((location.state as { topic?: string } | null)?.topic ?? '');
  const [weakTopics, setWeakTopics] = useState<{ topic: string; averageScore: number }[]>([]);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [timerEnabled, setTimerEnabled] = useState(false);
  const [timerMinutes, setTimerMinutes] = useState(3);
  const [inProgress, setInProgress] = useState(false);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const [interviewData, setInterviewData] = useState<any>(null);

  useEffect(() => {
    api.get('/progress/topics')
      .then((res) => {
        const list = (res.data.data || []) as { topic: string; averageScore: number }[];
        setWeakTopics([...list].sort((a, b) => a.averageScore - b.averageScore).slice(0, 4));
      })
      .catch(() => {});
  }, []);

  const startInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/ai/generate-questions', { topic, difficulty, count: 3 });
      if (res.data.success) {
        setInterviewData(res.data.data);
        setInProgress(true);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to start interview. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (inProgress && interviewData) {
    return (
      <ChatBox
        interviewId={interviewData.interviewId}
        topic={interviewData.topic}
        questions={interviewData.questions}
        onEnd={() => setInProgress(false)}
        timerEnabled={timerEnabled}
        timerSeconds={timerMinutes * 60}
      />
    );
  }

  return (
    <div className="min-h-full p-4 sm:p-6 md:p-8 max-w-6xl mx-auto">
      <PageHeader
        icon={mode.icon}
        color={mode.color}
        title="Mock interview"
        tag={<><Gem className="w-3 h-3" /> +50 XP per answer</>}
        subtitle="Pick a topic and difficulty. The AI asks 3 questions and scores every answer."
      />

      <div className="grid lg:grid-cols-3 gap-6 items-start">
        <form onSubmit={startInterview} className="card lg:col-span-2 space-y-7 animate-slide-up">
          {error && (
            <div className="bg-game-red-soft border-2 border-[#FFC2C2] text-game-red-edge rounded-2xl px-4 py-3 text-sm font-bold flex items-start gap-2">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="flex items-center gap-2 text-base font-black text-game-ink mb-3">
              <Target className="w-5 h-5 text-game-blue" strokeWidth={2.6} />
              What do you want to practice?
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. React Hooks, System Design, Binary Trees…"
              required
              className="input-field !text-base"
            />
            <div className="flex flex-wrap gap-2 mt-3">
              {TOPICS.map((t) => (
                <button key={t} type="button" onClick={() => setTopic(t)} className={`chip ${topic === t ? 'selected' : ''}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-base font-black text-game-ink mb-3">
              <Gauge className="w-5 h-5 text-game-orange" strokeWidth={2.6} />
              Difficulty
            </label>
            <div className="grid grid-cols-3 gap-3">
              {DIFFICULTIES.map((d) => {
                const active = difficulty === d.value;
                const p = PALETTE[d.color];
                return (
                  <button
                    key={d.value}
                    type="button"
                    onClick={() => setDifficulty(d.value)}
                    className="choice py-4 px-3 text-center"
                    style={active ? { borderColor: p.face, background: p.soft, color: p.text, boxShadow: `0 3px 0 ${p.face}` } : undefined}
                  >
                    <div className="flex justify-center gap-1 mb-2">
                      {[1, 2, 3].map((i) => (
                        <Flame
                          key={i}
                          className="w-5 h-5"
                          strokeWidth={2.4}
                          style={{ color: i <= d.bars ? p.face : '#D5D5E3' }}
                          fill={i <= d.bars ? p.face : 'transparent'}
                        />
                      ))}
                    </div>
                    <p className="font-black text-base">{d.label}</p>
                    <p className="text-xs font-bold text-game-muted mt-0.5">{d.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 p-4 rounded-2xl border-2 border-game-line bg-game-bg">
            <div className="flex items-center gap-3">
              <IconTile icon={Timer} color="red" size="sm" soft={!timerEnabled} />
              <div>
                <p className="text-sm font-black text-game-ink">Pressure mode</p>
                <p className="text-xs font-bold text-game-muted">Countdown timer on every question</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {timerEnabled && (
                <select
                  value={timerMinutes}
                  onChange={(e) => setTimerMinutes(Number(e.target.value))}
                  className="text-sm font-extrabold border-2 border-game-line rounded-xl px-2 py-1.5 bg-white text-game-ink outline-none"
                >
                  <option value={2}>2 min</option>
                  <option value={3}>3 min</option>
                  <option value={5}>5 min</option>
                </select>
              )}
              <button
                type="button"
                role="switch"
                aria-checked={timerEnabled}
                onClick={() => setTimerEnabled(!timerEnabled)}
                className={`relative rounded-full transition-colors duration-200 ${timerEnabled ? 'bg-game-red' : 'bg-[#D5D5E3]'}`}
                style={{ width: 52, height: 30 }}
              >
                <span
                  className="absolute top-[3px] rounded-full bg-white transition-all duration-200"
                  style={{ width: 24, height: 24, left: timerEnabled ? 25 : 3, boxShadow: '0 2px 0 rgba(0,0,0,0.15)' }}
                />
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading || !topic.trim()} className="btn-green w-full !py-4 !text-base">
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Preparing interview…
              </>
            ) : (
              <>
                <Play className="w-5 h-5" fill="currentColor" />
                Start interview
              </>
            )}
          </button>
        </form>

        <aside className="space-y-6 animate-slide-up" style={{ animationDelay: '80ms' }}>
          {weakTopics.length > 0 && (
            <div className="card">
              <p className="section-title">Boss battles</p>
              <p className="text-sm font-bold text-game-muted mt-0.5 mb-4">Your weakest topics. Beat them to raise readiness fastest.</p>
              <div className="space-y-2">
                {weakTopics.map((t) => {
                  const tone = scoreTone(t.averageScore);
                  const active = topic === t.topic;
                  return (
                    <button
                      key={t.topic}
                      type="button"
                      onClick={() => setTopic(t.topic)}
                      className={`choice w-full flex items-center justify-between gap-3 px-3 py-2.5 text-left ${active ? 'selected' : ''}`}
                    >
                      <span className="text-sm font-extrabold truncate">{t.topic}</span>
                      <span className="text-xs font-black px-2 py-0.5 rounded-lg" style={{ background: tone.soft, color: tone.textHex }}>
                        {t.averageScore}/10
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="card">
            <p className="section-title mb-4">How it works</p>
            <div className="space-y-4">
              {STEPS.map(({ icon, color, title, desc }) => (
                <div key={title} className="flex items-start gap-3">
                  <IconTile icon={icon} color={color} size="sm" />
                  <div>
                    <p className="text-sm font-black text-game-ink">{title}</p>
                    <p className="text-xs font-bold text-game-muted">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
