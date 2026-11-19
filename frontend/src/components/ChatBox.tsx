import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Lightbulb, Timer, Loader2, Mic, FileText, Check, Trophy, Gem, RotateCcw, Home, Info } from 'lucide-react';
import { IconTile, GameBar, ScoreRing } from './Game';
import { PALETTE, scoreTone } from '../lib/interviewUi';
import { getCachedGameStats, refreshGameStats } from '../lib/useGameStats';

interface Question { id: number; question: string; }
interface Message  { role: 'ai' | 'user' | 'system' | 'hint'; content: string; metadata?: any; }

// Countdown Timer Hook
function useTimer(seconds: number, onExpire: () => void, active: boolean) {
  const [timeLeft, setTimeLeft] = useState(seconds);
  const callbackRef = useRef(onExpire);
  callbackRef.current = onExpire;

  useEffect(() => {
    setTimeLeft(seconds);
  }, [seconds, active]);

  useEffect(() => {
    if (!active || timeLeft <= 0) return;
    const id = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(id);
          callbackRef.current();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [active, timeLeft > 0]);

  return timeLeft;
}

const praise = (score: number) =>
  score >= 8 ? 'Excellent!' : score >= 7 ? 'Great answer!' : score >= 5 ? 'Nice try!' : 'Keep going!';

export default function ChatBox({
  interviewId, topic, questions, onEnd, timerEnabled = false, timerSeconds = 180,
}: {
  interviewId: number; topic: string; questions: Question[]; onEnd: () => void;
  timerEnabled?: boolean; timerSeconds?: number;
}) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [input, setInput]           = useState('');
  const [messages, setMessages]     = useState<Message[]>([]);
  const [evaluating, setEvaluating] = useState(false);
  const [hintLoading, setHintLoading] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [timerActive, setTimerActive] = useState(timerEnabled);
  const [complete, setComplete] = useState(false);
  const [listening, setListening] = useState(false);
  const [xpEarned, setXpEarned] = useState<number | null>(null);
  const startXP = useRef(getCachedGameStats()?.totalXP ?? null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const navigate = useNavigate();

  // Auto-submit when timer expires
  const handleTimerExpire = useCallback(() => {
    if (input.trim()) {
      handleSubmitAnswer(input.trim());
    } else {
      setMessages(prev => [...prev, {
        role: 'system',
        content: 'Time expired. No answer was submitted, moving to the next question.',
        metadata: { score: 0 },
      }]);
      if (currentIdx + 1 < questions.length) {
        setTimeout(() => {
          setMessages(prev => [...prev, { role: 'ai', content: questions[currentIdx + 1].question }]);
          setCurrentIdx(prev => prev + 1);
          setTimerActive(true);
        }, 1000);
      } else {
        setComplete(true);
      }
    }
  }, [input, currentIdx, questions]);

  const timeLeft = useTimer(timerSeconds, handleTimerExpire, timerActive && !evaluating);

  useEffect(() => {
    if (questions.length > 0) {
      setMessages([
        { role: 'system', content: `Interview started on ${topic}.${timerEnabled ? ` ${timerSeconds}s per question.` : ''} Good luck!` },
        { role: 'ai', content: questions[0].question },
      ]);
      setTimerActive(timerEnabled);
    }
  }, [questions, topic]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, evaluating, complete]);

  // Once finished, read the new XP total so the summary shows what this session earned
  useEffect(() => {
    if (!complete) return;
    refreshGameStats().then((d) => {
      if (d && startXP.current !== null) setXpEarned(Math.max(0, d.totalXP - startXP.current));
    });
  }, [complete]);

  // Request a hint from AI
  const requestHint = async () => {
    if (hintLoading) return;
    setHintLoading(true);
    try {
      const res = await api.post('/ai/hint', {
        question: questions[currentIdx].question,
        partialAnswer: input,
        topic,
        interviewId,
        questionId: questions[currentIdx].id,
      });
      const hint = res.data.data.hint;
      setMessages(prev => [...prev, { role: 'hint', content: hint }]);
      setHintsUsed(prev => prev + 1);
    } catch {
      setMessages(prev => [...prev, { role: 'hint', content: 'Think about the core trade-offs and real-world constraints involved.' }]);
    } finally {
      setHintLoading(false);
    }
  };

  const handleSubmitAnswer = async (answerText: string) => {
    const q = questions[currentIdx];
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: answerText }]);
    setEvaluating(true);
    setTimerActive(false);

    try {
      const res = await api.post('/ai/evaluate-answer', {
        interviewId, questionId: q.id, question: q.question, answer: answerText, topic,
      });
      const ev = res.data.data;

      setMessages(prev => [...prev, {
        role: 'system',
        content: ev.evaluation,
        metadata: { score: ev.score },
      }]);

      if (currentIdx + 1 < questions.length) {
        refreshGameStats();
        setTimeout(() => {
          setMessages(prev => [...prev, { role: 'ai', content: questions[currentIdx + 1].question }]);
          setCurrentIdx(prev => prev + 1);
          setTimerActive(timerEnabled);
        }, 1200);
      } else {
        setComplete(true);
      }
    } catch {
      setMessages(prev => [...prev, { role: 'system', content: 'Network error while evaluating. Please try again.' }]);
    } finally {
      setEvaluating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || evaluating) return;
    await handleSubmitAnswer(input.trim());
  };

  const startVoice = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setMessages(prev => [...prev, {
        role: 'system',
        content: 'Voice input is not supported in this browser. Try Chrome or Edge.',
      }]);
      return;
    }

    if (listening && recognitionRef.current) {
      recognitionRef.current.stop();
      setListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.onresult = (event: any) => {
      const transcript = event.results?.[0]?.[0]?.transcript;
      if (transcript) {
        setInput(prev => (prev ? `${prev} ${transcript}` : transcript));
      }
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    setListening(true);
    recognition.start();
  };

  const isComplete = complete;
  const answeredCount = messages.filter((m) => m.metadata?.score !== undefined).length;
  const progress = Math.round((answeredCount / questions.length) * 100);
  const scores = messages.filter((m) => m.metadata?.score !== undefined).map((m) => m.metadata.score as number);
  const avg = scores.length ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10 : 0;

  const timerColor = timeLeft <= 10 ? PALETTE.red : timeLeft <= 30 ? PALETTE.orange : PALETTE.green;

  return (
    <div className="flex flex-col h-full bg-game-bg">
      {/* Header: lesson-style progress */}
      <header className="bg-white border-b-2 border-game-line px-3 sm:px-6 py-3">
        <div className="max-w-3xl mx-auto flex items-center gap-3 sm:gap-4">
          <button
            onClick={onEnd}
            className="p-2 rounded-xl text-[#B0B0C8] hover:text-game-ink hover:bg-game-bg transition-colors"
            title="End session"
            aria-label="End session"
          >
            <X className="w-6 h-6" strokeWidth={3} />
          </button>
          <GameBar value={progress} color="green" height={18} className="flex-1" />
          <span className="text-sm font-black text-game-muted whitespace-nowrap">
            {Math.min(answeredCount + (isComplete ? 0 : 1), questions.length)}/{questions.length}
          </span>
          {timerEnabled && timerActive && !isComplete && (
            <span
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-sm font-black ${timeLeft <= 10 ? 'animate-pulse' : ''}`}
              style={{ background: timerColor.soft, color: timerColor.text }}
            >
              <Timer className="w-4 h-4" strokeWidth={2.8} />
              {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </span>
          )}
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto w-full px-4 py-6 space-y-5">
          <p className="text-center text-xs font-black uppercase tracking-widest text-game-muted">{topic}</p>

          <AnimatePresence>
            {messages.map((msg, i) => {
              const isEval = msg.role === 'system' && msg.metadata?.score !== undefined;

              if (isEval) {
                const tone = scoreTone(msg.metadata.score);
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 16, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="rounded-3xl border-2 p-5"
                    style={{ background: tone.soft, borderColor: tone.hex, boxShadow: `0 4px 0 ${tone.hex}` }}
                  >
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-white" style={{ background: tone.hex }}>
                          <Check className="w-5 h-5" strokeWidth={3.5} />
                        </div>
                        <p className="text-xl font-black" style={{ color: tone.textHex }}>{praise(msg.metadata.score)}</p>
                      </div>
                      <span
                        className="text-lg font-black text-white px-3 py-1 rounded-2xl"
                        style={{ background: tone.hex, boxShadow: `0 3px 0 ${tone.edge}` }}
                      >
                        {msg.metadata.score}/10
                      </span>
                    </div>
                    <p className="text-[15px] font-semibold leading-relaxed whitespace-pre-wrap" style={{ color: tone.textHex }}>
                      {msg.content}
                    </p>
                  </motion.div>
                );
              }

              if (msg.role === 'system') {
                return (
                  <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white border-2 border-game-line px-4 py-1.5 text-xs font-extrabold text-game-muted text-center">
                      <Info className="w-3.5 h-3.5 flex-shrink-0" />
                      {msg.content}
                    </span>
                  </motion.div>
                );
              }

              if (msg.role === 'user') {
                return (
                  <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex justify-end">
                    <div
                      className="max-w-[85%] rounded-3xl rounded-br-lg bg-game-blue text-white px-5 py-3.5 text-[15px] font-semibold leading-relaxed whitespace-pre-wrap"
                      style={{ boxShadow: '0 4px 0 #1593CF' }}
                    >
                      {msg.content}
                    </div>
                  </motion.div>
                );
              }

              const hint = msg.role === 'hint';
              return (
                <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex items-end gap-3">
                  <IconTile icon={hint ? Lightbulb : Bot} color={hint ? 'yellow' : 'purple'} size="md" />
                  <div className="max-w-[85%]">
                    <p className={`text-xs font-black uppercase tracking-wider mb-1.5 ${hint ? 'text-[#B38600]' : 'text-game-purple'}`}>
                      {hint ? 'Coach hint' : `Question ${messages.slice(0, i + 1).filter((m) => m.role === 'ai').length}`}
                    </p>
                    <div
                      className={`rounded-3xl rounded-bl-lg border-2 px-5 py-4 whitespace-pre-wrap leading-relaxed ${
                        hint ? 'bg-game-yellow-soft border-[#FFE58A] text-[#7A5C00] text-[15px] font-semibold' : 'bg-white border-game-line text-game-ink text-base font-bold'
                      }`}
                      style={{ boxShadow: hint ? '0 4px 0 #FFE58A' : '0 4px 0 #E5E5F0' }}
                    >
                      {msg.content}
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {evaluating && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-end gap-3">
                <IconTile icon={Bot} color="purple" size="md" />
                <div className="flex items-center gap-1.5 rounded-3xl rounded-bl-lg bg-white border-2 border-game-line px-5 py-4" style={{ boxShadow: '0 4px 0 #E5E5F0' }}>
                  {[0, 150, 300].map((d) => (
                    <span key={d} className="w-2.5 h-2.5 rounded-full bg-game-purple animate-bounce" style={{ animationDelay: `${d}ms` }} />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Completion celebration */}
          {isComplete && !evaluating && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, type: 'spring' }}
              className="card text-center !p-7 sm:!p-9"
            >
              <div className="inline-flex animate-floaty">
                <IconTile icon={Trophy} color="yellow" size="xl" />
              </div>
              <h2 className="text-3xl font-black text-game-ink mt-5">Interview complete!</h2>
              <p className="text-base font-bold text-game-muted mt-1">{topic}</p>

              <div className="grid grid-cols-3 gap-3 mt-7 max-w-md mx-auto">
                <div className="rounded-2xl border-2 border-game-line p-3 flex flex-col items-center">
                  <ScoreRing value={avg} max={10} size={64} stroke={8} color={scoreTone(avg).hex}>
                    <span className="text-base font-black text-game-ink">{avg}</span>
                  </ScoreRing>
                  <p className="text-xs font-black uppercase text-game-muted mt-2">Avg score</p>
                </div>
                <div className="rounded-2xl border-2 p-3 flex flex-col items-center justify-center" style={{ borderColor: '#BDE8FC', background: PALETTE.blue.soft }}>
                  <Gem className="w-8 h-8 text-game-blue" strokeWidth={2.5} />
                  <p className="text-2xl font-black text-game-blue-edge mt-1">{xpEarned === null ? '…' : `+${xpEarned}`}</p>
                  <p className="text-xs font-black uppercase text-game-muted">XP earned</p>
                </div>
                <div className="rounded-2xl border-2 p-3 flex flex-col items-center justify-center" style={{ borderColor: '#FFE58A', background: PALETTE.yellow.soft }}>
                  <Lightbulb className="w-8 h-8 text-game-yellow-edge" strokeWidth={2.5} />
                  <p className="text-2xl font-black text-[#A67C00] mt-1">{hintsUsed}</p>
                  <p className="text-xs font-black uppercase text-game-muted">Hints used</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-center gap-3 mt-8">
                <button onClick={() => navigate(`/reports/${interviewId}`)} className="btn-primary">
                  <FileText className="w-5 h-5" /> View report
                </button>
                <button onClick={onEnd} className="btn-ghost">
                  <RotateCcw className="w-5 h-5" /> Practice again
                </button>
                <button onClick={() => navigate('/')} className="btn-ghost">
                  <Home className="w-5 h-5" /> Dashboard
                </button>
              </div>
            </motion.div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Answer input */}
      {!isComplete && (
        <div className="bg-white border-t-2 border-game-line px-4 py-4">
          <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder={evaluating ? 'Checking your answer…' : 'Type your answer… (Enter to send, Shift+Enter for a new line)'}
              disabled={evaluating}
              rows={3}
              className="input-field resize-none disabled:opacity-60"
            />
            <div className="flex items-center justify-between gap-2 mt-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={requestHint}
                  disabled={hintLoading || evaluating}
                  className="btn-ghost !px-3 sm:!px-4 !py-2.5 !text-[#B38600]"
                >
                  {hintLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Lightbulb className="w-5 h-5" />}
                  <span className="hidden sm:inline">Hint{hintsUsed > 0 && ` (${hintsUsed})`}</span>
                </button>
                <button
                  type="button"
                  onClick={startVoice}
                  disabled={evaluating}
                  className={`btn-ghost !px-3 sm:!px-4 !py-2.5 ${listening ? '!text-game-red !border-game-red' : ''}`}
                  title={listening ? 'Stop listening' : 'Answer with voice'}
                >
                  <Mic className={`w-5 h-5 ${listening ? 'animate-pulse' : ''}`} />
                  <span className="hidden sm:inline">{listening ? 'Listening' : 'Voice'}</span>
                </button>
              </div>
              <button type="submit" disabled={!input.trim() || evaluating} className="btn-green !px-8">
                {evaluating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" strokeWidth={3} />}
                Check
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
