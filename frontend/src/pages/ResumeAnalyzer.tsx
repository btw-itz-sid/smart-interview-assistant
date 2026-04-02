import React, { useState } from 'react';
import { api } from '../services/api';
import {
  FileText,
  CheckCircle2,
  ChevronRight,
  Briefcase,
  FileSearch,
  Sparkles,
  Loader2,
  Upload,
  Copy,
  Check,
  XCircle,
} from 'lucide-react';

function ScoreRing({ score }: { score: number }) {
  const pct   = (score / 10) * 100;
  const color = score >= 7 ? '#10b981' : score >= 4 ? '#f59e0b' : '#ef4444';
  const label = score >= 7 ? 'Good' : score >= 4 ? 'Fair' : 'Weak';

  return (
    <div className="flex flex-col items-center justify-center">
      <div
        className="relative w-24 h-24 rounded-full flex items-center justify-center"
        style={{
          background: `conic-gradient(${color} ${pct}%, #f1f5f9 0%)`,
        }}
      >
        <div className="w-[76px] h-[76px] rounded-full bg-white flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'Outfit, sans-serif' }}>
            {score}
          </span>
          <span className="text-[10px] text-slate-400 font-medium">/ 10</span>
        </div>
      </div>
      <span
        className="mt-2 text-xs font-semibold px-2.5 py-0.5 rounded-full border"
        style={{
          color,
          background: `${color}15`,
          borderColor: `${color}30`,
        }}
      >
        {label}
      </span>
    </div>
  );
}

