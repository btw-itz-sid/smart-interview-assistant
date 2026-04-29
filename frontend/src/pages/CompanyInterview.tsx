// ============================================================
// CompanyInterview.tsx — Company-Specific Mock Interview
// Professional UI — no emojis, proper company icons, clean design
// ============================================================

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';
import {
  Building2, ChevronRight, Loader2, Lightbulb,
  ArrowLeft, Play, CheckCircle, AlertCircle, Info, Sparkles
} from 'lucide-react';

// ── Company data — no emojis, using initials with brand-like colors ────
const COMPANIES = [
  { name: 'Google', initials: 'G', bg: 'bg-blue-600', style: 'Google focuses on problem-solving clarity and scalability thinking. Expect whiteboard-style coding and system design.' },
  { name: 'Amazon', initials: 'A', bg: 'bg-amber-600', style: 'Amazon is heavily LP (Leadership Principle) driven — every answer should map to a principle like Ownership or Bias for Action.' },
  { name: 'Microsoft', initials: 'M', bg: 'bg-sky-600', style: 'Microsoft values growth mindset, collaboration, and deep system design thinking.' },
  { name: 'Meta', initials: 'M', bg: 'bg-indigo-600', style: 'Meta focuses on impact at scale, data-driven decisions, and fast execution velocity.' },
  { name: 'Flipkart', initials: 'FK', bg: 'bg-yellow-500', style: 'Flipkart values ownership, product thinking, execution speed, and scalable architecture.' },
  { name: 'TCS', initials: 'T', bg: 'bg-slate-700', style: 'TCS interviews assess fundamentals, communication clarity, and adaptability across domains.' },
  { name: 'Infosys', initials: 'IN', bg: 'bg-teal-600', style: 'Infosys focuses on technical basics, situational problem-solving, and analytical thinking.' },
  { name: 'Wipro', initials: 'W', bg: 'bg-violet-600', style: 'Wipro emphasizes communication, teamwork, and core technical proficiency.' },
  { name: 'Startups', initials: 'S', bg: 'bg-rose-600', style: 'Startups value versatility, ownership mindset, rapid learning, and end-to-end execution.' },
];

const ROLES = [
  'Software Engineer', 'Frontend Developer', 'Backend Developer',
  'Full Stack Developer', 'Data Scientist', 'ML Engineer',
  'DevOps Engineer', 'Product Manager', 'System Design Engineer',
  'Mobile Developer',
];

const DIFFICULTIES = [
  { val: 'easy', label: 'Easy', desc: 'Warm-up round' },
  { val: 'medium', label: 'Medium', desc: 'Standard interview' },
  { val: 'hard', label: 'Hard', desc: 'Senior / challenging' },
];

