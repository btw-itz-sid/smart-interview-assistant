import { Link } from 'react-router-dom';
import { BarChart2, Bot, Check, Flame, Gem, Shield, Trophy, Play, Star, Target } from 'lucide-react';
import AppLogo from '../components/AppLogo';
import { GameBar, IconTile } from '../components/Game';
import { MODES, PALETTE, RESUME_MODE, type GameColor } from '../lib/interviewUi';

const modes: { icon: React.ElementType; color: GameColor; title: string; desc: string }[] = [
  { icon: MODES.general.icon,    color: MODES.general.color,    title: 'Mock Interview',    desc: 'Topic questions with per-answer scoring and written feedback.' },
  { icon: MODES.company.icon,    color: MODES.company.color,    title: 'Company Interview', desc: 'Practice Google, Amazon, TCS and other company-style loops.' },
  { icon: MODES.jd.icon,         color: MODES.jd.color,         title: 'JD Interview',      desc: 'Paste a job description and get questions mapped to that role.' },
  { icon: MODES.behavioral.icon, color: MODES.behavioral.color, title: 'Behavioral STAR-L', desc: 'Structure answers around Situation, Task, Action, Result, Learning.' },
  { icon: RESUME_MODE.icon,      color: RESUME_MODE.color,      title: 'ATS Resume Score',  desc: 'Five-dimension resume scoring, keyword gaps and improvement tips.' },
  { icon: BarChart2,             color: 'yellow',               title: 'Progress Tracking', desc: 'Readiness score, streaks, XP, medals and printable reports.' },
];

const steps: { icon: React.ElementType; color: GameColor; title: string; desc: string }[] = [
  { icon: Target, color: 'blue',   title: 'Pick a challenge', desc: 'Choose a topic, a company or paste a job description.' },
  { icon: Bot,    color: 'purple', title: 'Answer and get scored', desc: 'The AI scores every answer out of 10 and tells you what to fix.' },
  { icon: Trophy, color: 'yellow', title: 'Level up', desc: 'Earn XP, keep your streak and unlock medals as you improve.' },
];

