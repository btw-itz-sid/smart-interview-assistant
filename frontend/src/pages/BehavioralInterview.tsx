import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import PageHeader from '../components/PageHeader';
import { GameBar, IconTile, ScoreRing } from '../components/Game';
import { MODES, PALETTE, scoreTone, type GameColor } from '../lib/interviewUi';
import { refreshGameStats } from '../lib/useGameStats';
import {
  Play, Loader2, Check, AlertCircle, Target, Bot, FileText, X, Lightbulb, Trophy, RotateCcw, Home,
  Shuffle, Sparkles, Crown, Handshake, CloudFog, Layers, Gem,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FOCUS_AREAS: { label: string; value: string; desc: string; icon: React.ElementType; color: GameColor }[] = [
  { label: 'Adaptability',        value: 'adaptability', desc: 'Handling change & learning',    icon: Shuffle,   color: 'blue' },
  { label: 'AI-Era Judgment',     value: 'ai-judgment',  desc: 'Working with AI tools',         icon: Sparkles,  color: 'purple' },
  { label: 'Leadership',          value: 'leadership',   desc: 'Ownership & influence',         icon: Crown,     color: 'yellow' },
  { label: 'Conflict Resolution', value: 'conflict',     desc: 'Navigating disagreements',      icon: Handshake, color: 'green' },
  { label: 'Ambiguity',           value: 'ambiguity',    desc: 'Deciding with incomplete data', icon: CloudFog,  color: 'orange' },
  { label: 'General',             value: 'general',      desc: 'Mixed behavioral themes',       icon: Layers,    color: 'pink' },
];

const STAR_L: [string, string, string, GameColor][] = [
  ['S', 'Situation', 'Set the scene in one or two sentences', 'blue'],
  ['T', 'Task', 'What you were responsible for', 'purple'],
  ['A', 'Action', 'The specific steps you took', 'orange'],
  ['R', 'Result', 'The outcome, with numbers if possible', 'green'],
  ['L', 'Learning', 'What you would do differently next time', 'pink'],
];

const mode = MODES.behavioral;

const StarBar = ({ label, score, max = 2 }: { label: string; score: number; max?: number }) => (
  <div className="flex items-center gap-3">
    <span className="text-sm font-extrabold text-game-muted w-20">{label}</span>
    <GameBar value={(score / max) * 100} color={score >= 1.5 ? 'green' : score >= 1 ? 'orange' : 'red'} height={12} className="flex-1" />
    <span className="text-sm font-black text-game-ink w-10 text-right">{score}/{max}</span>
  </div>
);

export default function BehavioralInterview() {
  const [focusArea, setFocusArea] = useState('general');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [session, setSession] = useState<any>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answer, setAnswer] = useState('');
  const [evaluating, setEvaluating] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const navigate = useNavigate();

  const questionText = (q: any) => (typeof q === 'string' ? q : q?.question || '');
  const questionId = (q: any) => (typeof q === 'string' ? undefined : q?.id);

  const startInterview = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/ai/behavioral', { focusArea, count: 4 });
      if (res.data.success) {
        setSession(res.data.data);
        setCurrentIdx(0);
        setResults([]);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to start behavioral interview');
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (!answer.trim() || evaluating) return;
    setEvaluating(true);
    try {
      const current = session.questions[currentIdx];
      const res = await api.post('/ai/behavioral/evaluate', {
        question: questionText(current),
        answer: answer.trim(),
        interviewId: session.interviewId,
        questionId: questionId(current),
      });
      const ev = res.data.data;
      setResults(prev => [...prev, { question: questionText(current), answer: answer.trim(), ...ev }]);
      setAnswer('');
      refreshGameStats();
      if (currentIdx + 1 < session.questions.length) {
        setCurrentIdx(prev => prev + 1);
      }
    } catch {
      setError('Evaluation failed. Please try again.');
    } finally {
      setEvaluating(false);
    }
  };

  const isComplete = session && results.length >= session.questions.length;
  const avgScore = results.length > 0 ? Math.round(results.reduce((s, r) => s + r.score, 0) / results.length * 10) / 10 : 0;

  // Setup screen
  if (!session) {
    return (
      <div className="min-h-full p-4 sm:p-6 md:p-8 max-w-6xl mx-auto">
        <PageHeader
          icon={mode.icon}
          color={mode.color}
          title="Behavioral interview"
          tag={<><Gem className="w-3 h-3" /> +50 XP per answer</>}
          subtitle="Answer situation-based questions using STAR-L and get scored on each part."
        />

        <div className="grid lg:grid-cols-3 gap-6 items-start">
          <div className="card lg:col-span-2 space-y-6 animate-slide-up">
            {error && (
              <div className="bg-game-red-soft border-2 border-[#FFC2C2] text-game-red-edge rounded-2xl px-4 py-3 text-sm font-bold flex items-start gap-2">
                <AlertCircle className="w-5 h-5 shrink-0" /><span>{error}</span>
              </div>
            )}

            <div>
              <p className="flex items-center gap-2 text-base font-black text-game-ink mb-4">
                <Target className="w-5 h-5 text-game-pink" strokeWidth={2.6} /> Choose a focus area
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {FOCUS_AREAS.map((f) => {
                  const active = focusArea === f.value;
                  const p = PALETTE[f.color];
                  return (
                    <button
                      key={f.value}
                      onClick={() => setFocusArea(f.value)}
                      className="choice p-4 text-left"
                      style={active ? { borderColor: p.face, background: p.soft, boxShadow: `0 3px 0 ${p.face}` } : undefined}
                    >
                      <IconTile icon={f.icon} color={f.color} size="sm" soft={!active} />
                      <p className="font-black text-sm mt-3" style={active ? { color: p.text } : undefined}>{f.label}</p>
                      <p className="text-xs font-bold text-game-muted mt-0.5">{f.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <button onClick={startInterview} disabled={loading} className="btn-green w-full !py-4 !text-base">
              {loading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Generating questions…</>
              ) : (
                <><Play className="w-5 h-5" fill="currentColor" /> Start behavioral interview</>
              )}
            </button>
          </div>

          <aside className="card animate-slide-up" style={{ animationDelay: '80ms' }}>
            <p className="section-title">The STAR-L framework</p>
            <p className="text-sm font-bold text-game-muted mt-0.5 mb-5">Structure every answer in this order. Quantify results and say what <em>you</em> did.</p>
            <ol className="space-y-3.5">
              {STAR_L.map(([letter, name, hint, color]) => {
                const p = PALETTE[color];
                return (
                  <li key={letter} className="flex items-start gap-3">
                    <span
                      className="w-10 h-10 rounded-2xl text-white font-black text-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: p.face, boxShadow: `0 3px 0 ${p.edge}` }}
                    >
                      {letter}
                    </span>
                    <div>
                      <p className="text-sm font-black text-game-ink">{name}</p>
                      <p className="text-xs font-bold text-game-muted">{hint}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </aside>
        </div>
      </div>
    );
  }

  // Results screen
  if (isComplete) {
    const tone = scoreTone(avgScore);
    return (
      <div className="min-h-full p-4 sm:p-6 md:p-8 max-w-4xl mx-auto">
        <div className="card text-center !p-7 sm:!p-9 mb-6 animate-scale-in">
          <div className="inline-flex animate-floaty">
            <IconTile icon={Trophy} color="yellow" size="xl" />
          </div>
          <h1 className="text-3xl font-black text-game-ink mt-5">Behavioral round complete!</h1>
          <div className="flex justify-center mt-6">
            <ScoreRing value={avgScore} max={10} size={110} stroke={12} color={tone.hex}>
              <span className="text-3xl font-black text-game-ink leading-none">{avgScore}</span>
              <span className="text-xs font-extrabold text-game-muted">avg / 10</span>
            </ScoreRing>
          </div>
          <div className="flex flex-col sm:flex-row justify-center gap-3 mt-8">
            {session.interviewId && (
              <button onClick={() => navigate(`/reports/${session.interviewId}`)} className="btn-primary">
                <FileText className="w-5 h-5" /> View report
              </button>
            )}
            <button onClick={() => { setSession(null); setResults([]); }} className="btn-ghost">
              <RotateCcw className="w-5 h-5" /> Try another focus
            </button>
            <button onClick={() => navigate('/')} className="btn-ghost">
              <Home className="w-5 h-5" /> Dashboard
            </button>
          </div>
        </div>

        <div className="space-y-5">
          {results.map((r, i) => {
            const t = scoreTone(r.score);
            return (
              <div key={i} className="card animate-slide-up" style={{ animationDelay: `${i * 80}ms` }}>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <p className="text-base font-black text-game-ink flex-1">
                    <span className="text-game-pink">Q{i + 1}.</span> {r.question}
                  </p>
                  <span className="text-base font-black text-white px-3 py-1 rounded-2xl flex-shrink-0" style={{ background: t.hex, boxShadow: `0 3px 0 ${t.edge}` }}>
                    {r.score}/10
                  </span>
                </div>

                {r.starBreakdown && (
                  <div className="rounded-2xl border-2 border-game-line bg-game-bg p-4 mb-4 space-y-2.5">
                    <p className="eyebrow text-game-muted mb-1">STAR-L breakdown</p>
                    <StarBar label="Situation" score={r.starBreakdown.situation} />
                    <StarBar label="Task" score={r.starBreakdown.task} />
                    <StarBar label="Action" score={r.starBreakdown.action} />
                    <StarBar label="Result" score={r.starBreakdown.result} />
                    <StarBar label="Learning" score={r.starBreakdown.learning} />
                  </div>
                )}

                <p className="text-[15px] font-semibold text-game-ink/80 leading-relaxed whitespace-pre-wrap">{r.evaluation}</p>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Active interview screen
  const progress = (results.length / session.questions.length) * 100;
  return (
    <div className="flex flex-col h-full bg-game-bg">
      <header className="bg-white border-b-2 border-game-line px-3 sm:px-6 py-3">
        <div className="max-w-3xl mx-auto flex items-center gap-3 sm:gap-4">
          <button
            onClick={() => { setSession(null); setResults([]); }}
            className="p-2 rounded-xl text-[#B0B0C8] hover:text-game-ink hover:bg-game-bg transition-colors"
            title="End session"
            aria-label="End session"
          >
            <X className="w-6 h-6" strokeWidth={3} />
          </button>
          <GameBar value={progress} color="pink" height={18} className="flex-1" />
          <span className="text-sm font-black text-game-muted whitespace-nowrap">{currentIdx + 1}/{session.questions.length}</span>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto w-full px-4 py-6 space-y-5">
          {session.tips && (
            <div className="rounded-3xl border-2 border-[#FFE58A] bg-game-yellow-soft p-5">
              <p className="flex items-center gap-2 text-sm font-black text-[#7A5C00] mb-2">
                <Lightbulb className="w-5 h-5" strokeWidth={2.6} /> Tips for this round
              </p>
              <ul className="space-y-1.5">
                {session.tips.map((tip: string, i: number) => (
                  <li key={i} className="text-sm font-semibold text-[#7A5C00] flex items-start gap-2">
                    <Check className="w-4 h-4 mt-0.5 flex-shrink-0" strokeWidth={3} /> {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {results.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {results.map((r, i) => {
                const t = scoreTone(r.score);
                return (
                  <span key={i} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-black" style={{ background: t.soft, color: t.textHex }}>
                    <Check className="w-3.5 h-3.5" strokeWidth={3.5} /> Q{i + 1}: {r.score}/10
                  </span>
                );
              })}
            </div>
          )}

          <AnimatePresence mode="wait">
            <motion.div key={currentIdx} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex items-end gap-3">
              <IconTile icon={Bot} color="pink" size="md" />
              <div className="max-w-[85%]">
                <p className="text-xs font-black uppercase tracking-wider mb-1.5 text-game-pink">Question {currentIdx + 1}</p>
                <div className="rounded-3xl rounded-bl-lg border-2 border-game-line bg-white px-5 py-4 text-base font-bold text-game-ink leading-relaxed" style={{ boxShadow: '0 4px 0 #E5E5F0' }}>
                  {questionText(session.questions[currentIdx])}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div className="bg-white border-t-2 border-game-line px-4 py-4">
        <div className="max-w-3xl mx-auto">
          {error && <p className="text-sm font-bold text-game-red-edge mb-2">{error}</p>}
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitAnswer(); } }}
            placeholder={evaluating ? 'Scoring your answer against STAR-L…' : 'Situation → Task → Action → Result → Learning'}
            disabled={evaluating}
            rows={4}
            className="input-field resize-none disabled:opacity-60"
          />
          <div className="flex items-center justify-between gap-3 mt-3">
            <span className="hidden sm:inline text-xs font-bold text-game-muted">Enter to submit · Shift+Enter for a new line</span>
            <button onClick={submitAnswer} disabled={!answer.trim() || evaluating} className="btn-green !px-8 ml-auto">
              {evaluating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" strokeWidth={3} />}
              Check
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
