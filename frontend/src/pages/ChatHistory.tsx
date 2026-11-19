import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import PageHeader from '../components/PageHeader';
import { IconTile } from '../components/Game';
import { MODES, InterviewType, formatShortDate, modeOf, scoreTone, type GameColor } from '../lib/interviewUi';
import { AlertCircle, Bot, ChevronDown, FileText, History, Layers, Play, RefreshCw, Search, Star, User } from 'lucide-react';

interface HistoryQuestion { id: number; question: string; answer: string | null; evaluation: string | null; score: number | null }
interface HistoryItem {
  interviewId: number;
  topic: string;
  type?: string;
  company?: string | null;
  difficulty?: string;
  score: number | null;
  date: string;
  questions: HistoryQuestion[];
}

type Filter = 'all' | InterviewType;

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'All' },
  ...(Object.entries(MODES) as [InterviewType, (typeof MODES)[InterviewType]][]).map(([value, m]) => ({ value, label: m.label })),
];

const ScorePill = ({ score, big = false }: { score: number | null; big?: boolean }) => {
  if (score === null) {
    return <span className="text-xs font-black px-2.5 py-1 rounded-xl bg-[#ECECF4] text-game-muted whitespace-nowrap">Not scored</span>;
  }
  const t = scoreTone(score);
  return big ? (
    <span className="text-base font-black text-white px-3 py-1 rounded-2xl whitespace-nowrap" style={{ background: t.hex, boxShadow: `0 3px 0 ${t.edge}` }}>
      {score}/10
    </span>
  ) : (
    <span className="text-xs font-black px-2.5 py-1 rounded-xl whitespace-nowrap" style={{ background: t.soft, color: t.textHex }}>{score}/10</span>
  );
};

const Skeleton = () => (
  <div className="space-y-4 animate-pulse">
    <div className="grid grid-cols-3 gap-4">{[0, 1, 2].map((i) => <div key={i} className="h-24 bg-[#E9E9F3] rounded-3xl" />)}</div>
    {[0, 1, 2, 3].map((i) => <div key={i} className="h-20 bg-[#E9E9F3] rounded-3xl" />)}
  </div>
);

