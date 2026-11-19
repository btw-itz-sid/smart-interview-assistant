// ============================================================
// CompanyInterview.tsx — Company-Specific Mock Interview
// ============================================================

import { useState } from 'react';
import { motion } from 'framer-motion';
import { api } from '../services/api';
import ChatBox from '../components/ChatBox';
import PageHeader from '../components/PageHeader';
import { MODES, PALETTE, type GameColor } from '../lib/interviewUi';
import { Loader2, Lightbulb, AlertCircle, Play, Minus, Plus, Briefcase, Gauge, Building2, Check, Gem } from 'lucide-react';

const COMPANIES: { name: string; initials: string; color: GameColor; style: string }[] = [
  { name: 'Google',    initials: 'G',  color: 'blue',   style: 'Google focuses on problem-solving clarity and scalability thinking. Expect whiteboard-style coding and system design.' },
  { name: 'Amazon',    initials: 'A',  color: 'orange', style: 'Amazon is heavily LP (Leadership Principle) driven — every answer should map to a principle like Ownership or Bias for Action.' },
  { name: 'Microsoft', initials: 'M',  color: 'green',  style: 'Microsoft values growth mindset, collaboration, and deep system design thinking.' },
  { name: 'Meta',      initials: 'M',  color: 'purple', style: 'Meta focuses on impact at scale, data-driven decisions, and fast execution velocity.' },
  { name: 'Flipkart',  initials: 'FK', color: 'yellow', style: 'Flipkart values ownership, product thinking, execution speed, and scalable architecture.' },
  { name: 'TCS',       initials: 'T',  color: 'blue',   style: 'TCS interviews assess fundamentals, communication clarity, and adaptability across domains.' },
  { name: 'Infosys',   initials: 'IN', color: 'green',  style: 'Infosys focuses on technical basics, situational problem-solving, and analytical thinking.' },
  { name: 'Wipro',     initials: 'W',  color: 'purple', style: 'Wipro emphasizes communication, teamwork, and core technical proficiency.' },
  { name: 'Startups',  initials: 'S',  color: 'pink',   style: 'Startups value versatility, ownership mindset, rapid learning, and end-to-end execution.' },
];

const ROLES = [
  'Software Engineer', 'Frontend Developer', 'Backend Developer',
  'Full Stack Developer', 'Data Scientist', 'ML Engineer',
  'DevOps Engineer', 'Product Manager', 'System Design Engineer',
  'Mobile Developer',
];

const DIFFICULTIES: { val: string; label: string; desc: string; color: GameColor }[] = [
  { val: 'easy',   label: 'Easy',   desc: 'Warm-up round',        color: 'green' },
  { val: 'medium', label: 'Medium', desc: 'Standard interview',   color: 'orange' },
  { val: 'hard',   label: 'Hard',   desc: 'Senior / challenging', color: 'red' },
];

const mode = MODES.company;

export default function CompanyInterview() {
  const [selectedCompany, setSelectedCompany] = useState('');
  const [role, setRole] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [count, setCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<any>(null);

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

  if (result?.interviewId) {
    return (
      <ChatBox
        interviewId={result.interviewId}
        topic={result.topic || `${selectedCompany} — ${role}`}
        questions={result.questions}
        onEnd={() => setResult(null)}
      />
    );
  }

  const company = COMPANIES.find((c) => c.name === selectedCompany);

  return (
    <div className="min-h-full p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
      <PageHeader
        icon={mode.icon}
        color={mode.color}
        title="Company interview"
        tag={<><Gem className="w-3 h-3" /> +50 XP per answer</>}
        subtitle="Pick your dream company. Questions match the way they actually interview."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="card lg:col-span-2 animate-slide-up">
          <p className="flex items-center gap-2 text-base font-black text-game-ink mb-4">
            <Building2 className="w-5 h-5 text-game-purple" strokeWidth={2.6} />
            Choose a company
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {COMPANIES.map((c) => {
              const p = PALETTE[c.color];
              const active = selectedCompany === c.name;
              return (
                <button
                  key={c.name}
                  onClick={() => setSelectedCompany(c.name)}
                  className={`choice relative flex items-center gap-3 p-3.5 text-left ${active ? 'selected' : ''}`}
                >
                  <div
                    className="w-11 h-11 rounded-2xl flex items-center justify-center text-white text-sm font-black flex-shrink-0"
                    style={{ background: p.face, boxShadow: `0 3px 0 ${p.edge}` }}
                  >
                    {c.initials}
                  </div>
                  <span className="text-[15px] font-black truncate">{c.name}</span>
                  {active && (
                    <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-game-purple text-white flex items-center justify-center border-2 border-white">
                      <Check className="w-3.5 h-3.5" strokeWidth={4} />
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {company && (
            <motion.div
              key={company.name}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-5 rounded-2xl border-2 border-[#FFE58A] bg-game-yellow-soft p-4 flex items-start gap-3"
            >
              <Lightbulb className="w-5 h-5 text-game-yellow-edge mt-0.5 flex-shrink-0" strokeWidth={2.6} />
              <div>
                <p className="text-sm font-black text-[#7A5C00]">How {company.name} interviews</p>
                <p className="text-sm font-semibold text-[#7A5C00] leading-relaxed mt-0.5">{company.style}</p>
              </div>
            </motion.div>
          )}
        </div>

        <div className="card space-y-6 animate-slide-up" style={{ animationDelay: '80ms' }}>
          <div>
            <p className="flex items-center gap-2 text-sm font-black text-game-ink mb-2.5">
              <Briefcase className="w-4 h-4 text-game-blue" strokeWidth={2.6} /> Target role
            </p>
            <select value={role} onChange={(e) => setRole(e.target.value)} className="input-field cursor-pointer">
              <option value="">Select a role…</option>
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <div>
            <p className="flex items-center gap-2 text-sm font-black text-game-ink mb-2.5">
              <Gauge className="w-4 h-4 text-game-orange" strokeWidth={2.6} /> Difficulty
            </p>
            <div className="space-y-2">
              {DIFFICULTIES.map((d) => {
                const active = difficulty === d.val;
                const p = PALETTE[d.color];
                return (
                  <button
                    key={d.val}
                    onClick={() => setDifficulty(d.val)}
                    className="choice w-full flex items-center justify-between px-4 py-3 text-left"
                    style={active ? { borderColor: p.face, background: p.soft, color: p.text, boxShadow: `0 3px 0 ${p.face}` } : undefined}
                  >
                    <div>
                      <p className="text-sm font-black">{d.label}</p>
                      <p className="text-xs font-bold text-game-muted">{d.desc}</p>
                    </div>
                    <span className="w-3 h-3 rounded-full" style={{ background: p.face }} />
                  </button>
                );
              })}
            </div>
          </div>

          <div>
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
          </div>

          {error && (
            <div className="flex items-start gap-2 bg-game-red-soft border-2 border-[#FFC2C2] rounded-2xl p-3 text-sm font-bold text-game-red-edge">
              <AlertCircle className="w-5 h-5 flex-shrink-0" /> {error}
            </div>
          )}

          <button onClick={handleGenerate} disabled={loading || !selectedCompany || !role} className="btn-green w-full !py-4 !text-base">
            {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Generating…</> : <><Play className="w-5 h-5" fill="currentColor" /> Start interview</>}
          </button>
        </div>
      </div>
    </div>
  );
}
