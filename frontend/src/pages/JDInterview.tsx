// ============================================================
// JDInterview.tsx — Job Description → Custom Interview Pipeline
// Paste JD → AI extracts skills → custom interview generated
// ============================================================

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import ChatBox from '../components/ChatBox';
import {
  FileText, Loader2, Zap, ArrowLeft,
  AlertTriangle, BarChart2
} from 'lucide-react';

const SAMPLE_JD = `We are looking for a Senior Frontend Developer with 3+ years of experience in React.js, TypeScript, and modern CSS frameworks. You will build scalable UI components, work with REST APIs, and collaborate with cross-functional teams.

Requirements:
- Proficiency in React, TypeScript, Redux
- Experience with Node.js and REST APIs
- Strong knowledge of HTML5, CSS3, responsive design
- Familiarity with Git, CI/CD, and agile workflows
- Experience with testing (Jest, React Testing Library)`;

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

  if (result?.interviewId) {
    return (
      <ChatBox
        interviewId={result.interviewId}
        topic={result.roleTitle || result.topic || 'JD Interview'}
        questions={result.questions}
        onEnd={() => setResult(null)}
      />
    );
  }

  return (
    <div className="min-h-full p-6 md:p-8 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-8 animate-fade-in">
        <button onClick={() => navigate('/')} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-0.5">Interview from JD</p>
          <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'Outfit, sans-serif' }}>Job Description Interview</h1>
          <p className="text-sm text-slate-500 mt-0.5">Paste any job description. Skills are extracted and a custom interview is built around them.</p>
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
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-slate-400" />
              <p className="text-xs font-semibold text-slate-600">How it works</p>
            </div>
            <ul className="space-y-2 text-xs text-slate-600">
              {['Extracts required skills and tech stack', 'Identifies seniority and difficulty level', 'Generates 60% technical + 40% behavioral mix', 'Tailors every question to this specific role'].map((t, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-600 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
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