// ── Session component ─────────────────────────────────────
function InterviewSession({ data, company, onReset }: { data: any; company: string; onReset: () => void }) {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<string[]>(Array(data.questions.length).fill(''));
  const [done, setDone] = useState(false);
  const navigate = useNavigate();
  const total = data.questions.length;

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Company insight */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-start gap-3">
        <Info className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-xs font-semibold text-slate-500 mb-0.5">Interview Style</p>
          <p className="text-sm text-slate-700 leading-relaxed">{data.companyInfo}</p>
        </div>
      </div>

      {/* Tips */}
      {data.tips?.length > 0 && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
          <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">Preparation Tips</p>
          <ul className="space-y-1.5">
            {data.tips.map((tip: string, i: number) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 flex-shrink-0" />
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}

      {done ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-slate-200 rounded-xl p-8 text-center">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-6 h-6 text-emerald-500" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>Session Complete</h2>
          <p className="text-sm text-slate-500 mb-6">You answered all {total} questions for {company}.</p>
          <div className="space-y-2.5 text-left mb-6 max-h-60 overflow-y-auto">
            {data.questions.map((q: string, i: number) => (
              <div key={i} className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                <p className="text-xs font-semibold text-slate-500 mb-1">Q{i + 1}. {q}</p>
                <p className="text-sm text-slate-700">{answers[i] || <span className="text-slate-400 italic">Skipped</span>}</p>
              </div>
            ))}
          </div>
          <div className="flex gap-3 justify-center">
            <button onClick={onReset} className="btn-ghost">Try Another Company</button>
            <button onClick={() => navigate('/')} className="btn-primary">Go to Dashboard</button>
          </div>
        </motion.div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-5">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Question {current + 1} of {total}
            </span>
            <div className="flex gap-1">
              {data.questions.map((_: any, i: number) => (
                <div key={i} className={`h-1.5 w-5 rounded-full transition-colors duration-300 ${i <= current ? 'bg-indigo-500' : 'bg-slate-100'}`} />
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={current} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }}>
              <p className="text-base font-semibold text-slate-900 mb-4 leading-relaxed">{data.questions[current]}</p>
              <textarea
                className="w-full h-36 bg-slate-50 border border-slate-200 rounded-lg p-3.5 text-sm text-slate-800 resize-none focus:outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-50 transition-all"
                placeholder="Type your answer here…"
                value={answers[current]}
                onChange={e => { const u = [...answers]; u[current] = e.target.value; setAnswers(u); }}
              />
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center justify-between mt-4">
            <button onClick={() => setCurrent(p => p - 1)} disabled={current === 0}
              className="text-sm font-medium text-slate-500 hover:text-slate-700 disabled:opacity-30 flex items-center gap-1 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Previous
            </button>
            {current < total - 1
              ? <button onClick={() => setCurrent(p => p + 1)} className="btn-primary text-sm px-5 py-2">Next <ChevronRight className="w-4 h-4" /></button>
              : <button onClick={() => setDone(true)} className="btn-primary text-sm px-5 py-2">Finish Session</button>
            }
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
    if (!selectedCompany || !role) { setError('Please select a company and role.'); return; }
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/ai/company-interview', { company: selectedCompany, role, difficulty, count });
      setResult(res.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to generate interview. Please try again.');
    } finally { setLoading(false); }
  };

  if (result) return (
    <div className="min-h-full p-6 md:p-8 max-w-7xl mx-auto">
      <button onClick={() => setResult(null)} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-6 font-medium transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Setup
      </button>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'Outfit, sans-serif' }}>
          {selectedCompany} — {role}
        </h1>
        <p className="text-sm text-slate-500 mt-1">{count} questions · {difficulty} difficulty</p>
      </div>
      <InterviewSession data={result} company={selectedCompany} onReset={() => setResult(null)} />
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
          <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Company-Specific Interview
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Practice with questions tailored to your target company's interview style.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — Configuration */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 animate-slide-up">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">Target Role</p>
            <select value={role} onChange={e => setRole(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 bg-white focus:outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-50">
              <option value="">Select a role…</option>
              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 animate-slide-up" style={{ animationDelay: '60ms' }}>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">Difficulty</p>
            <div className="space-y-2">
              {DIFFICULTIES.map(d => (
                <button key={d.val} onClick={() => setDifficulty(d.val)}
                  className={`w-full text-left flex items-center justify-between px-3.5 py-3 rounded-lg border transition-all ${
                    difficulty === d.val
                      ? 'border-indigo-300 bg-indigo-50/50 ring-2 ring-indigo-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}>
                  <div>
                    <p className={`text-sm font-semibold ${difficulty === d.val ? 'text-indigo-700' : 'text-slate-700'}`}>{d.label}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{d.desc}</p>
                  </div>
                  {difficulty === d.val && <div className="w-2 h-2 rounded-full bg-indigo-500" />}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 animate-slide-up" style={{ animationDelay: '120ms' }}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Questions</p>
              <span className="text-sm font-bold text-indigo-600">{count}</span>
            </div>
            <input type="range" min={3} max={10} value={count} onChange={e => setCount(+e.target.value)}
              className="w-full accent-indigo-600" />
            <div className="flex justify-between text-xs text-slate-400 mt-1"><span>3</span><span>10</span></div>
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
              <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
            </div>
          )}

          <button onClick={handleGenerate} disabled={loading || !selectedCompany || !role}
            className="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating…</> : <><Sparkles className="w-4 h-4" /> Start Interview</>}
          </button>
        </div>

        {/* Right — Company Grid */}
        <div className="lg:col-span-2 animate-slide-up" style={{ animationDelay: '150ms' }}>
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="w-4 h-4 text-indigo-500" />
              <p className="text-sm font-semibold text-slate-800">Select Company</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {COMPANIES.map(c => (
                <button key={c.name} onClick={() => setSelectedCompany(c.name)}
                  className={`group relative flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                    selectedCompany === c.name
                      ? 'border-indigo-500 bg-indigo-50/30 ring-2 ring-indigo-50'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                  }`}>
                  <div className={`w-9 h-9 rounded-lg ${c.bg} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                    {c.initials}
                  </div>
                  <span className="text-sm font-semibold text-slate-700">{c.name}</span>
                  {selectedCompany === c.name && (
                    <div className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-indigo-500" />
                  )}
                </button>
              ))}
            </div>

            {selectedCompany && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
                className="mt-4 bg-slate-50 border border-slate-200 rounded-lg p-3 flex items-start gap-2.5">
                <Lightbulb className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-slate-600 leading-relaxed">
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
