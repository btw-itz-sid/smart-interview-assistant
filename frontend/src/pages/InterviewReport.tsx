import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar, Check, FileText, Loader2, MessageSquare, Printer, Star, Target, Flag, Bot, User } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { IconTile, ScoreRing } from '../components/Game';
import { scoreTone, type GameColor } from '../lib/interviewUi';

type ReportQuestion = {
  id: number;
  question: string;
  answer: string | null;
  evaluation: string | null;
  score: number | null;
};

type ReportData = {
  interviewId: number;
  topic: string;
  score: number | null;
  feedback: string | null;
  date: string;
  questions: ReportQuestion[];
};

const scoreLabel = (score: number | null) => {
  if (score === null) return 'Not scored';
  if (score >= 8) return 'Interview ready';
  if (score >= 6) return 'Strong foundation';
  if (score >= 4) return 'Needs practice';
  return 'Needs fundamentals';
};

export default function InterviewReport() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReport = async () => {
      if (!id) return;

      setLoading(true);
      setError('');

      try {
        const res = await api.get(`/ai/interview/${id}`);
        setReport(res.data.data);
      } catch (err) {
        console.error(err);
        setError('Unable to load this interview report.');
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [id]);

  const metrics = useMemo(() => {
    const questions = report?.questions ?? [];
    const answered = questions.filter((q) => q.answer).length;
    const scored = questions.filter((q) => q.score !== null);
    const bestScore = scored.length ? Math.max(...scored.map((q) => q.score ?? 0)) : null;
    const weakCount = scored.filter((q) => (q.score ?? 0) < 6).length;

    return { answered, total: questions.length, bestScore, weakCount };
  }, [report]);

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-3 p-10">
        <Loader2 className="w-8 h-8 text-game-purple animate-spin" />
        <p className="text-sm font-bold text-game-muted">Preparing interview report…</p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-full p-6 md:p-8 max-w-3xl mx-auto">
        <button onClick={() => navigate('/history')} className="btn-ghost mb-5">
          <ArrowLeft className="w-5 h-5" /> Back
        </button>
        <div className="card text-center !p-10">
          <div className="inline-flex"><IconTile icon={FileText} color="red" size="lg" /></div>
          <h1 className="text-xl font-black text-game-ink mt-4">Report unavailable</h1>
          <p className="text-sm font-bold text-game-muted mt-1">{error || 'This report could not be found.'}</p>
        </div>
      </div>
    );
  }

  const overall = scoreTone(report.score ?? 0);
  const stats: { icon: React.ElementType; color: GameColor; value: React.ReactNode; label: string }[] = [
    { icon: Target,       color: 'blue',   value: metrics.total,              label: 'Questions' },
    { icon: Check,        color: 'green',  value: metrics.answered,           label: 'Answered' },
    { icon: Star,         color: 'yellow', value: metrics.bestScore ?? 'N/A', label: 'Best score' },
    { icon: Flag,         color: 'red',    value: metrics.weakCount,          label: 'To review' },
  ];

  return (
    <div className="min-h-full">
      <div className="print:hidden sticky top-0 z-20 bg-white border-b-2 border-game-line">
        <div className="max-w-5xl mx-auto px-4 sm:px-5 py-3 flex items-center justify-between gap-3">
          <button onClick={() => navigate('/history')} className="btn-ghost !py-2.5">
            <ArrowLeft className="w-5 h-5" /> History
          </button>
          <button onClick={() => window.print()} className="btn-primary !py-2.5">
            <Printer className="w-5 h-5" /> Save as PDF
          </button>
        </div>
      </div>

      <main className="interview-report max-w-5xl mx-auto px-4 sm:px-5 py-8 md:py-10">
        <section className="card mb-6 !p-6 md:!p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="min-w-0">
              <p className="eyebrow text-game-purple flex items-center gap-1.5">
                <FileText className="w-4 h-4" strokeWidth={2.6} /> Interview report
              </p>
              <h1 className="text-3xl md:text-4xl font-black text-game-ink leading-tight mt-2">{report.topic}</h1>
              <div className="flex flex-wrap items-center gap-2 mt-4">
                <span className="chip !cursor-default">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(report.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
                <span className="chip !cursor-default">
                  <MessageSquare className="w-3.5 h-3.5" /> {metrics.total} questions
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 md:flex-col md:gap-2 md:text-center">
              <ScoreRing value={report.score ?? 0} max={10} size={120} stroke={13} color={report.score === null ? '#D5D5E3' : overall.hex}>
                <span className="text-4xl font-black text-game-ink leading-none">{report.score ?? '–'}</span>
                <span className="text-xs font-extrabold text-game-muted">out of 10</span>
              </ScoreRing>
              <span
                className="inline-flex px-3 py-1 rounded-full text-sm font-black"
                style={report.score === null ? { background: '#ECECF4', color: '#7A7A95' } : { background: overall.soft, color: overall.textHex }}
              >
                {scoreLabel(report.score)}
              </span>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {stats.map((s) => (
            <div key={s.label} className="card-sm flex items-center gap-3">
              <IconTile icon={s.icon} color={s.color} size="md" />
              <div>
                <p className="text-2xl font-black text-game-ink leading-none">{s.value}</p>
                <p className="text-xs font-extrabold text-game-muted mt-1">{s.label}</p>
              </div>
            </div>
          ))}
        </section>

        {report.feedback && (
          <section className="rounded-3xl border-2 border-[#D9D0FF] bg-game-purple-soft p-5 mb-6">
            <p className="eyebrow text-game-purple mb-1.5">Session summary</p>
            <p className="text-[15px] font-bold text-game-ink leading-relaxed">{report.feedback}</p>
          </section>
        )}

        <section className="space-y-5">
          {report.questions.map((q, index) => {
            const tone = q.score === null ? null : scoreTone(q.score);
            return (
              <article key={q.id} className="card break-inside-avoid">
                <div className="flex items-start justify-between gap-3 mb-5">
                  <div className="flex items-start gap-3 min-w-0">
                    <span
                      className="w-10 h-10 rounded-2xl bg-game-purple text-white text-base font-black flex items-center justify-center flex-shrink-0"
                      style={{ boxShadow: '0 3px 0 #5B3FD9' }}
                    >
                      {index + 1}
                    </span>
                    <h2 className="text-base md:text-lg font-black text-game-ink leading-snug pt-1.5">{q.question}</h2>
                  </div>
                  <span
                    className="text-base font-black px-3 py-1 rounded-2xl flex-shrink-0"
                    style={tone ? { background: tone.hex, color: '#fff', boxShadow: `0 3px 0 ${tone.edge}` } : { background: '#ECECF4', color: '#7A7A95' }}
                  >
                    {q.score === null ? 'N/A' : `${q.score}/10`}
                  </span>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="rounded-2xl border-2 border-[#BDE8FC] bg-game-blue-soft p-4">
                    <p className="flex items-center gap-1.5 eyebrow text-game-blue-edge mb-2">
                      <User className="w-4 h-4" strokeWidth={2.6} /> Your answer
                    </p>
                    <p className="text-sm font-semibold text-game-ink leading-relaxed whitespace-pre-wrap">{q.answer || 'Not answered.'}</p>
                  </div>
                  <div
                    className="rounded-2xl border-2 p-4"
                    style={tone ? { background: tone.soft, borderColor: tone.hex + '66' } : { background: '#F7F7FC', borderColor: '#E5E5F0' }}
                  >
                    <p className="flex items-center gap-1.5 eyebrow mb-2" style={{ color: tone?.textHex ?? '#7A7A95' }}>
                      <Bot className="w-4 h-4" strokeWidth={2.6} /> AI feedback
                    </p>
                    <p className="text-sm font-semibold text-game-ink leading-relaxed whitespace-pre-wrap">{q.evaluation || 'No evaluation yet.'}</p>
                  </div>
                </div>
              </article>
            );
          })}
        </section>

        <footer className="mt-8 text-center text-xs font-bold text-game-muted">
          Generated for {user?.name || 'candidate'} by Smart Interview Assistant.
        </footer>
      </main>
    </div>
  );
}