export default function ChatHistory() {
  const navigate = useNavigate();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState<number | null>(null);
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');

  const fetchHistory = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/ai/chat-history', { params: { limit: 50 } });
      const payload = res.data.data;
      setHistory(Array.isArray(payload) ? payload : payload?.interviews ?? []);
    } catch (e: any) {
      setError(
        e.response?.status === 429
          ? 'Too many requests right now. Wait a minute and try again.'
          : 'We could not load your interview history.',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHistory(); }, []);

  const stats = useMemo(() => {
    const scored = history.filter((h) => h.score != null);
    return {
      total: history.length,
      avg: scored.length ? (scored.reduce((a, h) => a + (h.score as number), 0) / scored.length).toFixed(1) : null,
      topics: new Set(history.map((h) => h.topic)).size,
    };
  }, [history]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return history.filter(
      (h) => (filter === 'all' || (h.type || 'general') === filter) && (!q || h.topic.toLowerCase().includes(q)),
    );
  }, [history, filter, query]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: history.length };
    for (const h of history) c[h.type || 'general'] = (c[h.type || 'general'] || 0) + 1;
    return c;
  }, [history]);

  const summary: { label: string; value: React.ReactNode; icon: React.ElementType; color: GameColor }[] = [
    { label: 'Sessions', value: stats.total, icon: History, color: 'blue' },
    { label: 'Avg score', value: stats.avg ? `${stats.avg}` : '—', icon: Star, color: 'yellow' },
    { label: 'Topics', value: stats.topics, icon: Layers, color: 'purple' },
  ];

  return (
    <div className="min-h-full p-4 sm:p-6 md:p-8 max-w-5xl mx-auto">
      <PageHeader
        icon={History}
        color="yellow"
        title="Interview history"
        subtitle="Replay past battles: your answers and the AI's feedback."
        actions={
          <button onClick={fetchHistory} disabled={loading} className="btn-white !py-2.5 !text-[#A67C00]">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        }
      />

      {loading ? (
        <Skeleton />
      ) : error ? (
        <div className="card text-center !p-10 animate-scale-in">
          <div className="inline-flex"><IconTile icon={AlertCircle} color="red" size="lg" /></div>
          <p className="text-lg font-black text-game-ink mt-4">{error}</p>
          <button onClick={fetchHistory} className="btn-primary mt-6">
            <RefreshCw className="w-4 h-4" /> Try again
          </button>
        </div>
      ) : history.length === 0 ? (
        <div className="card text-center !p-12 animate-scale-in">
          <div className="inline-flex animate-floaty"><IconTile icon={History} color="yellow" size="xl" /></div>
          <h3 className="text-2xl font-black text-game-ink mt-5">No battles yet</h3>
          <p className="text-sm font-bold text-game-muted max-w-xs mx-auto mt-1">
            Finish your first mock interview and it will show up here with a full breakdown.
          </p>
          <button onClick={() => navigate('/interview')} className="btn-green mt-6">
            <Play className="w-5 h-5" fill="currentColor" /> Start an interview
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6 animate-slide-up">
            {summary.map(({ label, value, icon, color }) => (
              <div key={label} className="card-sm flex items-center gap-3">
                <IconTile icon={icon} color={color} size="md" className="hidden sm:flex" />
                <div className="min-w-0">
                  <p className="text-2xl font-black text-game-ink leading-none">{value}</p>
                  <p className="text-xs font-extrabold text-game-muted mt-1">{label}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col md:flex-row md:items-center gap-3 mb-5 animate-slide-up" style={{ animationDelay: '60ms' }}>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {FILTERS.map((f) => (
                <button key={f.value} onClick={() => setFilter(f.value)} className={`chip whitespace-nowrap !text-sm !px-3.5 ${filter === f.value ? 'selected' : ''}`}>
                  {f.label}
                  <span className={`rounded-full px-1.5 text-[11px] ${filter === f.value ? 'bg-white/25' : 'bg-game-bg'}`}>{counts[f.value] ?? 0}</span>
                </button>
              ))}
            </div>
            <div className="relative md:ml-auto md:w-64">
              <Search className="w-5 h-5 text-game-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search topics" className="input-field !pl-11 !py-2.5" />
            </div>
          </div>

          {visible.length === 0 ? (
            <div className="card text-center !p-10 text-sm font-bold text-game-muted">No sessions match these filters.</div>
          ) : (
            <div className="space-y-4">
              {visible.map((interview, i) => {
                const m = modeOf(interview.type);
                const open = expanded === interview.interviewId;
                return (
                  <div
                    key={interview.interviewId}
                    className="bg-white border-2 rounded-3xl overflow-hidden animate-slide-up transition-colors"
                    style={{
                      animationDelay: `${Math.min(i, 8) * 30}ms`,
                      borderColor: open ? '#CFC4FF' : '#E5E5F0',
                      boxShadow: `0 4px 0 ${open ? '#CFC4FF' : '#E5E5F0'}`,
                    }}
                  >
                    <button
                      onClick={() => setExpanded(open ? null : interview.interviewId)}
                      className="w-full flex items-center gap-3 sm:gap-4 p-4 sm:p-5 text-left hover:bg-game-bg/60 transition-colors"
                    >
                      <IconTile icon={m.icon} color={m.color} size="md" />
                      <div className="flex-1 min-w-0">
                        <p className="text-base font-black text-game-ink truncate">{interview.topic}</p>
                        <p className="text-xs font-bold text-game-muted mt-0.5">
                          {m.label} · {formatShortDate(interview.date)} · {interview.questions?.length ?? 0} questions
                          {interview.difficulty && <span className="capitalize"> · {interview.difficulty}</span>}
                        </p>
                      </div>
                      <ScorePill score={interview.score ?? null} big />
                      <ChevronDown className={`w-5 h-5 text-game-muted transition-transform flex-shrink-0 ${open ? 'rotate-180' : ''}`} strokeWidth={2.8} />
                    </button>

                    {open && (
                      <div className="border-t-2 border-game-line bg-game-bg p-4 sm:p-5 space-y-3 animate-fade-in">
                        <div className="flex items-center justify-between">
                          <p className="eyebrow text-game-muted">Question breakdown</p>
                          <button onClick={() => navigate(`/reports/${interview.interviewId}`)} className="btn-primary !py-2 !px-3 !text-xs">
                            <FileText className="w-4 h-4" /> Full report
                          </button>
                        </div>
                        {interview.questions?.map((q, idx) => (
                          <div key={q.id || idx} className="bg-white rounded-2xl border-2 border-game-line p-4">
                            <div className="flex items-start gap-3">
                              <span className="w-8 h-8 rounded-xl bg-game-purple text-white text-sm font-black flex items-center justify-center flex-shrink-0" style={{ boxShadow: '0 2px 0 #5B3FD9' }}>
                                {idx + 1}
                              </span>
                              <p className="flex-1 text-sm font-black text-game-ink leading-snug pt-1">{q.question}</p>
                              <ScorePill score={q.score} />
                            </div>
                            <div className="grid md:grid-cols-2 gap-3 mt-3 md:pl-11">
                              <div className="rounded-xl bg-game-blue-soft border-2 border-[#BDE8FC] p-3">
                                <p className="flex items-center gap-1 text-[11px] font-black text-game-blue-edge uppercase tracking-wide mb-1">
                                  <User className="w-3.5 h-3.5" strokeWidth={2.8} /> Your answer
                                </p>
                                <p className="text-sm font-semibold text-game-ink leading-relaxed whitespace-pre-wrap">
                                  {q.answer || <span className="italic text-game-muted">Not answered</span>}
                                </p>
                              </div>
                              <div className="rounded-xl bg-game-green-soft border-2 border-[#C8EFA9] p-3">
                                <p className="flex items-center gap-1 text-[11px] font-black text-game-green-edge uppercase tracking-wide mb-1">
                                  <Bot className="w-3.5 h-3.5" strokeWidth={2.8} /> AI feedback
                                </p>
                                <p className="text-sm font-semibold text-game-ink leading-relaxed whitespace-pre-wrap">
                                  {q.evaluation || <span className="italic text-game-muted">No feedback yet</span>}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
