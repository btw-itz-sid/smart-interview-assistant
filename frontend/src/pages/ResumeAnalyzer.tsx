import { useCallback, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';
import {
  AlignLeft,
  ArrowRight,
  Award,
  BarChart2,
  Briefcase,
  CheckCircle,
  Download,
  Hash,
  Layers,
  Loader2,
  PenLine,
  Percent,
  Sparkles,
  Tag,
  Target,
  Upload,
  Wand2,
  XCircle,
} from 'lucide-react';

type BuilderMode = 'build' | 'check';

type Template = {
  name: string;
  tone: string;
  accent: string;
  description: string;
};

const templates: Template[] = [
  {
    name: 'Cascade',
    tone: 'Modern',
    accent: '#3157d5',
    description: 'Structured sidebar layout for full-stack and product roles.',
  },
  {
    name: 'Crisp',
    tone: 'Minimal',
    accent: '#0f766e',
    description: 'Clean one-column resume for ATS-heavy applications.',
  },
  {
    name: 'Cubic',
    tone: 'Bold',
    accent: '#7c3aed',
    description: 'Confident section blocks for experienced engineers.',
  },
];

const sampleBullets = [
  'Built AI-powered interview preparation workflows using React, Node.js, and PostgreSQL.',
  'Improved candidate readiness scoring with topic analytics, streaks, and ATS resume checks.',
  'Designed production-ready API validation, Swagger docs, and deployment configuration.',
];

function ScoreRing({ score, max = 100, size = 136 }: { score: number; max?: number; size?: number }) {
  const pct = Math.round((score / max) * 100);
  const r = 45;
  const circ = 2 * Math.PI * r;
  const dashOffset = circ * (1 - pct / 100);
  const color = pct >= 70 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#ef4444';
  const grade = pct >= 90 ? 'A+' : pct >= 80 ? 'A' : pct >= 70 ? 'B+' : pct >= 60 ? 'B' : pct >= 50 ? 'C' : pct >= 35 ? 'D' : 'F';

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox="0 0 100 100" className="-rotate-90">
          <circle cx="50" cy="50" r={r} fill="none" stroke="#eef2f7" strokeWidth="10" />
          <circle
            cx="50"
            cy="50"
            r={r}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeDasharray={circ}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s ease-out' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-4xl font-extrabold text-slate-950" style={{ fontFamily: 'Outfit,sans-serif' }}>{score}</p>
          <p className="text-xs text-slate-400 font-medium">/ {max}</p>
        </div>
      </div>
      <span className="mt-2 text-lg font-bold" style={{ color }}>{grade}</span>
    </div>
  );
}

