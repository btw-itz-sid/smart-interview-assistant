// ============================================================
// ResumeAnalyzer.tsx — Upgraded with 5-Dimension ATS Score
// Advanced ATS breakdown: keyword, sections, format, quant, length
// ============================================================

import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';
import {
  Upload, FileText, ArrowRight, AlertTriangle, CheckCircle,
  XCircle, Loader2, ArrowLeft, Lightbulb, Tag, Target,
  BarChart2, AlignLeft, Percent, Hash, Layers
} from 'lucide-react';

// ── Score ring gauge ───────────────────────────────────────
function ScoreRing({ score, max = 100, size = 120 }: { score: number; max?: number; size?: number }) {
  const pct = Math.round((score / max) * 100);
  const r = 45;
  const circ = 2 * Math.PI * r;
  const dashOffset = circ * (1 - pct / 100);
  const color = pct >= 70 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#ef4444';
  const grade = pct >= 90 ? 'A+' : pct >= 80 ? 'A' : pct >= 70 ? 'B+' : pct >= 60 ? 'B' : pct >= 50 ? 'C' : pct >= 35 ? 'D' : 'F';

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size} viewBox="0 0 100 100" className="-rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" stroke="#f1f5f9" strokeWidth="10" />
        <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="10"
          strokeDasharray={circ} strokeDashoffset={dashOffset}
          strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1.2s ease-out' }} />
      </svg>
      <div className="text-center -mt-[90px]">
        <p className="text-3xl font-extrabold text-slate-900" style={{ fontFamily: 'Outfit,sans-serif' }}>{score}</p>
        <p className="text-xs text-slate-400 font-medium">/ {max}</p>
      </div>
      <div className="mt-16 text-center">
        <span className="text-lg font-bold" style={{ color }}>{grade}</span>
        <p className="text-xs text-slate-400 mt-0.5">ATS Grade</p>
      </div>
    </div>
  );
}

