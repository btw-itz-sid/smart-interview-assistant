// ============================================================
// CompanyInterview.tsx — Company-Specific Mock Interview Page
// User selects company + role → AI generates targeted questions
// ============================================================

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';
import {
  Building2, ChevronRight, Loader2, Lightbulb,
  ArrowLeft, Play, CheckCircle, AlertTriangle
} from 'lucide-react';

// ── Company data ──────────────────────────────────────────
const COMPANIES = [
  { name: 'Google', logo: '🟡', color: 'bg-yellow-50 border-yellow-200 text-yellow-700', style: 'Google focuses on problem-solving clarity and scalability thinking.' },
  { name: 'Amazon', logo: '🟠', color: 'bg-orange-50 border-orange-200 text-orange-700', style: 'Amazon is heavily LP (Leadership Principle) driven — every answer should map to a principle.' },
  { name: 'Microsoft', logo: '🔵', color: 'bg-blue-50 border-blue-200 text-blue-700', style: 'Microsoft values growth mindset, collaboration, and system design depth.' },
  { name: 'Meta', logo: '🟣', color: 'bg-purple-50 border-purple-200 text-purple-700', style: 'Meta focuses on impact at scale, data-driven decisions, and fast execution.' },
  { name: 'Flipkart', logo: '🛒', color: 'bg-indigo-50 border-indigo-200 text-indigo-700', style: 'Flipkart values ownership, product thinking, and execution speed.' },
  { name: 'TCS', logo: '🏢', color: 'bg-teal-50 border-teal-200 text-teal-700', style: 'TCS interviews assess fundamentals, communication, and adaptability.' },
  { name: 'Infosys', logo: '💻', color: 'bg-green-50 border-green-200 text-green-700', style: 'Infosys focuses on technical basics and situational problem-solving.' },
  { name: 'Wipro', logo: '🔷', color: 'bg-sky-50 border-sky-200 text-sky-700', style: 'Wipro emphasizes communication, teamwork, and core tech skills.' },
  { name: 'Startups', logo: '🚀', color: 'bg-rose-50 border-rose-200 text-rose-700', style: 'Startups value versatility, ownership mindset, and speed of learning.' },
];

const ROLES = [
  'Software Engineer', 'Frontend Developer', 'Backend Developer',
  'Full Stack Developer', 'Data Scientist', 'ML Engineer',
  'DevOps Engineer', 'Product Manager', 'System Design Engineer',
  'Mobile Developer (iOS/Android)',
];