function DimensionBar({
  label,
  score,
  max,
  icon: Icon,
  items,
}: {
  label: string;
  score: number;
  max: number;
  icon: any;
  items?: { good: string[]; bad: string[] };
}) {
  const pct = Math.round((score / max) * 100);
  const color = pct >= 70 ? '#10b981' : pct >= 40 ? '#f59e0b' : '#ef4444';
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <button onClick={() => setOpen((value) => !value)} className="w-full text-left">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center flex-shrink-0">
              <Icon className="w-4 h-4 text-slate-500" />
            </span>
            <span className="text-sm font-semibold text-slate-800 truncate">{label}</span>
          </div>
          <span className="text-sm font-bold flex-shrink-0" style={{ color }}>{score}/{max}</span>
        </div>
        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: color }}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.75, ease: 'easeOut' }}
          />
        </div>
      </button>

      <AnimatePresence>
        {open && items && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mt-3 space-y-2"
          >
            {items.good.map((text, index) => (
              <div key={`good-${index}`} className="flex items-start gap-2 text-xs text-emerald-700">
                <CheckCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-emerald-500" />
                {text}
              </div>
            ))}
            {items.bad.map((text, index) => (
              <div key={`bad-${index}`} className="flex items-start gap-2 text-xs text-red-700">
                <XCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-red-400" />
                {text}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function KeywordPill({ text, present }: { text: string; present: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${
      present ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'
    }`}>
      {present ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
      {text}
    </span>
  );
}

function ResumePreview({ template }: { template: Template }) {
  return (
    <div className="relative mx-auto w-full max-w-[390px]">
      <div className="absolute -left-5 top-10 rounded-2xl bg-white border border-slate-200 shadow-lg p-3 hidden sm:block">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-emerald-500" />
          <div>
            <p className="text-xs font-bold text-slate-900">ATS Ready</p>
            <p className="text-[10px] text-slate-400">Optimized format</p>
          </div>
        </div>
      </div>

      <div className="absolute -right-5 bottom-12 rounded-2xl bg-white border border-slate-200 shadow-lg p-3 hidden sm:block">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-500" />
          <div>
            <p className="text-xs font-bold text-slate-900">AI Bullets</p>
            <p className="text-[10px] text-slate-400">Role matched</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[18px] shadow-2xl border border-slate-200 overflow-hidden aspect-[0.72]">
        <div className="h-full grid grid-cols-[34%_1fr]">
          <aside className="p-5 text-white" style={{ background: template.accent }}>
            <div className="w-14 h-14 rounded-2xl bg-white/20 mb-5" />
            <div className="h-3 w-24 bg-white/80 rounded mb-2" />
            <div className="h-2 w-20 bg-white/40 rounded mb-7" />
            {['CONTACT', 'SKILLS', 'TOOLS'].map((section) => (
              <div key={section} className="mb-5">
                <p className="text-[8px] font-bold tracking-[0.2em] mb-2 opacity-80">{section}</p>
                <div className="space-y-1.5">
                  <div className="h-1.5 w-full bg-white/50 rounded" />
                  <div className="h-1.5 w-5/6 bg-white/40 rounded" />
                  <div className="h-1.5 w-3/4 bg-white/40 rounded" />
                </div>
              </div>
            ))}
          </aside>
          <main className="p-6">
            <div className="mb-5">
              <div className="h-4 w-36 bg-slate-900 rounded mb-2" />
              <div className="h-2 w-28 rounded" style={{ background: template.accent }} />
            </div>
            {['SUMMARY', 'EXPERIENCE', 'PROJECTS', 'EDUCATION'].map((section, index) => (
              <div key={section} className="mb-5">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-2 w-2 rounded-full" style={{ background: template.accent }} />
                  <p className="text-[8px] font-bold tracking-[0.18em] text-slate-500">{section}</p>
                </div>
                <div className="space-y-1.5">
                  <div className="h-1.5 w-full bg-slate-200 rounded" />
                  <div className="h-1.5 w-11/12 bg-slate-200 rounded" />
                  <div className="h-1.5 w-4/5 bg-slate-200 rounded" />
                  {index === 1 && <div className="h-1.5 w-3/5 bg-slate-200 rounded" />}
                </div>
              </div>
            ))}
          </main>
        </div>
      </div>
    </div>
  );
}

export default function ResumeAnalyzer() {
  const [mode, setMode] = useState<BuilderMode>('build');
  const [selectedTemplate, setSelectedTemplate] = useState(templates[0]);
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<any>(null);
  const [generatedResume, setGeneratedResume] = useState('');

  const wordCount = useMemo(
    () => resumeText.trim().split(/\s+/).filter(Boolean).length,
    [resumeText]
  );

  const onDrop = useCallback(async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (!file || !file.type.includes('pdf')) {
      setError('Only PDF files are supported.');
      return;
    }

    const form = new FormData();
    form.append('resume', file);

    try {
      setLoading(true);
      const res = await api.post('/resume/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      setResumeText(res.data.data.text);
      setMode('check');
      setError('');
    } catch {
      setError('PDF upload failed. Paste your resume text instead.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleFileInput = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const form = new FormData();
    form.append('resume', file);

    try {
      setLoading(true);
      const res = await api.post('/resume/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      setResumeText(res.data.data.text);
      setMode('check');
      setError('');
    } catch {
      setError('PDF upload failed. Paste your resume text instead.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateResume = async () => {
    setGenerating(true);
    setError('');

    try {
      const res = await api.post('/resume/generate');
      const resume = res.data.data.resume;
      setGeneratedResume(resume);
      setResumeText(resume);
      setMode('build');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Resume generation failed. Complete one interview first, then try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleAnalyze = async () => {
    if (!resumeText.trim() || resumeText.trim().length < 30) {
      setError('Please add resume text first. Minimum 30 characters required.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await api.post('/resume/ats-score', {
        resumeText,
        jobDescription: jobDescription || undefined,
        targetRole: targetRole || undefined,
      });
      setResult(res.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Analysis failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    const breakdown = result.breakdown;

    return (
      <div className="min-h-full bg-[#f6f8fb]">
        <div className="max-w-7xl mx-auto px-5 py-7 md:py-9">
          <button onClick={() => setResult(null)} className="btn-ghost mb-6">
            <ArrowRight className="w-4 h-4 rotate-180" />
            Back to builder
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-[330px_1fr] gap-6">
            <aside className="space-y-5">
              <section className="bg-white border border-slate-200 rounded-2xl p-6 text-center shadow-sm">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400 mb-4">ATS Resume Score</p>
                <ScoreRing score={result.totalScore} />
                <div className={`mt-4 inline-flex px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                  result.isATSFriendly ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'
                }`}>
                  {result.isATSFriendly ? 'ATS friendly' : 'Needs improvement'}
                </div>
              </section>

              <section className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">AI Suggestions</p>
                </div>
                <ul className="space-y-2">
                  {result.aiSuggestions?.map((suggestion: string, index: number) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-slate-700">
                      <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                        {index + 1}
                      </span>
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </section>
            </aside>

            <main className="space-y-5">
              <section className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart2 className="w-4 h-4 text-indigo-500" />
                  <h1 className="text-lg font-bold text-slate-900" style={{ fontFamily: 'Outfit, sans-serif' }}>Score Breakdown</h1>
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                  <DimensionBar
                    label="Keyword Match"
                    score={breakdown.keywordMatch.score}
                    max={40}
                    icon={Tag}
                    items={{
                      good: breakdown.keywordMatch.matchedKeywords.slice(0, 4).map((keyword: string) => `"${keyword}" present`),
                      bad: breakdown.keywordMatch.missingKeywords.slice(0, 4).map((keyword: string) => `"${keyword}" missing`),
                    }}
                  />
                  <DimensionBar
                    label="Section Completeness"
                    score={breakdown.sectionCompleteness.score}
                    max={20}
                    icon={Layers}
                    items={{
                      good: breakdown.sectionCompleteness.presentSections.map((section: string) => `${section} present`),
                      bad: breakdown.sectionCompleteness.missingSections.map((section: string) => `${section} missing`),
                    }}
                  />
                  <DimensionBar
                    label="Formatting Quality"
                    score={breakdown.formattingQuality.score}
                    max={20}
                    icon={AlignLeft}
                    items={{
                      good: breakdown.formattingQuality.issues.length === 0 ? ['Readable format detected'] : [],
                      bad: breakdown.formattingQuality.issues,
                    }}
                  />
                  <DimensionBar
                    label="Quantification"
                    score={breakdown.quantification.score}
                    max={10}
                    icon={Hash}
                    items={{
                      good: breakdown.quantification.examples.map((example: string) => `Metric found: "${example.trim()}"`),
                      bad: breakdown.quantification.score < 6 ? ['Add more measurable outcomes to your bullets'] : [],
                    }}
                  />
                  <DimensionBar
                    label="Length Optimization"
                    score={breakdown.lengthOptimization.score}
                    max={10}
                    icon={Percent}
                    items={{
                      good: breakdown.lengthOptimization.score >= 8 ? [breakdown.lengthOptimization.feedback] : [],
                      bad: breakdown.lengthOptimization.score < 8 ? [breakdown.lengthOptimization.feedback] : [],
                    }}
                  />
                </div>
              </section>

              <section className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Target className="w-4 h-4 text-indigo-500" />
                  <h2 className="text-sm font-bold text-slate-900">Keyword Analysis</h2>
                </div>
                <div className="mb-4">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.16em] mb-2">
                    Present ({breakdown.keywordMatch.matchedKeywords.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {breakdown.keywordMatch.matchedKeywords.map((keyword: string) => (
                      <KeywordPill key={keyword} text={keyword} present />
                    ))}
                    {breakdown.keywordMatch.matchedKeywords.length === 0 && <span className="text-xs text-slate-400">None detected</span>}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.16em] mb-2">
                    Missing ({breakdown.keywordMatch.missingKeywords.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {breakdown.keywordMatch.missingKeywords.map((keyword: string) => (
                      <KeywordPill key={keyword} text={keyword} present={false} />
                    ))}
                    {breakdown.keywordMatch.missingKeywords.length === 0 && (
                      <span className="text-xs text-emerald-600 font-semibold">Strong keyword coverage</span>
                    )}
                  </div>
                </div>
              </section>
            </main>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-[#f6f8fb]">
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-5 py-10 md:py-14 grid lg:grid-cols-[1fr_470px] gap-10 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold mb-5">
              <Sparkles className="w-3.5 h-3.5" />
              AI resume builder for interview-ready candidates
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-950 leading-[1.02]" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Build a resume that gets you into interviews.
            </h1>
            <p className="text-base md:text-lg text-slate-600 mt-5 max-w-2xl leading-relaxed">
              Generate a polished resume from your interview performance, upload an existing PDF, and score it against the job description before you apply.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mt-7">
              <button onClick={handleGenerateResume} disabled={generating} className="btn-primary py-3 px-5">
                {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                Generate Resume
              </button>
              <button onClick={() => setMode('check')} className="btn-ghost py-3 px-5">
                <Upload className="w-4 h-4" />
                Check Existing Resume
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-8 max-w-xl">
              {[
                ['5-part', 'ATS scoring'],
                ['PDF', 'upload support'],
                ['AI', 'resume draft'],
              ].map(([value, label]) => (
                <div key={label} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-xl font-extrabold text-slate-950" style={{ fontFamily: 'Outfit, sans-serif' }}>{value}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <ResumePreview template={selectedTemplate} />
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-5 py-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-500">Templates</p>
            <h2 className="text-2xl font-bold text-slate-950 mt-1" style={{ fontFamily: 'Outfit, sans-serif' }}>Choose your resume style</h2>
          </div>
          <p className="text-sm text-slate-500 max-w-xl">
            Pick a visual direction, then generate or check your content inside the builder.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {templates.map((template) => (
            <button
              key={template.name}
              onClick={() => setSelectedTemplate(template)}
              className={`text-left rounded-2xl border bg-white p-4 transition-all hover:shadow-md ${
                selectedTemplate.name === template.name ? 'border-indigo-300 ring-4 ring-indigo-50' : 'border-slate-200'
              }`}
            >
              <div className="h-28 rounded-xl border border-slate-200 bg-slate-50 p-3 mb-4">
                <div className="h-full grid grid-cols-[32%_1fr] gap-3">
                  <div className="rounded-lg" style={{ background: template.accent }} />
                  <div className="space-y-2 py-1">
                    <div className="h-2.5 w-2/3 rounded bg-slate-700" />
                    <div className="h-1.5 w-1/2 rounded" style={{ background: template.accent }} />
                    <div className="h-1.5 w-full rounded bg-slate-200" />
                    <div className="h-1.5 w-5/6 rounded bg-slate-200" />
                    <div className="h-1.5 w-3/4 rounded bg-slate-200" />
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-base font-bold text-slate-950">{template.name}</p>
                  <p className="text-xs font-semibold text-slate-400">{template.tone}</p>
                </div>
                {selectedTemplate.name === template.name && <CheckCircle className="w-5 h-5 text-indigo-500" />}
              </div>
              <p className="text-sm text-slate-500 mt-3 leading-relaxed">{template.description}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-5 pb-10">
        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
          <div className="grid lg:grid-cols-[280px_1fr]">
            <aside className="bg-slate-950 text-white p-6">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-300 mb-5">Builder Workspace</p>
              <div className="space-y-2">
                <button
                  onClick={() => setMode('build')}
                  className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
                    mode === 'build' ? 'bg-white text-slate-950' : 'text-slate-300 hover:bg-white/10'
                  }`}
                >
                  <PenLine className="w-4 h-4" />
                  Build Resume
                </button>
                <button
                  onClick={() => setMode('check')}
                  className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
                    mode === 'check' ? 'bg-white text-slate-950' : 'text-slate-300 hover:bg-white/10'
                  }`}
                >
                  <BarChart2 className="w-4 h-4" />
                  ATS Checker
                </button>
              </div>

              <div className="mt-8 rounded-2xl bg-white/10 border border-white/10 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400 mb-3">Resume essentials</p>
                <div className="space-y-2">
                  {['Contact info', 'Experience', 'Projects', 'Skills', 'Education'].map((item) => (
                    <div key={item} className="flex items-center gap-2 text-sm text-slate-200">
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </aside>

            <main className="p-5 md:p-7">
              {error && (
                <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {mode === 'build' ? (
                <div className="grid xl:grid-cols-[1fr_380px] gap-6">
                  <section>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                      <div>
                        <h2 className="text-xl font-bold text-slate-950" style={{ fontFamily: 'Outfit, sans-serif' }}>AI resume draft</h2>
                        <p className="text-sm text-slate-500 mt-1">Generate from your progress, then edit before scoring.</p>
                      </div>
                      <button onClick={handleGenerateResume} disabled={generating} className="btn-primary">
                        {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                        Generate
                      </button>
                    </div>

                    <textarea
                      value={resumeText}
                      onChange={(event) => {
                        setResumeText(event.target.value);
                        setGeneratedResume(event.target.value);
                      }}
                      placeholder="Generate a resume from your interview progress, or paste your existing resume here..."
                      className="w-full min-h-[430px] rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm leading-relaxed text-slate-800 resize-none outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
                    />
                    <div className="flex items-center justify-between mt-3 text-xs text-slate-400">
                      <span>{wordCount} words</span>
                      <span>{selectedTemplate.name} template selected</span>
                    </div>
                  </section>

                  <aside className="space-y-4">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400 mb-3">Role Target</p>
                      <input
                        value={targetRole}
                        onChange={(event) => setTargetRole(event.target.value)}
                        placeholder="e.g. Full Stack Developer"
                        className="input-field"
                      />
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400 mb-3">Strong bullet examples</p>
                      <div className="space-y-3">
                        {sampleBullets.map((bullet) => (
                          <div key={bullet} className="flex items-start gap-2 text-sm text-slate-700">
                            <Briefcase className="w-4 h-4 mt-0.5 text-indigo-500 flex-shrink-0" />
                            {bullet}
                          </div>
                        ))}
                      </div>
                    </div>

                    <button onClick={() => setMode('check')} className="w-full btn-ghost py-3">
                      <ArrowRight className="w-4 h-4" />
                      Continue to ATS Check
                    </button>
                  </aside>
                </div>
              ) : (
                <div className="grid xl:grid-cols-[1fr_360px] gap-6">
                  <section>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                      <div>
                        <h2 className="text-xl font-bold text-slate-950" style={{ fontFamily: 'Outfit, sans-serif' }}>Check your resume</h2>
                        <p className="text-sm text-slate-500 mt-1">Paste text or upload a PDF, then compare against a job description.</p>
                      </div>
                      <label className="btn-ghost cursor-pointer">
                        <Upload className="w-4 h-4" />
                        Upload PDF
                        <input type="file" accept=".pdf" className="hidden" onChange={handleFileInput} />
                      </label>
                    </div>

                    <div
                      onDrop={onDrop}
                      onDragOver={(event) => event.preventDefault()}
                      className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4"
                    >
                      <textarea
                        value={resumeText}
                        onChange={(event) => setResumeText(event.target.value)}
                        placeholder="Paste resume text here, or drop a PDF on this area..."
                        className="w-full min-h-[350px] bg-transparent text-sm leading-relaxed text-slate-800 resize-none outline-none"
                      />
                    </div>

                    <div className="flex items-center justify-between mt-3 text-xs text-slate-400">
                      <span>{wordCount} words</span>
                      <span className={resumeText.trim().length >= 30 ? 'text-emerald-600 font-semibold' : ''}>
                        {resumeText.trim().length >= 30 ? 'Ready to score' : 'Add more content to score'}
                      </span>
                    </div>
                  </section>

                  <aside className="space-y-4">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400 mb-3">Target Role</p>
                      <input
                        value={targetRole}
                        onChange={(event) => setTargetRole(event.target.value)}
                        placeholder="e.g. Backend Engineer"
                        className="input-field"
                      />
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400 mb-2">Job Description</p>
                      <textarea
                        value={jobDescription}
                        onChange={(event) => setJobDescription(event.target.value)}
                        placeholder="Paste the job description to improve keyword matching..."
                        className="w-full h-36 rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-800 resize-none outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
                      />
                    </div>

                    <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-5">
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-700 mb-3">Score Model</p>
                      {[
                        ['Keyword Match', '40'],
                        ['Sections', '20'],
                        ['Formatting', '20'],
                        ['Metrics', '10'],
                        ['Length', '10'],
                      ].map(([label, value]) => (
                        <div key={label} className="flex justify-between text-sm text-indigo-900 py-1">
                          <span>{label}</span>
                          <span className="font-bold">{value}</span>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={handleAnalyze}
                      disabled={loading || resumeText.trim().length < 30}
                      className="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <BarChart2 className="w-4 h-4" />}
                      Get ATS Score
                    </button>
                  </aside>
                </div>
              )}

              {generatedResume && mode === 'build' && (
                <div className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Draft generated. Review it, then run the ATS check before applying.
                </div>
              )}
            </main>
          </div>
        </div>
      </section>
    </div>
  );
}
