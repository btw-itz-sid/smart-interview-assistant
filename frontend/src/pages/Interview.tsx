import React, { useState } from 'react';
import { api } from '../services/api';
import ChatBox from '../components/ChatBox';
import {
  Play,
  Loader2,
  BrainCircuit,
  Zap,
  Target,
  ChevronRight,
  AlertCircle,
  ListChecks,
  Bot,
  Timer,
} from 'lucide-react';

const TOPICS = [
  'React.js', 'TypeScript', 'Node.js', 'System Design',
  'Data Structures', 'Algorithms', 'SQL', 'Python',
];

const DIFFICULTIES = [
  { label: 'Easy',   value: 'easy',   color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', activeBg: 'bg-emerald-500', desc: 'Warm-up' },
  { label: 'Medium', value: 'medium', color: 'text-amber-600',   bg: 'bg-amber-50',   border: 'border-amber-200',   activeBg: 'bg-amber-500',   desc: 'Standard' },
  { label: 'Hard',   value: 'hard',   color: 'text-red-600',     bg: 'bg-red-50',     border: 'border-red-200',     activeBg: 'bg-red-500',     desc: 'Challenge' },
] as const;

export default function Interview() {
  const [topic, setTopic]           = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [inProgress, setInProgress] = useState(false);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const [interviewData, setInterviewData] = useState<any>(null);

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
      />
    );
  }

  return (
    <div className="min-h-full flex items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-2xl animate-scale-in">

        {/* Header card */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-400 to-violet-500 mb-5 shadow-lg">
            <BrainCircuit className="w-7 h-7 text-white" />
          </div>
          <h1
            className="text-3xl font-bold text-slate-900 mb-2"
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            AI Mock Interview
          </h1>
          <p className="text-slate-500 text-sm max-w-md mx-auto">
            Choose your topic and difficulty, and our AI will generate 3 targeted questions to test your skills.
          </p>
        </div>

        {/* Form card */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-7 space-y-7">

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Topic */}
          <div>
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 uppercase tracking-wide mb-2.5">
              <Target className="w-3.5 h-3.5 text-indigo-500" />
              Target Topic or Skill
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. React Hooks, System Design, Binary Trees…"
              required
              className="input-field"
            />

            {/* Quick-pick chips */}
            <div className="flex flex-wrap gap-2 mt-3">
              {TOPICS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTopic(t)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-150 ${
                    topic === t
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div>
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 uppercase tracking-wide mb-2.5">
              <Zap className="w-3.5 h-3.5 text-indigo-500" />
              Difficulty Level
            </label>
            <div className="grid grid-cols-3 gap-3">
              {DIFFICULTIES.map((d) => {
                const active = difficulty === d.value;
                return (
                  <button
                    key={d.value}
                    type="button"
                    onClick={() => setDifficulty(d.value)}
                    className={`relative py-4 px-3 rounded-xl border-2 text-center transition-all duration-200 ${
                      active
                        ? `border-current ${d.color} bg-white shadow-sm`
                        : `border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200`
                    }`}
                  >
                    {active && (
                      <div
                        className={`absolute top-2 right-2 w-2 h-2 rounded-full ${d.activeBg}`}
                      />
                    )}
                    <p className="font-semibold text-sm">{d.label}</p>
                    <p className="text-[11px] mt-0.5 opacity-70">{d.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !topic.trim()}
            onClick={startInterview as any}
            className="btn-primary w-full py-3.5 text-base disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Preparing Interview…
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-current" />
                Start Mock Interview
                <ChevronRight className="w-4 h-4 ml-auto" />
              </>
            )}
          </button>
        </div>

        {/* Info chips */}
        <div className="flex items-center justify-center gap-6 mt-5">
          {[
            { label: '3 Questions', icon: ListChecks },
            { label: 'AI Evaluation', icon: Bot },
            { label: 'Instant Score', icon: Timer },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-1.5 text-xs text-slate-400">
              <item.icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
