import { useState } from 'react';
import { api } from '../services/api';
import {
  BrainCircuit, Play, Loader2, Send, ChevronRight, Lightbulb,
  CheckCircle2, AlertCircle, Target, Bot,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FOCUS_AREAS = [
  { label: 'Adaptability', value: 'adaptability', desc: 'Handling change & learning' },
  { label: 'AI-Era Judgment', value: 'ai-judgment', desc: 'Working with AI tools' },
  { label: 'Leadership', value: 'leadership', desc: 'Ownership & influence' },
  { label: 'Conflict Resolution', value: 'conflict', desc: 'Navigating disagreements' },
  { label: 'Ambiguity', value: 'ambiguity', desc: 'Deciding with incomplete data' },
  { label: 'General', value: 'general', desc: 'Mixed behavioral themes' },
];



export default function BehavioralInterview() {
  const [focusArea, setFocusArea] = useState('general');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [session, setSession] = useState<any>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answer, setAnswer] = useState('');
  const [evaluating, setEvaluating] = useState(false);
  const [results, setResults] = useState<any[]>([]);

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
      const res = await api.post('/ai/behavioral/evaluate', {
        question: session.questions[currentIdx],
        answer: answer.trim(),
      });
      const ev = res.data.data;
      setResults(prev => [...prev, { question: session.questions[currentIdx], answer: answer.trim(), ...ev }]);
      setAnswer('');
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

  // STAR breakdown bar component
  const StarBar = ({ label, score, max = 2 }: { label: string; score: number; max?: number }) => (
    <div className="flex items-center gap-3">
      <span className="text-xs font-medium text-slate-500 w-20">{label}</span>
      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${(score / max) * 100}%`,
            background: score >= 1.5 ? '#10b981' : score >= 1 ? '#f59e0b' : '#ef4444',
          }}
        />
      </div>
      <span className="text-xs font-bold text-slate-600 w-8 text-right">{score}/{max}</span>
    </div>
  );

  // Setup screen
  if (!session) {
    return (
      <div className="min-h-full flex items-center justify-center p-6">
        <div className="w-full max-w-2xl animate-scale-in">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-400 to-purple-600 mb-5 shadow-lg">
              <BrainCircuit className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Behavioral Interview
            </h1>
            <p className="text-slate-500 text-sm max-w-md mx-auto">
              Answer behavioral questions using the STAR-L method \u2014 the standard structure for situation-based interviews.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-7 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" /><span>{error}</span>
              </div>
            )}

            {/* STAR-L Framework Info */}
            <div className="bg-violet-50 border border-violet-100 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="w-4 h-4 text-violet-500" />
                <p className="text-xs font-semibold text-violet-700 uppercase tracking-wider">STAR-L Framework</p>
              </div>
              <p className="text-sm text-violet-900 leading-relaxed">
                Structure every answer: <strong>S</strong>ituation → <strong>T</strong>ask → <strong>A</strong>ction → <strong>R</strong>esult → <strong>L</strong>earning. Quantify results and show what <em>you</em> personally did.
              </p>
            </div>

            {/* Focus area selection */}
            <div>
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 uppercase tracking-wide mb-3">
                <Target className="w-3.5 h-3.5 text-violet-500" /> Focus Area
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {FOCUS_AREAS.map(f => (
                  <button
                    key={f.value}
                    onClick={() => setFocusArea(f.value)}
                    className={`py-3 px-3 rounded-xl border-2 text-center transition-all duration-200 ${
                      focusArea === f.value
                        ? 'border-violet-400 text-violet-700 bg-violet-50 shadow-sm'
                        : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200'
                    }`}
                  >
                    <p className="font-semibold text-sm">{f.label}</p>
                    <p className="text-[10px] mt-0.5 opacity-70">{f.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={startInterview}
              disabled={loading}
              className="btn-primary w-full py-3.5 text-base disabled:opacity-60"
            >
              {loading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Generating Questions…</>
              ) : (
                <><Play className="w-5 h-5 fill-current" /> Start Behavioral Interview</>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Results screen
  if (isComplete) {
    return (
      <div className="min-h-full p-6 md:p-8 max-w-4xl mx-auto">
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-green-600 mb-4">
            <CheckCircle2 className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Behavioral Interview Complete
          </h1>
          <p className="text-slate-500 text-sm">Average Score: <span className="font-bold text-slate-800">{avgScore}/10</span></p>
        </div>

        <div className="space-y-5">
          {results.map((r, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-6 animate-slide-up" style={{ animationDelay: `${i * 100}ms` }}>
              <div className="flex items-start justify-between mb-3">
                <p className="text-sm font-semibold text-slate-800 flex-1">Q{i + 1}: {r.question}</p>
                <span className={`badge ml-3 ${r.score >= 7 ? 'badge-green' : r.score >= 4 ? 'badge-yellow' : 'badge-red'}`}>
                  {r.score}/10
                </span>
              </div>

              {/* STAR-L Breakdown */}
              {r.starBreakdown && (
                <div className="bg-slate-50 rounded-lg p-4 mb-3 space-y-2">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2">STAR-L Breakdown</p>
                  <StarBar label="Situation" score={r.starBreakdown.situation} />
                  <StarBar label="Task" score={r.starBreakdown.task} />
                  <StarBar label="Action" score={r.starBreakdown.action} />
                  <StarBar label="Result" score={r.starBreakdown.result} />
                  <StarBar label="Learning" score={r.starBreakdown.learning} />
                </div>
              )}

              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{r.evaluation}</p>
            </div>
          ))}
        </div>

        <div className="flex justify-center mt-8 gap-3">
          <button onClick={() => { setSession(null); setResults([]); }} className="btn-ghost">
            Try Another Focus
          </button>
          <button onClick={() => window.location.href = '/'} className="btn-primary">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Active interview screen
  return (
    <div className="flex flex-col h-full" style={{ background: '#0d0f17' }}>
      {/* Header */}
      <header className="flex items-center justify-between px-5 py-3.5 border-b" style={{ background: '#13151f', borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center">
            <BrainCircuit className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-white text-sm font-semibold leading-tight">Behavioral Interview</p>
            <p className="text-[11px] text-slate-500 font-medium">STAR-L Framework • {focusArea}</p>
          </div>
          <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse ml-1" />
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold" style={{ background: 'rgba(255,255,255,0.06)', color: '#94a3b8' }}>
          <ChevronRight className="w-3 h-3 text-violet-400" /> Q {currentIdx + 1} / {session.questions.length}
        </div>
      </header>

      {/* Progress bar */}
      <div className="h-0.5 bg-white/5">
        <div className="h-full bg-gradient-to-r from-violet-500 to-purple-500 transition-all duration-700" style={{ width: `${(results.length / session.questions.length) * 100}%` }} />
      </div>

      {/* Question & Tips */}
      <div className="flex-1 overflow-y-auto px-4 py-6 max-w-4xl mx-auto w-full space-y-4">
        {/* Framework tips */}
        {session.tips && (
          <div className="rounded-xl p-4" style={{ background: '#1a1e2e', border: '1px solid rgba(255,255,255,0.07)' }}>
            <p className="text-[10px] font-semibold text-violet-400 uppercase tracking-widest mb-2">Tips for This Round</p>
            <ul className="space-y-1">
              {session.tips.map((tip: string, i: number) => (
                <li key={i} className="text-xs text-slate-400 flex items-start gap-2">
                  <span className="text-violet-400 mt-0.5">•</span> {tip}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Current question */}
        <AnimatePresence mode="wait">
          <motion.div key={currentIdx} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Bot className="w-4 h-4 text-slate-300" />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 mb-1.5">Interviewer</p>
              <div className="px-4 py-3.5 rounded-2xl rounded-tl-sm text-sm text-slate-200 leading-relaxed" style={{ background: '#1a1e2e', border: '1px solid rgba(255,255,255,0.07)' }}>
                {session.questions[currentIdx]}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Previous results for this session */}
        {results.map((r, i) => (
          <div key={i} className="ml-11 rounded-lg p-3" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)' }}>
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs font-bold text-emerald-400">Q{i + 1}: {r.score}/10</span>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-4 pb-5 border-t" style={{ background: '#13151f', borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="max-w-4xl mx-auto">
          {error && <p className="text-xs text-red-400 mb-2">{error}</p>}
          <div className="relative">
            <textarea
              value={answer}
              onChange={e => setAnswer(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitAnswer(); } }}
              placeholder={evaluating ? 'Evaluating your answer with STAR-L framework…' : 'Structure your answer: Situation → Task → Action → Result → Learning'}
              disabled={evaluating}
              rows={4}
              className="w-full rounded-xl text-sm text-white placeholder:text-slate-600 outline-none resize-none pr-14 pl-4 py-3.5 transition-all disabled:opacity-40"
              style={{ background: '#0d0f17', border: '1px solid rgba(255,255,255,0.08)' }}
            />
            <button
              onClick={submitAnswer}
              disabled={!answer.trim() || evaluating}
              className="absolute bottom-3 right-3 w-9 h-9 rounded-lg flex items-center justify-center text-white transition-all disabled:opacity-30"
              style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}
            >
              {evaluating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
