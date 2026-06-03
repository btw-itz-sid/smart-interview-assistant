import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import {
  ChevronDown,
  RefreshCw,
  History,
  Calendar,
  Star,
  MessageSquare,
  BookOpen,
  Presentation,
  FileText,
} from 'lucide-react';

function ScoreBadge({ score }: { score: number | null }) {
  if (score === null) return <span className="badge badge-indigo">N/A</span>;
  if (score >= 7)    return <span className="badge badge-green">{score}/10</span>;
  if (score >= 4)    return <span className="badge" style={{ background: '#fef3c7', color: '#92400e' }}>{score}/10</span>;
  return <span className="badge badge-red">{score}/10</span>;
}

export default function ChatHistory() {
  const navigate = useNavigate();
  const [history, setHistory]   = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);

  useEffect(() => { fetchHistory(); }, []);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await api.get('/ai/chat-history');
      const payload = res.data.data;
      setHistory(Array.isArray(payload) ? payload : payload?.interviews ?? []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const toggle = (id: number) => setExpanded(expanded === id ? null : id);

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-3 p-10">
        <RefreshCw className="w-6 h-6 text-indigo-400 animate-spin" />
        <p className="text-sm text-slate-400">Loading your interview history…</p>
      </div>
    );
  }

  return (
    <div className="min-h-full p-6 md:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-7 animate-fade-in">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <History className="w-4 h-4 text-indigo-500" />
            <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Interview History
            </h1>
          </div>
          <p className="text-slate-500 text-sm">Review your past sessions and AI feedback.</p>
        </div>
        <button
          onClick={fetchHistory}
          className="btn-ghost text-sm self-start sm:self-auto"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Summary strip */}
      {history.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-6 animate-slide-up">
          {[
            { label: 'Total Sessions', value: history.length,         icon: Presentation },
            { label: 'Avg. Score',     value: (() => {
                const scored = history.filter(h => h.score != null);
                if (!scored.length) return 'N/A';
                return `${(scored.reduce((a, h) => a + h.score, 0) / scored.length).toFixed(1)}/10`;
              })(), icon: Star },
            { label: 'Topics Covered', value: new Set(history.map(h => h.topic)).size, icon: BookOpen },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 text-center">
              <Icon className="w-4 h-4 text-indigo-400 mx-auto mb-1.5" />
              <p className="text-xl font-bold text-slate-800" style={{ fontFamily: 'Outfit, sans-serif' }}>{value}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {history.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-12 text-center animate-scale-in">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto mb-4">
            <History className="w-7 h-7 text-indigo-300" />
          </div>
          <h3 className="text-base font-semibold text-slate-700 mb-1">No interviews yet</h3>
          <p className="text-sm text-slate-400 max-w-xs mx-auto">
            Complete your first mock interview to start building your history.
          </p>
        </div>
      ) : (
        <div className="space-y-3 animate-slide-up" style={{ animationDelay: '200ms' }}>
          {history.map((interview) => (
            <div
              key={interview.interviewId}
              className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden transition-shadow hover:shadow-md"
            >
              {/* Collapsed header */}
              <div
                onClick={() => toggle(interview.interviewId)}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 cursor-pointer select-none"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-4 h-4 text-indigo-500" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-800 leading-tight">{interview.topic}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="flex items-center gap-1 text-xs text-slate-400">
                        <Calendar className="w-3 h-3" />
                        {new Date(interview.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                      <span className="text-xs text-slate-300">•</span>
                      <span className="text-xs text-slate-400">{interview.questions?.length ?? 0} questions</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 ml-auto">
                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      navigate(`/reports/${interview.interviewId}`);
                    }}
                    className="btn-ghost px-3 py-2 text-xs"
                    title="Open printable interview report"
                  >
                    <FileText className="w-4 h-4" />
                    Report
                  </button>
                  <ScoreBadge score={interview.score ?? null} />
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-slate-50 transition-transform duration-200 ${expanded === interview.interviewId ? 'rotate-180' : ''}`}>
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              </div>

              {/* Expanded Q&A */}
              {expanded === interview.interviewId && (
                <div className="border-t border-slate-100 px-5 py-5 bg-slate-50/50 space-y-5 animate-fade-in">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Question Breakdown</p>
                  {interview.questions?.map((q: any, idx: number) => (
                    <div key={q.id || idx} className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
                      {/* Question */}
                      <div className="flex items-start gap-3 mb-3">
                        <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <p className="text-sm font-semibold text-slate-800 leading-snug">{q.question}</p>
                      </div>

                      {/* Your answer */}
                      {q.answer ? (
                        <div className="ml-8 bg-indigo-50/60 border border-indigo-100 rounded-lg p-3 mb-3">
                          <p className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wide mb-1">Your Answer</p>
                          <p className="text-xs text-slate-600 leading-relaxed">{q.answer}</p>
                        </div>
                      ) : (
                        <div className="ml-8 mb-3">
                          <p className="text-xs text-slate-400 italic">Not answered.</p>
                        </div>
                      )}

                      {/* AI Evaluation */}
                      {q.evaluation && (
                        <div className="ml-8 bg-emerald-50/60 border border-emerald-100 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-1.5">
                            <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wide">AI Evaluation</p>
                            {q.score != null && (
                              <ScoreBadge score={q.score} />
                            )}
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">{q.evaluation}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
