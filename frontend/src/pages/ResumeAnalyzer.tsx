import { useCallback, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';
import PageHeader from '../components/PageHeader';
import { GameBar, IconTile, ScoreRing } from '../components/Game';
import { PALETTE, RESUME_MODE, type GameColor } from '../lib/interviewUi';
import {
  AlignLeft,
  ArrowLeft,
  ArrowRight,
  Award,
  BarChart2,
  Briefcase,
  Check,
  ChevronDown,
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
  X,
} from 'lucide-react';

type BuilderMode = 'build' | 'check';

type Template = {
  name: string;
  tone: string;
  accent: string;
  description: string;
};

const templates: Template[] = [
  { name: 'Cascade', tone: 'Modern',  accent: '#1CB0F6', description: 'Structured sidebar layout for full-stack and product roles.' },
  { name: 'Crisp',   tone: 'Minimal', accent: '#58CC02', description: 'Clean one-column resume for ATS-heavy applications.' },
  { name: 'Cubic',   tone: 'Bold',    accent: '#7C5CFC', description: 'Confident section blocks for experienced engineers.' },
];

const sampleBullets = [
  'Built AI-powered interview preparation workflows using React, Node.js, and PostgreSQL.',
  'Improved candidate readiness scoring with topic analytics, streaks, and ATS resume checks.',
  'Designed production-ready API validation, Swagger docs, and deployment configuration.',
];

const SCORE_MODEL: [string, number, GameColor][] = [
  ['Keyword match', 40, 'blue'],
  ['Sections', 20, 'purple'],
  ['Formatting', 20, 'orange'],
  ['Metrics', 10, 'pink'],
  ['Length', 10, 'green'],
];

const pctColor = (pct: number): GameColor => (pct >= 70 ? 'green' : pct >= 40 ? 'orange' : 'red');
const gradeOf = (pct: number) =>
  pct >= 90 ? 'A+' : pct >= 80 ? 'A' : pct >= 70 ? 'B+' : pct >= 60 ? 'B' : pct >= 50 ? 'C' : pct >= 35 ? 'D' : 'F';

function DimensionBar({
  label,
  score,
  max,
  icon,
  color,
  items,
}: {
  label: string;
  score: number;
  max: number;
  icon: React.ElementType;
  color: GameColor;
  items?: { good: string[]; bad: string[] };
}) {
  const pct = Math.round((score / max) * 100);
  const tone = pctColor(pct);
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-2xl border-2 border-game-line bg-white p-4" style={{ boxShadow: '0 3px 0 #E5E5F0' }}>
      <button onClick={() => setOpen((value) => !value)} className="w-full text-left">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <IconTile icon={icon} color={color} size="sm" />
            <span className="text-sm font-black text-game-ink truncate">{label}</span>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className="text-sm font-black" style={{ color: PALETTE[tone].text }}>{score}/{max}</span>
            <ChevronDown className={`w-4 h-4 text-game-muted transition-transform ${open ? 'rotate-180' : ''}`} strokeWidth={2.8} />
          </div>
        </div>
        <GameBar value={pct} color={tone} height={12} />
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
              <div key={`good-${index}`} className="flex items-start gap-2 text-xs font-bold text-game-green-edge">
                <Check className="w-4 h-4 flex-shrink-0" strokeWidth={3} />
                {text}
              </div>
            ))}
            {items.bad.map((text, index) => (
              <div key={`bad-${index}`} className="flex items-start gap-2 text-xs font-bold text-game-red-edge">
                <X className="w-4 h-4 flex-shrink-0" strokeWidth={3} />
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
    <span
      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black border-2 ${
        present ? 'bg-game-green-soft text-game-green-edge border-[#C8EFA9]' : 'bg-game-red-soft text-game-red-edge border-[#FFC2C2]'
      }`}
    >
      {present ? <Check className="w-3.5 h-3.5" strokeWidth={3.5} /> : <X className="w-3.5 h-3.5" strokeWidth={3.5} />}
      {text}
    </span>
  );
}

function ResumePreview({ template }: { template: Template }) {
  return (
    <div className="relative mx-auto w-full max-w-[300px]">
      <div className="absolute -left-6 top-8 z-10 rounded-2xl bg-white border-2 border-game-line p-2.5 hidden sm:flex items-center gap-2 animate-floaty" style={{ boxShadow: '0 3px 0 #E5E5F0' }}>
        <IconTile icon={Award} color="green" size="sm" />
        <div>
          <p className="text-xs font-black text-game-ink">ATS ready</p>
          <p className="text-[10px] font-bold text-game-muted">Optimized format</p>
        </div>
      </div>
      <div className="absolute -right-6 bottom-10 z-10 rounded-2xl bg-white border-2 border-game-line p-2.5 hidden sm:flex items-center gap-2 animate-floaty" style={{ boxShadow: '0 3px 0 #E5E5F0', animationDelay: '1.2s' }}>
        <IconTile icon={Sparkles} color="purple" size="sm" />
        <div>
          <p className="text-xs font-black text-game-ink">AI bullets</p>
          <p className="text-[10px] font-bold text-game-muted">Role matched</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border-2 border-game-line overflow-hidden aspect-[0.72]" style={{ boxShadow: '0 6px 0 #E5E5F0' }}>
        <div className="h-full grid grid-cols-[34%_1fr]">
          <aside className="p-4 text-white transition-colors duration-300" style={{ background: template.accent }}>
            <div className="w-11 h-11 rounded-2xl bg-white/30 mb-4" />
            <div className="h-2.5 w-20 bg-white/80 rounded-full mb-2" />
            <div className="h-2 w-16 bg-white/50 rounded-full mb-6" />
            {['CONTACT', 'SKILLS', 'TOOLS'].map((section) => (
              <div key={section} className="mb-4">
                <p className="text-[7px] font-black tracking-[0.2em] mb-1.5 opacity-80">{section}</p>
                <div className="space-y-1.5">
                  <div className="h-1.5 w-full bg-white/50 rounded-full" />
                  <div className="h-1.5 w-5/6 bg-white/40 rounded-full" />
                </div>
              </div>
            ))}
          </aside>
          <main className="p-4">
            <div className="mb-4">
              <div className="h-3.5 w-28 bg-game-ink rounded-full mb-2" />
              <div className="h-2 w-20 rounded-full" style={{ background: template.accent }} />
            </div>
            {['SUMMARY', 'EXPERIENCE', 'PROJECTS', 'EDUCATION'].map((section) => (
              <div key={section} className="mb-4">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <div className="h-2 w-2 rounded-full" style={{ background: template.accent }} />
                  <p className="text-[7px] font-black tracking-[0.18em] text-game-muted">{section}</p>
                </div>
                <div className="space-y-1.5">
                  <div className="h-1.5 w-full bg-[#ECECF4] rounded-full" />
                  <div className="h-1.5 w-11/12 bg-[#ECECF4] rounded-full" />
                  <div className="h-1.5 w-4/5 bg-[#ECECF4] rounded-full" />
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

  const uploadPdf = useCallback(async (file: File) => {
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

  const onDrop = useCallback(async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (!file || !file.type.includes('pdf')) {
      setError('Only PDF files are supported.');
      return;
    }
    await uploadPdf(file);
  }, [uploadPdf]);

  const handleFileInput = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) await uploadPdf(file);
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
    const tone = PALETTE[pctColor(result.totalScore)];

    return (
      <div className="min-h-full p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
        <button onClick={() => setResult(null)} className="btn-ghost mb-6">
          <ArrowLeft className="w-5 h-5" /> Back to builder
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-[330px_1fr] gap-6">
          <aside className="space-y-6">
            <section className="card text-center animate-scale-in">
              <p className="eyebrow text-game-muted mb-5">ATS resume score</p>
              <div className="flex justify-center">
                <ScoreRing value={result.totalScore} max={100} size={150} stroke={16} color={tone.face}>
                  <span className="text-5xl font-black text-game-ink leading-none">{result.totalScore}</span>
                  <span className="text-xs font-extrabold text-game-muted">/ 100</span>
                </ScoreRing>
              </div>
              <div className="flex justify-center gap-2 mt-5">
                <span className="text-lg font-black text-white px-3.5 py-1 rounded-2xl" style={{ background: tone.face, boxShadow: `0 3px 0 ${tone.edge}` }}>
                  {gradeOf(result.totalScore)}
                </span>
                <span className={`badge !text-sm !px-3 ${result.isATSFriendly ? 'badge-green' : 'badge-red'}`}>
                  {result.isATSFriendly ? 'ATS friendly' : 'Needs improvement'}
                </span>
              </div>
            </section>

            <section className="card animate-slide-up">
              <div className="flex items-center gap-2.5 mb-4">
                <IconTile icon={Sparkles} color="yellow" size="sm" />
                <p className="section-title">Power-ups</p>
              </div>
              <ul className="space-y-3">
                {result.aiSuggestions?.map((suggestion: string, index: number) => (
                  <li key={index} className="flex items-start gap-2.5 text-sm font-semibold text-game-ink">
                    <span className="w-6 h-6 rounded-full bg-game-yellow text-white text-xs font-black flex items-center justify-center flex-shrink-0" style={{ boxShadow: '0 2px 0 #E0A800' }}>
                      {index + 1}
                    </span>
                    {suggestion}
                  </li>
                ))}
              </ul>
            </section>
          </aside>

          <main className="space-y-6">
            <section className="card animate-slide-up">
              <div className="flex items-center gap-2.5 mb-5">
                <IconTile icon={BarChart2} color="blue" size="sm" />
                <h1 className="section-title">Score breakdown</h1>
                <span className="text-xs font-bold text-game-muted ml-auto hidden sm:inline">Tap a row for details</span>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <DimensionBar
                  label="Keyword match"
                  score={breakdown.keywordMatch.score}
                  max={40}
                  icon={Tag}
                  color="blue"
                  items={{
                    good: breakdown.keywordMatch.matchedKeywords.slice(0, 4).map((keyword: string) => `"${keyword}" present`),
                    bad: breakdown.keywordMatch.missingKeywords.slice(0, 4).map((keyword: string) => `"${keyword}" missing`),
                  }}
                />
                <DimensionBar
                  label="Section completeness"
                  score={breakdown.sectionCompleteness.score}
                  max={20}
                  icon={Layers}
                  color="purple"
                  items={{
                    good: breakdown.sectionCompleteness.presentSections.map((section: string) => `${section} present`),
                    bad: breakdown.sectionCompleteness.missingSections.map((section: string) => `${section} missing`),
                  }}
                />
                <DimensionBar
                  label="Formatting quality"
                  score={breakdown.formattingQuality.score}
                  max={20}
                  icon={AlignLeft}
                  color="orange"
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
                  color="pink"
                  items={{
                    good: breakdown.quantification.examples.map((example: string) => `Metric found: "${example.trim()}"`),
                    bad: breakdown.quantification.score < 6 ? ['Add more measurable outcomes to your bullets'] : [],
                  }}
                />
                <DimensionBar
                  label="Length optimization"
                  score={breakdown.lengthOptimization.score}
                  max={10}
                  icon={Percent}
                  color="green"
                  items={{
                    good: breakdown.lengthOptimization.score >= 8 ? [breakdown.lengthOptimization.feedback] : [],
                    bad: breakdown.lengthOptimization.score < 8 ? [breakdown.lengthOptimization.feedback] : [],
                  }}
                />
              </div>
            </section>

            <section className="card animate-slide-up">
              <div className="flex items-center gap-2.5 mb-5">
                <IconTile icon={Target} color="green" size="sm" />
                <h2 className="section-title">Keyword analysis</h2>
              </div>
              <div className="mb-5">
                <p className="eyebrow text-game-green-edge mb-2.5">Present ({breakdown.keywordMatch.matchedKeywords.length})</p>
                <div className="flex flex-wrap gap-2">
                  {breakdown.keywordMatch.matchedKeywords.map((keyword: string) => (
                    <KeywordPill key={keyword} text={keyword} present />
                  ))}
                  {breakdown.keywordMatch.matchedKeywords.length === 0 && <span className="text-sm font-bold text-game-muted">None detected</span>}
                </div>
              </div>
              <div>
                <p className="eyebrow text-game-red-edge mb-2.5">Missing ({breakdown.keywordMatch.missingKeywords.length})</p>
                <div className="flex flex-wrap gap-2">
                  {breakdown.keywordMatch.missingKeywords.map((keyword: string) => (
                    <KeywordPill key={keyword} text={keyword} present={false} />
                  ))}
                  {breakdown.keywordMatch.missingKeywords.length === 0 && (
                    <span className="text-sm font-black text-game-green-edge">Strong keyword coverage</span>
                  )}
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>
    );
  }

  const tabs: { id: BuilderMode; label: string; desc: string; icon: React.ElementType; color: GameColor }[] = [
    { id: 'build', label: 'Build resume', desc: 'AI draft from your interviews', icon: PenLine,   color: 'purple' },
    { id: 'check', label: 'ATS checker',  desc: 'Score against a job description', icon: BarChart2, color: 'green' },
  ];

  return (
    <div className="min-h-full p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
      <PageHeader
        icon={RESUME_MODE.icon}
        color={RESUME_MODE.color}
        title="Resume analyzer"
        tag={<><Award className="w-3 h-3" /> Resume Pro medal at 80+</>}
        subtitle="Generate a resume from your interviews, or score your own against a job description."
        actions={
          <button onClick={handleGenerateResume} disabled={generating} className="btn-white !text-game-green-edge">
            {generating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
            Generate
          </button>
        }
      />

      {/* Template picker */}
      <section className="card mb-6 animate-slide-up">
        <div className="grid lg:grid-cols-[1fr_300px] gap-8 items-center">
          <div>
            <p className="section-title">Choose your style</p>
            <p className="text-sm font-bold text-game-muted mt-0.5 mb-5">Pick a look, then build or check your content below.</p>
            <div className="grid sm:grid-cols-3 gap-3">
              {templates.map((template) => {
                const active = selectedTemplate.name === template.name;
                return (
                  <button
                    key={template.name}
                    onClick={() => setSelectedTemplate(template)}
                    className="choice relative text-left p-3.5"
                    style={active ? { borderColor: template.accent, boxShadow: `0 3px 0 ${template.accent}` } : undefined}
                  >
                    {active && (
                      <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full text-white flex items-center justify-center border-2 border-white" style={{ background: template.accent }}>
                        <Check className="w-3.5 h-3.5" strokeWidth={4} />
                      </span>
                    )}
                    <div className="h-20 rounded-xl border-2 border-game-line bg-game-bg p-2.5 mb-3">
                      <div className="h-full grid grid-cols-[32%_1fr] gap-2.5">
                        <div className="rounded-lg" style={{ background: template.accent }} />
                        <div className="space-y-1.5 py-0.5">
                          <div className="h-2 w-2/3 rounded-full bg-game-ink" />
                          <div className="h-1.5 w-1/2 rounded-full" style={{ background: template.accent }} />
                          <div className="h-1.5 w-full rounded-full bg-[#DCDCEA]" />
                          <div className="h-1.5 w-5/6 rounded-full bg-[#DCDCEA]" />
                        </div>
                      </div>
                    </div>
                    <p className="text-base font-black text-game-ink">{template.name}</p>
                    <p className="text-xs font-black uppercase tracking-wide" style={{ color: template.accent }}>{template.tone}</p>
                    <p className="text-xs font-bold text-game-muted mt-1.5 leading-snug">{template.description}</p>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="hidden lg:block">
            <ResumePreview template={selectedTemplate} />
          </div>
        </div>
      </section>

      {/* Mode tabs */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6">
        {tabs.map((t) => {
          const active = mode === t.id;
          const p = PALETTE[t.color];
          return (
            <button
              key={t.id}
              onClick={() => setMode(t.id)}
              className="choice flex items-center gap-3 p-4 text-left"
              style={active ? { borderColor: p.face, background: p.soft, boxShadow: `0 4px 0 ${p.face}` } : undefined}
            >
              <IconTile icon={t.icon} color={t.color} size="md" soft={!active} />
              <div className="min-w-0">
                <p className="text-base font-black" style={active ? { color: p.text } : undefined}>{t.label}</p>
                <p className="text-xs font-bold text-game-muted hidden sm:block">{t.desc}</p>
              </div>
            </button>
          );
        })}
      </div>

      {error && (
        <div className="mb-6 rounded-2xl border-2 border-[#FFC2C2] bg-game-red-soft px-4 py-3 text-sm font-bold text-game-red-edge">
          {error}
        </div>
      )}

      {mode === 'build' ? (
        <div className="grid xl:grid-cols-[1fr_360px] gap-6">
          <section className="card">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="section-title">AI resume draft</h2>
                <p className="text-sm font-bold text-game-muted mt-0.5">Generate from your progress, then edit before scoring.</p>
              </div>
              <button onClick={handleGenerateResume} disabled={generating} className="btn-primary">
                {generating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
                Generate
              </button>
            </div>
            <textarea
              value={resumeText}
              onChange={(event) => {
                setResumeText(event.target.value);
                setGeneratedResume(event.target.value);
              }}
              placeholder="Generate a resume from your interview progress, or paste your existing resume here…"
              className="input-field min-h-[430px] resize-none !font-medium leading-relaxed"
            />
            <div className="flex items-center justify-between mt-3 text-sm font-bold text-game-muted">
              <span>{wordCount} words</span>
              <span>{selectedTemplate.name} template</span>
            </div>
            {generatedResume && (
              <div className="mt-4 rounded-2xl border-2 border-[#C8EFA9] bg-game-green-soft px-4 py-3 text-sm font-bold text-game-green-edge flex items-center gap-2">
                <Download className="w-5 h-5" />
                Draft ready. Review it, then run the ATS check before applying.
              </div>
            )}
          </section>

          <aside className="space-y-6">
            <div className="card">
              <p className="text-sm font-black text-game-ink mb-2.5">Target role</p>
              <input value={targetRole} onChange={(event) => setTargetRole(event.target.value)} placeholder="e.g. Full Stack Developer" className="input-field" />
            </div>

            <div className="card">
              <p className="section-title mb-4">Strong bullet examples</p>
              <div className="space-y-3.5">
                {sampleBullets.map((bullet) => (
                  <div key={bullet} className="flex items-start gap-2.5 text-sm font-semibold text-game-ink">
                    <Briefcase className="w-5 h-5 text-game-purple flex-shrink-0" strokeWidth={2.4} />
                    {bullet}
                  </div>
                ))}
              </div>
            </div>

            <button onClick={() => setMode('check')} className="btn-green w-full !py-4">
              Continue to ATS check <ArrowRight className="w-5 h-5" />
            </button>
          </aside>
        </div>
      ) : (
        <div className="grid xl:grid-cols-[1fr_360px] gap-6">
          <section className="card">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="section-title">Check your resume</h2>
                <p className="text-sm font-bold text-game-muted mt-0.5">Paste text or upload a PDF, then compare against a job description.</p>
              </div>
              <label className="btn-ghost cursor-pointer">
                <Upload className="w-5 h-5" /> Upload PDF
                <input type="file" accept=".pdf" className="hidden" onChange={handleFileInput} />
              </label>
            </div>

            <div onDrop={onDrop} onDragOver={(event) => event.preventDefault()} className="rounded-2xl border-2 border-dashed border-[#CFCFE0] bg-game-bg p-4 focus-within:border-game-green">
              <textarea
                value={resumeText}
                onChange={(event) => setResumeText(event.target.value)}
                placeholder="Paste resume text here, or drop a PDF on this area…"
                className="w-full min-h-[350px] bg-transparent text-[15px] font-medium leading-relaxed text-game-ink placeholder:text-[#A9A9BF] resize-none outline-none"
              />
            </div>

            <div className="flex items-center justify-between mt-3 text-sm font-bold text-game-muted">
              <span>{wordCount} words</span>
              <span className={`inline-flex items-center gap-1 ${resumeText.trim().length >= 30 ? 'text-game-green-edge' : ''}`}>
                {resumeText.trim().length >= 30 ? <><Check className="w-4 h-4" strokeWidth={3.5} /> Ready to score</> : 'Add more content to score'}
              </span>
            </div>
          </section>

          <aside className="space-y-6">
            <div className="card space-y-4">
              <div>
                <p className="text-sm font-black text-game-ink mb-2.5">Target role</p>
                <input value={targetRole} onChange={(event) => setTargetRole(event.target.value)} placeholder="e.g. Backend Engineer" className="input-field" />
              </div>
              <div>
                <p className="text-sm font-black text-game-ink mb-2.5">Job description</p>
                <textarea
                  value={jobDescription}
                  onChange={(event) => setJobDescription(event.target.value)}
                  placeholder="Paste the job description to improve keyword matching…"
                  className="input-field h-36 resize-none !font-medium"
                />
              </div>
            </div>

            <div className="card">
              <p className="section-title mb-4">How you're scored</p>
              <div className="space-y-3">
                {SCORE_MODEL.map(([label, value, color]) => (
                  <div key={label}>
                    <div className="flex justify-between text-sm font-extrabold mb-1">
                      <span className="text-game-ink">{label}</span>
                      <span className="text-game-muted">{value} pts</span>
                    </div>
                    <GameBar value={value * 2.5} color={color} height={10} />
                  </div>
                ))}
              </div>
            </div>

            <button onClick={handleAnalyze} disabled={loading || resumeText.trim().length < 30} className="btn-green w-full !py-4 !text-base">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <BarChart2 className="w-5 h-5" />}
              Get ATS score
            </button>
          </aside>
        </div>
      )}
    </div>
  );
}