// ── Breakdown dimension bar ────────────────────────────────
function DimBar({ label, score, max, icon: Icon, items }: { label: string; score: number; max: number; icon: any; items?: { good: string[]; bad: string[] } }) {
  const pct = Math.round((score / max) * 100);
  const color = pct >= 70 ? '#10b981' : pct >= 40 ? '#f59e0b' : '#ef4444';
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
      <button onClick={() => setOpen(o => !o)} className="w-full text-left">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center">
              <Icon className="w-3.5 h-3.5 text-slate-500" />
            </div>
            <span className="text-sm font-semibold text-slate-700">{label}</span>
          </div>
          <span className="text-sm font-bold" style={{ color }}>{score}/{max}</span>
        </div>
        <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
          <motion.div className="h-full rounded-full" style={{ background: color }}
            initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, ease: 'easeOut' }} />
        </div>
      </button>
      <AnimatePresence>
        {open && items && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mt-3 space-y-2">
            {items.good.map((t, i) => (
              <div key={i} className="flex items-start gap-1.5 text-xs text-emerald-700">
                <CheckCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-emerald-500" /> {t}
              </div>
            ))}
            {items.bad.map((t, i) => (
              <div key={i} className="flex items-start gap-1.5 text-xs text-red-700">
                <XCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-red-400" /> {t}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Keyword pill ───────────────────────────────────────────
const KwPill = ({ text, present }: { text: string; present: boolean }) => (
  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${
    present ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'
  }`}>
    {present ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
    {text}
  </span>
);

export default function ResumeAnalyzer() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<'paste' | 'upload'>('paste');
  const [resumeText, setResumeText] = useState('');
  const [jd, setJd] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<any>(null);

  // PDF upload handler
  const onDrop = useCallback(async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file || !file.type.includes('pdf')) { setError('Only PDF files supported'); return; }
    const form = new FormData(); form.append('resume', file);
    try {
      const res = await api.post('/resume/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      setResumeText(res.data.data.text);
      setTab('paste');
    } catch { setError('PDF upload failed. Paste text instead.'); }
  }, []);

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const form = new FormData(); form.append('resume', file);
    try {
      setLoading(true);
      const res = await api.post('/resume/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      setResumeText(res.data.data.text);
      setTab('paste');
    } catch { setError('PDF upload failed. Paste text instead.'); }
    finally { setLoading(false); }
  };

  const handleAnalyze = async () => {
    if (!resumeText.trim() || resumeText.trim().length < 30) { setError('Please provide resume text (min 30 chars)'); return; }
    setError(''); setLoading(true);
    try {
      const res = await api.post('/resume/ats-score', { resumeText, jobDescription: jd || undefined, targetRole: targetRole || undefined });
      setResult(res.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Analysis failed. Try again.');
    } finally { setLoading(false); }
  };

  // ── Result view ──────────────────────────────────────────
  if (result) {
    const b = result.breakdown;
    return (
      <div className="min-h-full p-6 md:p-8 max-w-7xl mx-auto">
        <button onClick={() => setResult(null)} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-6 font-medium">
          <ArrowLeft className="w-4 h-4" /> Analyze Another
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Score column */}
          <div className="space-y-5">
            <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col items-center animate-fade-in">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-4">ATS Score</p>
              <ScoreRing score={result.totalScore} max={100} size={140} />
              <div className={`mt-4 px-3 py-1.5 rounded-lg text-xs font-semibold border ${result.isATSFriendly ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                {result.isATSFriendly ? '✓ ATS Friendly' : '✗ Needs Improvement'}
              </div>
            </div>

            {/* AI Suggestions */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 animate-slide-up">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">AI Suggestions</p>
              </div>
              <ul className="space-y-2">
                {result.aiSuggestions?.map((s: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i+1}</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>

            {/* Start interview from resume */}
            <button onClick={() => navigate('/interview')} className="w-full btn-primary py-3">
              <ArrowRight className="w-4 h-4" /> Practice Interview Now
            </button>
          </div>

          {/* Breakdown column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white border border-slate-200 rounded-xl p-5 animate-slide-up">
              <div className="flex items-center gap-2 mb-4">
                <BarChart2 className="w-4 h-4 text-indigo-500" />
                <h2 className="text-sm font-semibold text-slate-800">Score Breakdown</h2>
              </div>
              <div className="space-y-3">
                <DimBar label="Keyword Match" score={b.keywordMatch.score} max={40} icon={Tag}
                  items={{ good: b.keywordMatch.matchedKeywords.slice(0,3).map((k:string) => `"${k}" present`), bad: b.keywordMatch.missingKeywords.slice(0,3).map((k:string) => `"${k}" missing`) }} />
                <DimBar label="Section Completeness" score={b.sectionCompleteness.score} max={20} icon={Layers}
                  items={{ good: b.sectionCompleteness.presentSections.map((s:string) => `${s} ✓`), bad: b.sectionCompleteness.missingSections.map((s:string) => `${s} missing`) }} />
                <DimBar label="Formatting Quality" score={b.formattingQuality.score} max={20} icon={AlignLeft}
                  items={{ good: b.formattingQuality.issues.length === 0 ? ['Good formatting detected'] : [], bad: b.formattingQuality.issues }} />
                <DimBar label="Quantification" score={b.quantification.score} max={10} icon={Hash}
                  items={{ good: b.quantification.examples.map((e:string) => `Example: "${e.trim()}"`), bad: b.quantification.score < 6 ? ['Add more numbers/percentages to bullet points'] : [] }} />
                <DimBar label="Length Optimization" score={b.lengthOptimization.score} max={10} icon={Percent}
                  items={{ good: b.lengthOptimization.score >= 8 ? [b.lengthOptimization.feedback] : [], bad: b.lengthOptimization.score < 8 ? [b.lengthOptimization.feedback] : [] }} />
              </div>
            </div>

            {/* Keywords */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 animate-slide-up" style={{ animationDelay: '120ms' }}>
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-4 h-4 text-indigo-500" />
                <h2 className="text-sm font-semibold text-slate-800">Keyword Analysis</h2>
              </div>
              <div className="mb-3">
                <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">Present ({b.keywordMatch.matchedKeywords.length})</p>
                <div className="flex flex-wrap gap-2">
                  {b.keywordMatch.matchedKeywords.map((k: string) => <KwPill key={k} text={k} present />)}
                  {b.keywordMatch.matchedKeywords.length === 0 && <span className="text-xs text-slate-400">None detected</span>}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">Missing ({b.keywordMatch.missingKeywords.length})</p>
                <div className="flex flex-wrap gap-2">
                  {b.keywordMatch.missingKeywords.map((k: string) => <KwPill key={k} text={k} present={false} />)}
                  {b.keywordMatch.missingKeywords.length === 0 && <span className="text-xs text-emerald-600 font-medium">Great keyword coverage!</span>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Input view ───────────────────────────────────────────
  return (
    <div className="min-h-full p-6 md:p-8 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-8 animate-fade-in">
        <button onClick={() => navigate('/')} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-indigo-400 mb-0.5">Resume Analysis</p>
          <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'Outfit, sans-serif' }}>Advanced ATS Analyzer</h1>
          <p className="text-sm text-slate-500 mt-0.5">5-dimension scoring: keywords, sections, formatting, quantification & length.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          {/* Tabs */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 animate-slide-up">
            <div className="flex gap-2 mb-4">
              {[{ key: 'paste', label: 'Paste Text', icon: FileText }, { key: 'upload', label: 'Upload PDF', icon: Upload }].map(t => (
                <button key={t.key} onClick={() => setTab(t.key as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all border ${tab === t.key ? 'bg-indigo-600 text-white border-indigo-600' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                  <t.icon className="w-3.5 h-3.5" /> {t.label}
                </button>
              ))}
            </div>

            {tab === 'paste' ? (
              <>
                <textarea value={resumeText} onChange={e => setResumeText(e.target.value)}
                  placeholder="Paste your resume text here…&#10;&#10;Include all sections: Contact, Summary, Experience, Education, Skills"
                  className="w-full h-64 bg-slate-50 border border-slate-200 rounded-lg p-4 text-sm text-slate-800 resize-none focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
                <div className="flex justify-between mt-2 text-xs text-slate-400">
                  <span>{resumeText.trim().split(/\s+/).filter(Boolean).length} words</span>
                  <span className={resumeText.length >= 30 ? 'text-emerald-600 font-medium' : ''}>
                    {resumeText.length >= 30 ? '✓ Ready' : `${30 - resumeText.length} more chars needed`}
                  </span>
                </div>
              </>
            ) : (
              <div onDrop={onDrop} onDragOver={e => e.preventDefault()}
                className="border-2 border-dashed border-slate-300 rounded-xl p-10 text-center hover:border-indigo-400 transition-colors cursor-pointer"
                onClick={() => document.getElementById('pdf-input')?.click()}>
                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-3" />
                <p className="text-sm font-semibold text-slate-700">Drop PDF here or click to upload</p>
                <p className="text-xs text-slate-400 mt-1">Max 5MB · PDF only</p>
                <input id="pdf-input" type="file" accept=".pdf" className="hidden" onChange={handleFileInput} />
              </div>
            )}
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" /> {error}
            </div>
          )}
        </div>

        {/* Config sidebar */}
        <div className="space-y-4 animate-slide-up" style={{ animationDelay: '100ms' }}>
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">Target Role (Optional)</p>
            <input value={targetRole} onChange={e => setTargetRole(e.target.value)}
              placeholder="e.g. Frontend Developer"
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">Paste Job Description</p>
            <p className="text-xs text-slate-400 mb-3">For higher keyword match accuracy</p>
            <textarea value={jd} onChange={e => setJd(e.target.value)}
              placeholder="Paste JD for keyword match…"
              className="w-full h-28 bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-800 resize-none focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
          </div>

          {/* Scoring legend */}
          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
            <p className="text-xs font-semibold text-indigo-700 mb-2">Score Breakdown (100 pts)</p>
            {[['Keyword Match', '40'], ['Section Completeness', '20'], ['Formatting Quality', '20'], ['Quantification', '10'], ['Length', '10']].map(([l, v]) => (
              <div key={l} className="flex justify-between text-xs text-indigo-800 py-0.5">
                <span>{l}</span><span className="font-bold">{v}</span>
              </div>
            ))}
          </div>

          <button onClick={handleAnalyze} disabled={loading || resumeText.trim().length < 30}
            className="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing…</> : <><BarChart2 className="w-4 h-4" /> Get ATS Score</>}
          </button>
        </div>
      </div>
    </div>
  );
}