/** Mock lesson card shown in the hero. */
const HeroPreview = () => (
  <div className="relative max-w-md mx-auto w-full">
    <div className="absolute -top-6 -left-4 z-10 rounded-3xl bg-white border-2 border-game-line p-3.5 flex items-center gap-2.5 animate-floaty" style={{ boxShadow: '0 4px 0 #E5E5F0' }}>
      <Flame className="w-9 h-9 text-game-orange" fill="currentColor" strokeWidth={1.5} />
      <div>
        <p className="text-xl font-black text-game-orange leading-none">7</p>
        <p className="text-[11px] font-extrabold text-game-muted">day streak</p>
      </div>
    </div>
    <div className="absolute -bottom-6 -right-3 z-10 rounded-3xl bg-white border-2 border-game-line p-3.5 flex items-center gap-2.5 animate-floaty" style={{ boxShadow: '0 4px 0 #E5E5F0', animationDelay: '1.2s' }}>
      <Gem className="w-8 h-8 text-game-blue" strokeWidth={2.4} />
      <div>
        <p className="text-xl font-black text-game-blue leading-none">+80 XP</p>
        <p className="text-[11px] font-extrabold text-game-muted">great answer</p>
      </div>
    </div>

    <div className="card !p-5 sm:!p-6">
      <div className="flex items-center gap-3 mb-5">
        <GameBar value={66} color="green" height={16} className="flex-1" />
        <span className="text-sm font-black text-game-muted">2/3</span>
      </div>
      <div className="flex items-end gap-2.5">
        <IconTile icon={Bot} color="purple" size="md" />
        <div className="rounded-3xl rounded-bl-lg border-2 border-game-line px-4 py-3 text-[15px] font-bold text-game-ink" style={{ boxShadow: '0 3px 0 #E5E5F0' }}>
          How would you prevent unnecessary re-renders in a large React list?
        </div>
      </div>
      <div className="flex justify-end mt-4">
        <div className="max-w-[80%] rounded-3xl rounded-br-lg bg-game-blue text-white px-4 py-3 text-sm font-semibold" style={{ boxShadow: '0 3px 0 #1593CF' }}>
          Memoize rows with React.memo, keep keys stable and virtualize the list…
        </div>
      </div>
      <div className="mt-4 rounded-2xl border-2 p-3.5 flex items-center justify-between" style={{ borderColor: PALETTE.green.face, background: PALETTE.green.soft }}>
        <span className="flex items-center gap-2 text-base font-black text-game-green-edge">
          <span className="w-7 h-7 rounded-full bg-game-green text-white flex items-center justify-center"><Check className="w-4 h-4" strokeWidth={4} /></span>
          Great answer!
        </span>
        <span className="text-sm font-black text-white bg-game-green px-2.5 py-1 rounded-xl" style={{ boxShadow: '0 2px 0 #46A302' }}>8/10</span>
      </div>
    </div>
  </div>
);

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-20 bg-white border-b-2 border-game-line">
        <div className="max-w-6xl mx-auto px-4 sm:px-5 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <AppLogo size={34} />
            <span className="font-black text-lg text-game-purple hidden sm:inline">Smart Interview</span>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/login" className="btn-ghost !px-4 !py-2.5">Sign in</Link>
            <Link to="/register" className="btn-green !px-4 !py-2.5">Get started</Link>
          </div>
        </div>
      </header>

      <main>
        <section className="max-w-6xl mx-auto px-4 sm:px-5 py-14 md:py-24 grid md:grid-cols-2 gap-14 items-center">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-game-yellow-soft border-2 border-[#FFE58A] px-3 py-1 text-xs font-black uppercase tracking-wider text-[#A67C00]">
              <Star className="w-3.5 h-3.5" fill="currentColor" /> Free AI interview prep
            </span>
            <h1 className="text-[42px] md:text-6xl font-black text-game-ink leading-[1.02] mt-5">
              Practice interviews <span className="text-game-purple">like a game.</span>
            </h1>
            <p className="text-lg font-bold text-game-muted leading-relaxed max-w-md mt-5">
              Bite-sized mock interviews, instant AI scores, daily streaks and XP. Have fun, and walk into your real interview ready.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mt-8">
              <Link to="/register" className="btn-green !py-4 !px-7 !text-base">
                <Play className="w-5 h-5" fill="currentColor" /> Start for free
              </Link>
              <Link to="/login" className="btn-ghost !py-4 !px-7 !text-base">I have an account</Link>
            </div>
            <div className="flex items-center gap-5 mt-8 text-sm font-extrabold text-game-muted">
              <span className="flex items-center gap-1.5"><Flame className="w-5 h-5 text-game-orange" fill="currentColor" /> Daily streaks</span>
              <span className="flex items-center gap-1.5"><Gem className="w-5 h-5 text-game-blue" /> XP and levels</span>
              <span className="flex items-center gap-1.5 hidden sm:flex"><Shield className="w-5 h-5 text-game-purple" /> 10 medals</span>
            </div>
          </div>

          <HeroPreview />
        </section>

        <section className="bg-game-bg border-y-2 border-game-line">
          <div className="max-w-6xl mx-auto px-4 sm:px-5 py-16 md:py-20">
            <h2 className="text-3xl md:text-4xl font-black text-game-ink text-center">Pick your game mode</h2>
            <p className="text-base font-bold text-game-muted text-center mt-2 mb-10">One app from resume to final round.</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {modes.map(({ icon: Icon, color, title, desc }) => {
                const p = PALETTE[color];
                return (
                  <article
                    key={title}
                    className="relative overflow-hidden rounded-3xl p-6 text-white transition-transform duration-150 hover:-translate-y-1"
                    style={{ background: p.face, boxShadow: `0 6px 0 ${p.edge}` }}
                  >
                    <Icon className="absolute -right-5 -bottom-5 w-28 h-28 opacity-20" strokeWidth={2} />
                    <div className="relative">
                      <div className="w-12 h-12 rounded-2xl bg-white/25 flex items-center justify-center mb-4">
                        <Icon className="w-6 h-6" strokeWidth={2.6} />
                      </div>
                      <h3 className="text-xl font-black text-outline">{title}</h3>
                      <p className="text-sm font-bold text-white/85 mt-1 leading-relaxed">{desc}</p>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 sm:px-5 py-16 md:py-20">
          <h2 className="text-3xl md:text-4xl font-black text-game-ink text-center mb-10">How it works</h2>
          <div className="grid md:grid-cols-3 gap-5">
            {steps.map(({ icon, color, title, desc }, i) => (
              <div key={title} className="card text-center">
                <div className="inline-flex relative">
                  <IconTile icon={icon} color={color} size="xl" />
                  <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-game-ink text-white text-sm font-black flex items-center justify-center border-4 border-white">
                    {i + 1}
                  </span>
                </div>
                <h3 className="text-xl font-black text-game-ink mt-5">{title}</h3>
                <p className="text-sm font-bold text-game-muted mt-1.5">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 sm:px-5 pb-20">
          <div className="auth-bg rounded-3xl p-8 md:p-12 text-center text-white" style={{ boxShadow: '0 6px 0 #5B3FD9' }}>
            <h2 className="text-3xl md:text-4xl font-black text-outline">Your first streak starts today.</h2>
            <p className="text-lg font-bold text-white/85 mt-3">Three questions, five minutes, your first 150 XP.</p>
            <Link to="/register" className="btn-white !py-4 !px-8 !text-base mt-8">
              <Play className="w-5 h-5" fill="currentColor" /> Start playing
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t-2 border-game-line py-6 text-center text-sm font-bold text-game-muted">
        © 2026 Smart Interview Assistant
      </footer>
    </div>
  );
}
