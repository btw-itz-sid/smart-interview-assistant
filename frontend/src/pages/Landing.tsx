import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BarChart2,
  BrainCircuit,
  Building2,
  FileText,
  MessageSquare,
  Shield,
  Zap,
} from 'lucide-react';
import AppLogo from '../components/AppLogo';

const modes = [
  {
    icon: MessageSquare,
    title: 'Mock Interview',
    desc: 'Topic-based questions with per-answer scoring and written feedback.',
  },
  {
    icon: Building2,
    title: 'Company Interview',
    desc: 'Practice Google, Amazon, TCS and other company-style loops.',
  },
  {
    icon: Zap,
    title: 'JD Interview',
    desc: 'Paste a job description and get questions mapped to that role.',
  },
  {
    icon: BrainCircuit,
    title: 'Behavioral STAR-L',
    desc: 'Structure answers around Situation, Task, Action, Result, Learning.',
  },
  {
    icon: FileText,
    title: 'ATS Resume Score',
    desc: 'Five-dimension resume scoring, keyword gaps, and improvement tips.',
  },
  {
    icon: BarChart2,
    title: 'Progress Tracking',
    desc: 'Readiness score, streaks, XP, badges, and printable interview reports.',
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#f7f8fa]">
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <AppLogo size={32} />
            <span className="font-semibold text-slate-900" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Smart Interview
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/login" className="btn-ghost px-4 py-2">
              Sign in
            </Link>
            <Link to="/register" className="btn-primary px-4 py-2">
              Get started
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="max-w-6xl mx-auto px-5 py-16 md:py-24 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-indigo-500 mb-4">
              AI interview prep
            </p>
            <h1
              className="text-4xl md:text-5xl font-bold text-slate-950 leading-[1.12] mb-5"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              Practice once.
              <br />
              Nail it every time.
            </h1>
            <p className="text-slate-500 text-base leading-relaxed max-w-md mb-8">
              Five interview modes, per-answer AI scoring, and a 5-dimension ATS resume analyzer — built for people who take job prep seriously.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/register" className="btn-primary px-5 py-3">
                Create free account
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/login" className="btn-ghost px-5 py-3">
                I already have an account
              </Link>
            </div>
          </div>

          <div className="rounded-3xl p-6 md:p-8 auth-bg text-white shadow-xl">
            <div className="flex items-center gap-2 mb-6">
              <Shield className="w-4 h-4 text-indigo-300" />
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-300">
                What you get
              </p>
            </div>
            <div className="space-y-0">
              {[
                'Scenario-based questions instead of generic definitions',
                'AI evaluation with score and written feedback',
                'Hints during a live session without revealing the answer',
                'Printable reports for every completed interview',
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 py-3 border-b border-white/[0.08]">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-400 flex-shrink-0" />
                  <p className="text-sm text-slate-200 leading-relaxed">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-slate-200 bg-white">
          <div className="max-w-6xl mx-auto px-5 py-16">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400 mb-3">
              Interview modes
            </p>
            <h2 className="text-2xl font-bold text-slate-900 mb-8" style={{ fontFamily: 'Outfit, sans-serif' }}>
              One workflow from resume to mock loop
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {modes.map(({ icon: Icon, title, desc }) => (
                <article
                  key={title}
                  className="rounded-2xl border border-slate-200 p-5 bg-slate-50/60"
                >
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-1">{title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-400">
        © 2026 Smart Interview Assistant
      </footer>
    </div>
  );
}
