// ============================================================
// JDInterview.tsx — Job Description → Custom Interview Pipeline
// Paste JD → AI extracts skills → custom interview generated
// ============================================================

import { useState } from 'react';
import { api } from '../services/api';
import ChatBox from '../components/ChatBox';
import PageHeader from '../components/PageHeader';
import { IconTile } from '../components/Game';
import { MODES, type GameColor } from '../lib/interviewUi';
import { FileText, Loader2, AlertTriangle, Play, Minus, Plus, Check, ScanSearch, Gauge, Scale, Crosshair, Gem } from 'lucide-react';

const SAMPLE_JD = `We are looking for a Senior Frontend Developer with 3+ years of experience in React.js, TypeScript, and modern CSS frameworks. You will build scalable UI components, work with REST APIs, and collaborate with cross-functional teams.

Requirements:
- Proficiency in React, TypeScript, Redux
- Experience with Node.js and REST APIs
- Strong knowledge of HTML5, CSS3, responsive design
- Familiarity with Git, CI/CD, and agile workflows
- Experience with testing (Jest, React Testing Library)`;

const STEPS: { icon: React.ElementType; color: GameColor; text: string }[] = [
  { icon: ScanSearch, color: 'blue',   text: 'Extracts required skills and tech stack' },
  { icon: Gauge,      color: 'orange', text: 'Identifies seniority and difficulty' },
  { icon: Scale,      color: 'purple', text: 'Mixes 60% technical with 40% behavioral' },
  { icon: Crosshair,  color: 'pink',   text: 'Tailors every question to this role' },
];

const mode = MODES.jd;
const MIN_CHARS = 50;

export default function JDInterview() {
  const [jd, setJd] = useState('');
  const [count, setCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<any>(null);

  const handleGenerate = async () => {
    if (jd.trim().length < MIN_CHARS) { setError(`Please paste a valid job description (min ${MIN_CHARS} characters)`); return; }
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

  const chars = jd.trim().length;
  const ready = chars >= MIN_CHARS;

  return (
    <div className="min-h-full p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
      <PageHeader
        icon={mode.icon}
        color={mode.color}
        title="Job description interview"
        tag={<><Gem className="w-3 h-3" /> +50 XP per answer</>}
        subtitle="Paste a job description. The AI pulls out the skills and builds an interview around them."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="card lg:col-span-2 animate-slide-up">
          <div className="flex items-center justify-between gap-3 mb-4">
            <p className="flex items-center gap-2 text-base font-black text-game-ink">
              <FileText className="w-5 h-5 text-game-orange" strokeWidth={2.6} />
              Paste the job description
            </p>
            <button onClick={() => setJd(SAMPLE_JD)} className="btn-ghost !py-2 !px-3 !text-xs">
              Use sample
            </button>
          </div>
          <textarea
            value={jd}
            onChange={(e) => setJd(e.target.value)}
            placeholder={'Paste the full job description here…\n\nInclude requirements, responsibilities and tech stack for the best questions.'}
            className="input-field h-72 resize-none !font-medium leading-relaxed"
          />
          <div className="flex items-center justify-between mt-3">
            <span className="text-sm font-bold text-game-muted">{jd.trim().split(/\s+/).filter(Boolean).length} words</span>
            <span className={`inline-flex items-center gap-1 text-sm font-black ${ready ? 'text-game-green-edge' : 'text-game-muted'}`}>
              {ready ? <><Check className="w-4 h-4" strokeWidth={3.5} /> Ready to analyze</> : `${MIN_CHARS - chars} more characters needed`}
            </span>
          </div>

          {error && (
            <div className="mt-4 flex items-start gap-2 bg-game-red-soft border-2 border-[#FFC2C2] rounded-2xl p-3 text-sm font-bold text-game-red-edge">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" /> {error}
            </div>
          )}
        </div>

        <div className="space-y-6 animate-slide-up" style={{ animationDelay: '80ms' }}>
          <div className="card">
            <p className="text-sm font-black text-game-ink mb-2.5">Questions</p>
            <div className="flex items-center justify-between rounded-2xl border-2 border-game-line bg-game-bg p-2">
              <button onClick={() => setCount((c) => Math.max(3, c - 1))} className="btn-ghost !p-2.5" aria-label="Fewer questions">
                <Minus className="w-5 h-5" strokeWidth={3} />
              </button>
              <span className="text-2xl font-black text-game-ink">{count}</span>
              <button onClick={() => setCount((c) => Math.min(10, c + 1))} className="btn-ghost !p-2.5" aria-label="More questions">
                <Plus className="w-5 h-5" strokeWidth={3} />
              </button>
            </div>

            <button onClick={handleGenerate} disabled={loading || !ready} className="btn-green w-full !py-4 !text-base mt-5">
              {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Analyzing JD…</> : <><Play className="w-5 h-5" fill="currentColor" /> Generate interview</>}
            </button>
          </div>

          <div className="card">
            <p className="section-title mb-4">What the AI does</p>
            <div className="space-y-3.5">
              {STEPS.map(({ icon, color, text }) => (
                <div key={text} className="flex items-center gap-3">
                  <IconTile icon={icon} color={color} size="sm" />
                  <p className="text-sm font-bold text-game-ink">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