const DIFFICULTIES = [
  { val: 'easy', label: 'Easy', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  { val: 'medium', label: 'Medium', color: 'text-amber-600 bg-amber-50 border-amber-200' },
  { val: 'hard', label: 'Hard', color: 'text-red-600 bg-red-50 border-red-200' },
];

// ── Inline ChatBox-style session ──────────────────────────
function InterviewSession({ data, onReset }: { data: any; onReset: () => void }) {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<string[]>(Array(data.questions.length).fill(''));
  const [done, setDone] = useState(false);
  const navigate = useNavigate();

  const q = data.questions[current];
  const total = data.questions.length;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Company banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 mb-5 flex items-start gap-3">
        <Lightbulb className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-xs font-semibold text-slate-500 mb-0.5">Interview Style</p>
          <p className="text-sm text-slate-700">{data.companyInfo}</p>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 mb-6">
        <p className="text-xs font-semibold text-indigo-600 mb-2 uppercase tracking-wider">Pro Tips</p>
        <ul className="space-y-1">
          {data.tips.map((tip: string, i: number) => (
            <li key={i} className="flex items-start gap-2 text-sm text-indigo-800">
              <CheckCircle className="w-3.5 h-3.5 mt-0.5 text-indigo-400 flex-shrink-0" />
              {tip}
            </li>
          ))}
        </ul>
      </div>

      {done ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-emerald-200 rounded-xl p-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-7 h-7 text-emerald-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Session Complete!</h2>
          <p className="text-sm text-slate-500 mb-6">You answered all {total} questions. Review your responses below.</p>
          <div className="space-y-3 text-left mb-6 max-h-64 overflow-y-auto pr-1">
            {data.questions.map((q: string, i: number) => (
              <div key={i} className="bg-slate-50 rounded-lg p-3">
                <p className="text-xs font-semibold text-slate-500 mb-1">Q{i + 1}. {q}</p>
                <p className="text-sm text-slate-700">{answers[i] || <span className="text-slate-400 italic">No answer</span>}</p>
              </div>
            ))}
          </div>
          <div className="flex gap-3 justify-center">
            <button onClick={onReset} className="px-5 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50">
              Try Another Company
            </button>
            <button onClick={() => navigate('/')} className="btn-primary text-sm px-5 py-2">
              Go to Dashboard
            </button>
          </div>
        </motion.div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          {/* Progress */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Question {current + 1} of {total}
            </span>
            <div className="flex gap-1">
              {data.questions.map((_: any, i: number) => (
                <div key={i} className={`h-1.5 w-6 rounded-full transition-colors ${i <= current ? 'bg-indigo-500' : 'bg-slate-100'}`} />
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={current} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <p className="text-base font-semibold text-slate-900 mb-4 leading-relaxed">{q}</p>
              <textarea
                className="w-full h-36 bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm text-slate-800 resize-none focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                placeholder="Type your answer here…"
                value={answers[current]}
                onChange={e => {
                  const updated = [...answers];
                  updated[current] = e.target.value;
                  setAnswers(updated);
                }}
              />
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center justify-between mt-4">
            <button
              onClick={() => setCurrent(p => p - 1)}
              disabled={current === 0}
              className="text-sm font-medium text-slate-500 hover:text-slate-700 disabled:opacity-30 flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            {current < total - 1 ? (
              <button onClick={() => setCurrent(p => p + 1)} className="btn-primary text-sm px-5 py-2">
                Next <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button onClick={() => setDone(true)} className="btn-primary text-sm px-5 py-2 bg-emerald-600 hover:bg-emerald-700">
                Finish Session <CheckCircle className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────
export default function CompanyInterview() {
  const [selectedCompany, setSelectedCompany] = useState('');
  const [role, setRole] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [count, setCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<any>(null);
  const navigate = useNavigate();

  const handleGenerate = async () => {
    if (!selectedCompany || !role) { setError('Please select a company and role'); return; }
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/ai/company-interview', { company: selectedCompany, role, difficulty, count });
      setResult(res.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to generate interview. Try again.');
    } finally {
      setLoading(false);
    }
  };

  if (result) return (
    <div className="min-h-full p-6 md:p-8 max-w-7xl mx-auto">
      <button onClick={() => setResult(null)} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-6 font-medium">
        <ArrowLeft className="w-4 h-4" /> Back to Setup
      </button>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'Outfit, sans-serif' }}>
          {selectedCompany} — {role} Interview
        </h1>
        <p className="text-sm text-slate-500 mt-1">{count} questions · {difficulty} difficulty</p>
      </div>
      <InterviewSession data={result} onReset={() => setResult(null)} />
    </div>
  );

  return (
    <div className="min-h-full p-6 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8 animate-fade-in">
        <button onClick={() => navigate('/')} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-indigo-400 mb-0.5">AI Interview</p>
          <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Company-Specific Interview
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Practice with questions tailored to your target company's interview style.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — Config */}
        <div className="lg:col-span-1 space-y-5">
          {/* Role */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 animate-slide-up">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">Target Role</p>
            <select
              value={role} onChange={e => setRole(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 bg-white focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            >
              <option value="">Select a role…</option>
              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          {/* Difficulty */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 animate-slide-up" style={{ animationDelay: '80ms' }}>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">Difficulty</p>
            <div className="flex gap-2">
              {DIFFICULTIES.map(d => (
                <button
                  key={d.val}
                  onClick={() => setDifficulty(d.val)}
                  className={`flex-1 py-2 rounded-lg border text-xs font-semibold transition-all ${difficulty === d.val ? d.color : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Question count */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 animate-slide-up" style={{ animationDelay: '160ms' }}>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">
              Questions: <span className="text-indigo-600 text-sm">{count}</span>
            </p>
            <input type="range" min={3} max={10} value={count} onChange={e => setCount(+e.target.value)}
              className="w-full accent-indigo-600" />
            <div className="flex justify-between text-xs text-slate-400 mt-1"><span>3</span><span>10</span></div>
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" /> {error}
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={loading || !selectedCompany || !role}
            className="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating…</> : <><Play className="w-4 h-4 fill-current" /> Start Interview</>}
          </button>
        </div>

        {/* Right — Company Grid */}
        <div className="lg:col-span-2 animate-slide-up" style={{ animationDelay: '200ms' }}>
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="w-4 h-4 text-indigo-500" />
              <p className="text-sm font-semibold text-slate-800">Select Company</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {COMPANIES.map(c => (
                <button
                  key={c.name}
                  onClick={() => setSelectedCompany(c.name)}
                  className={`group relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 text-center ${
                    selectedCompany === c.name
                      ? 'border-indigo-500 bg-indigo-50 shadow-sm shadow-indigo-100'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-2xl">{c.logo}</span>
                  <span className="text-xs font-semibold text-slate-700">{c.name}</span>
                  {selectedCompany === c.name && (
                    <span className="absolute top-2 right-2 w-4 h-4 bg-indigo-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-3 h-3 text-white" />
                    </span>
                  )}
                </button>
              ))}
            </div>

            {selectedCompany && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className="mt-4 bg-amber-50 border border-amber-100 rounded-lg p-3 flex items-start gap-2">
                <Lightbulb className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-amber-800">
                  {COMPANIES.find(c => c.name === selectedCompany)?.style}
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