export default function ResumeAnalyzer() {
  const [resumeText, setResumeText]   = useState('');
  const [jobRole, setJobRole]         = useState('');
  const [loading, setLoading]         = useState(false);
  const [result, setResult]           = useState<any>(null);
  const [error, setError]             = useState('');
  const [generatedResume, setGenResume] = useState('');
  const [generating, setGenerating]   = useState(false);
  const [copied, setCopied]           = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setError('');
    const fd = new FormData();
    fd.append('resume', file);
    try {
      const res = await api.post('/resume/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success) setResumeText(res.data.data.text);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to parse resume file.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (resumeText.trim().length < 50) {
      setError('Resume text must be at least 50 characters.');
      return;
    }
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await api.post('/resume/analyze', {
        resumeText,
        jobRole: jobRole || undefined,
      });
      setResult(res.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    setError('');
    setGenResume('');
    try {
      const res = await api.post('/resume/generate');
      setGenResume(res.data.data.resume);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not generate resume.');
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedResume);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-full p-6 md:p-8 max-w-7xl mx-auto">

      {/* ── Page Header ── */}
      <div className="mb-7 animate-fade-in">
        <div className="flex items-center gap-2 mb-1">
          <FileSearch className="w-4 h-4 text-indigo-500" />
          <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Resume Analyzer
          </h1>
        </div>
        <p className="text-slate-500 text-sm">
          Upload or paste your resume to get an ATS score, keyword gaps, and improvement tips.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ── LEFT: Input Form ── */}
        <div className="space-y-5 animate-slide-up">
          {error && (
            <div className="flex items-start gap-2.5 bg-red-50 border border-red-100 text-red-700 rounded-lg px-4 py-3 text-sm">
              <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleAnalyze} className="space-y-4">
            {/* Target Role */}
            <div className="card">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                Target Role <span className="normal-case font-normal text-slate-400 tracking-normal">(optional but recommended)</span>
              </label>
              <div className="relative">
                <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="e.g. Senior Frontend Engineer"
                  value={jobRole}
                  onChange={(e) => setJobRole(e.target.value)}
                  className="input-field pl-10"
                />
              </div>
            </div>

            {/* Resume Input */}
            <div className="card space-y-3">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                Resume Content
              </label>

              {/* File upload */}
              <label className="flex items-center gap-3 px-4 py-3 rounded-lg border border-dashed border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40 transition-colors cursor-pointer group">
                <Upload className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                <div>
                  <p className="text-sm font-medium text-slate-700 group-hover:text-indigo-600 transition-colors">
                    Upload PDF
                  </p>
                  <p className="text-xs text-slate-400">Click to select a .pdf file</p>
                </div>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-slate-100" />
                <span className="text-xs text-slate-400 font-medium">or paste text</span>
                <div className="flex-1 h-px bg-slate-100" />
              </div>

              <textarea
                required
                placeholder="Paste your work experience, skills, education, and projects here…"
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                rows={10}
                className="input-field resize-none text-sm leading-relaxed"
              />

              <button
                type="submit"
                disabled={loading || resumeText.trim().length < 50}
                className="btn-primary w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing…</>
                ) : (
                  <><Sparkles className="w-4 h-4" /> Analyze Resume</>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* ── RIGHT: Results ── */}
        <div className="space-y-5 animate-slide-up" style={{ animationDelay: '80ms' }}>
          {!result ? (
            <div className="card flex flex-col items-center justify-center text-center py-16 border-dashed min-h-[400px]">
              <div className="w-14 h-14 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-slate-300" />
              </div>
              <h3 className="text-sm font-semibold text-slate-600 mb-1">Awaiting your resume</h3>
              <p className="text-xs text-slate-400 max-w-xs">
                Upload or paste your resume on the left and hit Analyze to see detailed AI insights.
              </p>
            </div>
          ) : (
            <>
              {/* Score + Summary */}
              <div className="card">
                <div className="flex items-start justify-between mb-5 pb-5 border-b border-slate-100">
                  <div className="flex-1 pr-6">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">ATS Compatibility Score</p>
                    <p className="text-sm text-slate-500 leading-relaxed">{result.analysis}</p>
                  </div>
                  <ScoreRing score={result.overallScore} />
                </div>

                {/* Suggestions */}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Recommendations</p>
                  <div className="space-y-2">
                    {result.suggestions.map((s: string, i: number) => (
                      <div key={i} className="flex items-start gap-2.5 py-2 px-3 rounded-lg hover:bg-slate-50 transition-colors group">
                        <ChevronRight className="w-3.5 h-3.5 text-indigo-400 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-slate-700 leading-relaxed">
                          {s.replace(/^[-*]\s*/, '')}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Keywords */}
              <div className="card">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">Keyword Analysis</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Present */}
                  <div>
                    <p className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 mb-2.5">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Present
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {result.keywords.present.map((kw: string) => (
                        <span key={kw} className="badge badge-green">{kw}</span>
                      ))}
                    </div>
                  </div>
                  {/* Missing */}
                  <div>
                    <p className="flex items-center gap-1.5 text-xs font-semibold text-red-600 mb-2.5">
                      <XCircle className="w-3.5 h-3.5" /> Missing
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {result.keywords.missing.map((kw: string) => (
                        <span key={kw} className="badge badge-red">{kw}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Resume Generation (only when score < 7) */}
              {result.overallScore < 7 && (
                <div className="card border-indigo-100 bg-indigo-50/40">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-9 h-9 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-800">Auto-generate a better resume?</h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        We'll build an ATS-optimised markdown resume based on your interview performance data.
                      </p>
                    </div>
                  </div>

                  {!generatedResume ? (
                    <button
                      onClick={handleGenerate}
                      disabled={generating}
                      className="btn-primary w-full py-2.5 disabled:opacity-60"
                    >
                      {generating ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Generating…</>
                      ) : (
                        <><FileText className="w-4 h-4" /> Generate Resume</>
                      )}
                    </button>
                  ) : (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Generated Resume</p>
                        <button
                          onClick={handleCopy}
                          className="btn-ghost px-3 py-1.5 text-xs"
                        >
                          {copied ? (
                            <><Check className="w-3.5 h-3.5 text-emerald-500" /> Copied</>
                          ) : (
                            <><Copy className="w-3.5 h-3.5" /> Copy</>
                          )}
                        </button>
                      </div>
                      <pre className="bg-slate-900 text-slate-300 rounded-lg p-4 text-xs leading-relaxed overflow-x-auto whitespace-pre-wrap font-mono border border-slate-800">
                        {generatedResume}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
