// ============================================================
// JDInterview.tsx — Job Description → Custom Interview Pipeline
// Paste JD → AI extracts skills → custom interview generated
// ============================================================

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';
import {
  FileText, Loader2, Zap, ChevronRight, ArrowLeft,
  CheckCircle, Tag, AlertTriangle, BarChart2
} from 'lucide-react';

const SAMPLE_JD = `We are looking for a Senior Frontend Developer with 3+ years of experience in React.js, TypeScript, and modern CSS frameworks. You will build scalable UI components, work with REST APIs, and collaborate with cross-functional teams.

Requirements:
- Proficiency in React, TypeScript, Redux
- Experience with Node.js and REST APIs
- Strong knowledge of HTML5, CSS3, responsive design
- Familiarity with Git, CI/CD, and agile workflows
- Experience with testing (Jest, React Testing Library)`;

function InterviewSession({ data, onReset }: { data: any; onReset: () => void }) {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<string[]>(Array(data.questions.length).fill(''));
  const [done, setDone] = useState(false);
  const navigate = useNavigate();

  const total = data.questions.length;

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Extracted skills chips */}
      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Tag className="w-4 h-4 text-indigo-500" />
          <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Extracted Skills</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {data.extractedSkills?.map((skill: string) => (
            <span key={skill} className="px-2.5 py-1 bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold rounded-full">
              {skill}
            </span>
          ))}
        </div>
      </div>

      {done ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-emerald-200 rounded-xl p-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-7 h-7 text-emerald-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Session Complete!</h2>
          <p className="text-sm text-slate-500 mb-6">You answered all {total} questions tailored to this JD.</p>
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
              Analyze Another JD
            </button>
            <button onClick={() => navigate('/')} className="btn-primary text-sm px-5 py-2">Go to Dashboard</button>
          </div>
        </motion.div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl p-6">
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
              <p className="text-base font-semibold text-slate-900 mb-4 leading-relaxed">{data.questions[current]}</p>
              <textarea
                className="w-full h-36 bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm text-slate-800 resize-none focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                placeholder="Type your answer here…"
                value={answers[current]}
                onChange={e => { const u = [...answers]; u[current] = e.target.value; setAnswers(u); }}
              />
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center justify-between mt-4">
            <button onClick={() => setCurrent(p => p - 1)} disabled={current === 0}
              className="text-sm font-medium text-slate-500 hover:text-slate-700 disabled:opacity-30 flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            {current < total - 1
              ? <button onClick={() => setCurrent(p => p + 1)} className="btn-primary text-sm px-5 py-2">Next <ChevronRight className="w-4 h-4" /></button>
              : <button onClick={() => setDone(true)} className="btn-primary text-sm px-5 py-2 !bg-emerald-600 hover:!bg-emerald-700">Finish <CheckCircle className="w-4 h-4" /></button>
            }
          </div>
        </div>
      )}
    </div>
  );
}

export default function JDInterview() {
  const [jd, setJd] = useState('');
  const [count, setCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<any>(null);
  const navigate = useNavigate();

  const handleGenerate = async () => {
    if (jd.trim().length < 50) { setError('Please paste a valid job description (min 50 characters)'); return; }
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/ai/jd-interview', { jobDescription: jd, count });
      setResult(res.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to parse JD. Try again.');
    } finally {
      setLoading(false);
    }
  };

  if (result) return (
    <div className="min-h-full p-6 md:p-8 max-w-7xl mx-auto">
      <button onClick={() => setResult(null)} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-6 font-medium">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className={`px-2 py-0.5 rounded-md text-xs font-semibold border ${
            result.difficulty === 'hard' ? 'text-red-700 bg-red-50 border-red-200' :
            result.difficulty === 'easy' ? 'text-emerald-700 bg-emerald-50 border-emerald-200' :
            'text-amber-700 bg-amber-50 border-amber-200'
          }`}>{result.difficulty?.toUpperCase()}</span>
          <span className="text-xs text-slate-400">{count} questions</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'Outfit, sans-serif' }}>
          {result.roleTitle || 'Custom'} Interview
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">Generated from your Job Description</p>
      </div>
      <InterviewSession data={result} onReset={() => setResult(null)} />
    </div>
  );

  return (
    <div className="min-h-full p-6 md:p-8 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-8 animate-fade-in">
        <button onClick={() => navigate('/')} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-indigo-400 mb-0.5">AI Pipeline</p>
          <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'Outfit, sans-serif' }}>JD → Interview</h1>
          <p className="text-sm text-slate-500 mt-0.5">Paste any job description. AI extracts skills and builds a custom interview.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* JD Input */}
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white border border-slate-200 rounded-xl p-5 animate-slide-up">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-500" />
                <p className="text-sm font-semibold text-slate-800">Paste Job Description</p>
              </div>
              <button onClick={() => setJd(SAMPLE_JD)}
                className="text-xs text-indigo-500 hover:text-indigo-700 font-medium border border-indigo-100 bg-indigo-50 px-2.5 py-1 rounded-lg">
                Use Sample
              </button>
            </div>
            <textarea
              value={jd}
              onChange={e => setJd(e.target.value)}
              placeholder="Paste the full job description here…&#10;&#10;Include requirements, responsibilities, and tech stack for best results."
              className="w-full h-72 bg-slate-50 border border-slate-200 rounded-lg p-4 text-sm text-slate-800 resize-none focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 font-mono"
            />
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-slate-400">{jd.trim().split(/\s+/).filter(Boolean).length} words</span>
              <span className={`text-xs font-medium ${jd.trim().length >= 50 ? 'text-emerald-600' : 'text-slate-400'}`}>
                {jd.trim().length >= 50 ? '✓ Ready to analyze' : `${50 - jd.trim().length} more chars needed`}
              </span>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" /> {error}
            </div>
          )}
        </div>

        {/* Config + Actions */}
        <div className="space-y-4 animate-slide-up" style={{ animationDelay: '100ms' }}>
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">
              Questions: <span className="text-indigo-600 text-sm">{count}</span>
            </p>
            <input type="range" min={3} max={10} value={count} onChange={e => setCount(+e.target.value)}
              className="w-full accent-indigo-600" />
            <div className="flex justify-between text-xs text-slate-400 mt-1"><span>3</span><span>10</span></div>
          </div>

          {/* What the AI will do */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-indigo-500" />
              <p className="text-xs font-semibold text-indigo-700">What AI Does</p>
            </div>
            <ul className="space-y-2 text-xs text-indigo-800">
              {['Extracts required skills & tech stack', 'Identifies seniority & difficulty level', 'Generates 60% technical + 40% behavioral mix', 'Tailors every question to the JD'].map((t, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-indigo-500 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                  {t}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <BarChart2 className="w-4 h-4 text-slate-400" />
              <p className="text-xs font-semibold text-slate-600">After the session</p>
            </div>
            <p className="text-xs text-slate-500">Review your answers, identify gaps, and re-practice weak areas through the regular Mock Interview mode.</p>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading || jd.trim().length < 50}
            className="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing JD…</>
              : <><Zap className="w-4 h-4" /> Generate Interview</>}
          </button>
        </div>
      </div>
    </div>
  );
}
