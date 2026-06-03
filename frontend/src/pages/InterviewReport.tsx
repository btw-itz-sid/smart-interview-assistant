import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  FileText,
  Loader2,
  MessageSquare,
  Printer,
  Star,
  Target,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

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

const scoreClass = (score: number | null) => {
  if (score === null) return 'bg-slate-100 text-slate-600 border-slate-200';
  if (score >= 7) return 'bg-emerald-50 text-emerald-700 border-emerald-100';
  if (score >= 4) return 'bg-amber-50 text-amber-700 border-amber-100';
  return 'bg-red-50 text-red-700 border-red-100';
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
        <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
        <p className="text-sm text-slate-400">Preparing interview report...</p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-full p-6 md:p-8 max-w-3xl mx-auto">
        <button onClick={() => navigate('/history')} className="btn-ghost mb-5">
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <div className="bg-white border border-red-100 rounded-2xl p-8 text-center shadow-sm">
          <FileText className="w-8 h-8 text-red-300 mx-auto mb-3" />
          <h1 className="text-lg font-semibold text-slate-900">Report unavailable</h1>
          <p className="text-sm text-slate-500 mt-1">{error || 'This report could not be found.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-slate-50">
      <div className="print:hidden sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-5 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <button onClick={() => navigate('/history')} className="btn-ghost">
            <ArrowLeft className="w-4 h-4" />
            History
          </button>
          <div className="flex items-center gap-2">
            <button onClick={() => window.print()} className="btn-primary">
              <Printer className="w-4 h-4" />
              Save as PDF
            </button>
          </div>
        </div>
      </div>

      <main className="interview-report max-w-5xl mx-auto px-5 py-8 md:py-10">
        <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 md:p-8 mb-5">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-indigo-600 mb-3">
                <FileText className="w-5 h-5" />
                <p className="text-xs font-bold uppercase tracking-[0.18em]">Interview Report</p>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-950 leading-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
                {report.topic}
              </h1>
              <div className="flex flex-wrap items-center gap-3 mt-4 text-sm text-slate-500">
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  {new Date(report.date).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4" />
                  {metrics.total} questions
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  {metrics.answered} answered
                </span>
              </div>
            </div>

            <div className="w-full md:w-[190px] rounded-2xl border border-slate-200 bg-slate-50 p-5 text-center">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-[0.16em]">Overall Score</p>
              <p className="text-5xl font-bold text-slate-950 mt-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
                {report.score ?? 'N/A'}
              </p>
              <p className="text-sm text-slate-500 mt-1">{report.score === null ? '' : '/10'}</p>
              <span className={`inline-flex mt-4 px-2.5 py-1 rounded-lg border text-xs font-semibold ${scoreClass(report.score)}`}>
                {scoreLabel(report.score)}
              </span>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <Target className="w-4 h-4 text-indigo-500 mb-2" />
            <p className="text-2xl font-bold text-slate-900">{metrics.total}</p>
            <p className="text-xs text-slate-500">Total Questions</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 mb-2" />
            <p className="text-2xl font-bold text-slate-900">{metrics.answered}</p>
            <p className="text-xs text-slate-500">Answered</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <Star className="w-4 h-4 text-amber-500 mb-2" />
            <p className="text-2xl font-bold text-slate-900">{metrics.bestScore ?? 'N/A'}</p>
            <p className="text-xs text-slate-500">Best Question Score</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <FileText className="w-4 h-4 text-slate-500 mb-2" />
            <p className="text-2xl font-bold text-slate-900">{metrics.weakCount}</p>
            <p className="text-xs text-slate-500">Review Areas</p>
          </div>
        </section>

        {report.feedback && (
          <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 mb-5">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.16em] mb-2">Session Summary</p>
            <p className="text-sm text-slate-700 leading-relaxed">{report.feedback}</p>
          </section>
        )}

        <section className="space-y-4">
          {report.questions.map((q, index) => (
            <article key={q.id} className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 break-inside-avoid">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
                <div className="flex items-start gap-3">
                  <span className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                    {index + 1}
                  </span>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.14em] mb-1">Question</p>
                    <h2 className="text-base font-semibold text-slate-900 leading-snug">{q.question}</h2>
                  </div>
                </div>
                <span className={`self-start inline-flex px-2.5 py-1 rounded-lg border text-xs font-semibold ${scoreClass(q.score)}`}>
                  {q.score === null ? 'N/A' : `${q.score}/10`}
                </span>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-4">
                  <p className="text-xs font-bold text-indigo-500 uppercase tracking-[0.14em] mb-2">Candidate Answer</p>
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {q.answer || 'Not answered.'}
                  </p>
                </div>

                <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4">
                  <p className="text-xs font-bold text-emerald-600 uppercase tracking-[0.14em] mb-2">AI Evaluation</p>
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {q.evaluation || 'No evaluation yet.'}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </section>

        <footer className="mt-8 text-center text-xs text-slate-400">
          Generated for {user?.name || 'candidate'} by Smart Interview Assistant.
        </footer>
      </main>
    </div>
  );
}
