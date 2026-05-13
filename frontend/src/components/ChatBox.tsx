import React, { useState, useRef, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, Bot, User, CheckCircle2, CornerDownLeft,
  X, ChevronRight, Zap, Lightbulb, Timer, Loader2,
} from 'lucide-react';

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
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-submit when timer expires
  const handleTimerExpire = useCallback(() => {
    if (input.trim()) {
      const form = document.createElement('form');
      const event = new Event('submit', { bubbles: true, cancelable: true });
      form.dispatchEvent(event);
      // Auto-submit current answer
      handleSubmitAnswer(input.trim());
    } else {
      setMessages(prev => [...prev, {
        role: 'system',
        content: '⏱ Time expired! No answer submitted. Moving to next question.',
        metadata: { score: 0 },
      }]);
      if (currentIdx + 1 < questions.length) {
        setTimeout(() => {
          setMessages(prev => [...prev, { role: 'ai', content: questions[currentIdx + 1].question }]);
          setCurrentIdx(prev => prev + 1);
          setTimerActive(true);
        }, 1000);
      }
    }
  }, [input, currentIdx, questions]);

  const timeLeft = useTimer(timerSeconds, handleTimerExpire, timerActive && !evaluating);

  useEffect(() => {
    if (questions.length > 0) {
      setMessages([
        { role: 'system', content: `Interview started on **${topic}**. ${timerEnabled ? `⏱ ${timerSeconds}s per question.` : ''} Good luck!` },
        { role: 'ai', content: questions[0].question },
      ]);
      setTimerActive(timerEnabled);
    }
  }, [questions, topic]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, evaluating]);

  // Request a hint from AI
  const requestHint = async () => {
    if (hintLoading) return;
    setHintLoading(true);
    try {
      const res = await api.post('/ai/hint', {
        question: questions[currentIdx].question,
        partialAnswer: input,
        topic,
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
        setTimeout(() => {
          setMessages(prev => [...prev, { role: 'ai', content: questions[currentIdx + 1].question }]);
          setCurrentIdx(prev => prev + 1);
          setTimerActive(timerEnabled);
        }, 1200);
      } else {
        setTimeout(() => {
          setMessages(prev => [...prev, {
            role: 'system',
            content: `Interview complete! ${hintsUsed > 0 ? `Hints used: ${hintsUsed}. ` : ''}Check your dashboard for updated progress.`,
          }]);
        }, 1200);
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

  const isComplete = currentIdx >= questions.length;
  const progress   = Math.round(((currentIdx) / questions.length) * 100);

  // Timer color based on remaining time
  const timerColor = timeLeft <= 10 ? '#ef4444' : timeLeft <= 30 ? '#f59e0b' : '#10b981';
  const timerPulse = timeLeft <= 10;

  return (
    <div className="flex flex-col h-full" style={{ background: '#0d0f17' }}>

      {/* Header */}
      <header
        className="flex items-center justify-between px-5 py-3.5 border-b"
        style={{ background: '#13151f', borderColor: 'rgba(255,255,255,0.06)' }}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-white text-sm font-semibold leading-tight">{topic}</p>
            <p className="text-[11px] text-slate-500 font-medium">Live Interview Session</p>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-1" />
        </div>

        <div className="flex items-center gap-3">
          {/* Timer */}
          {timerEnabled && timerActive && !isComplete && (
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${timerPulse ? 'animate-pulse' : ''}`}
              style={{ background: `${timerColor}20`, color: timerColor, border: `1px solid ${timerColor}40` }}
            >
              <Timer className="w-3.5 h-3.5" />
              {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </div>
          )}

          {/* Progress pill */}
          <div
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold"
            style={{ background: 'rgba(255,255,255,0.06)', color: '#94a3b8' }}
          >
            <ChevronRight className="w-3 h-3 text-indigo-400" />
            Q {Math.min(currentIdx + 1, questions.length)} / {questions.length}
          </div>

          <button
            onClick={onEnd}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white transition-colors"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <X className="w-3.5 h-3.5" /> End
          </button>
        </div>
      </header>

      {/* Progress bar */}
      <div className="h-0.5 bg-white/5">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-700"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-5 max-w-4xl mx-auto w-full">
        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex max-w-[88%] md:max-w-[78%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start gap-3`}>

                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    msg.role === 'user'   ? 'bg-indigo-600' :
                    msg.role === 'ai'     ? 'bg-slate-700'  :
                    msg.role === 'hint'   ? 'bg-amber-800/60' :
                    'bg-emerald-800/60'
                  }`}
                >
                  {msg.role === 'user'   ? <User         className="w-4 h-4 text-white" />         :
                   msg.role === 'ai'     ? <Bot           className="w-4 h-4 text-slate-300" />     :
                   msg.role === 'hint'   ? <Lightbulb     className="w-4 h-4 text-amber-400" />     :
                                           <CheckCircle2  className="w-4 h-4 text-emerald-400" />}
                </div>

                {/* Bubble */}
                <div>
                  <p className={`text-[10px] font-semibold uppercase tracking-widest mb-1.5 ${
                    msg.role === 'user' ? 'text-right text-indigo-400' :
                    msg.role === 'ai'   ? 'text-slate-500' :
                    msg.role === 'hint' ? 'text-amber-500' :
                    'text-emerald-500'
                  }`}>
                    {msg.role === 'user' ? 'You' : msg.role === 'ai' ? 'Interviewer' : msg.role === 'hint' ? 'Coach Hint' : 'AI Evaluation'}
                  </p>

                  {/* Score badge */}
                  {msg.metadata?.score !== undefined && (
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold mb-2 ${
                      msg.metadata.score >= 7 ? 'bg-emerald-500/20 text-emerald-400' :
                      msg.metadata.score >= 4 ? 'bg-amber-500/20 text-amber-400'   :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      Score: {msg.metadata.score}/10
                    </div>
                  )}

                  <div
                    className={`px-4 py-3.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                      msg.role === 'user'
                        ? 'bg-indigo-600 text-white rounded-tr-sm'
                        : msg.role === 'hint'
                          ? 'text-amber-200 rounded-tl-sm'
                          : msg.role === 'ai'
                            ? 'text-slate-200 rounded-tl-sm'
                            : 'text-slate-300 rounded-tl-sm'
                    }`}
                    style={msg.role !== 'user' ? {
                      background: msg.role === 'hint' ? '#2a2415' : '#1a1e2e',
                      border: `1px solid ${msg.role === 'hint' ? 'rgba(251,191,36,0.15)' : 'rgba(255,255,255,0.07)'}`,
                    } : undefined}
                  >
                    {msg.content}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

          {/* Typing indicator */}
          {evaluating && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-slate-400 animate-pulse" />
                </div>
                <div
                  className="flex items-center gap-1.5 px-4 py-3.5 rounded-2xl rounded-tl-sm"
                  style={{ background: '#1a1e2e', border: '1px solid rgba(255,255,255,0.07)' }}
                >
                  {[0, 150, 300].map((d) => (
                    <span key={d} className="w-2 h-2 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: `${d}ms` }} />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div
        className="p-4 pb-5 md:p-5 md:pb-6 border-t"
        style={{ background: '#13151f', borderColor: 'rgba(255,255,255,0.06)' }}
      >
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder={
                isComplete && !evaluating
                  ? 'Interview complete — you can end the session.'
                  : evaluating
                    ? 'Evaluating your answer…'
                    : 'Type your answer… (Enter to send, Shift+Enter for new line)'
              }
              disabled={evaluating || isComplete}
              rows={3}
              className="w-full rounded-xl text-sm text-white placeholder:text-slate-600 outline-none resize-none pr-14 pl-4 py-3.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: '#0d0f17',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'rgba(99,102,241,0.5)';
                e.currentTarget.style.boxShadow   = '0 0 0 3px rgba(99,102,241,0.12)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                e.currentTarget.style.boxShadow   = 'none';
              }}
            />
            <button
              type="submit"
              disabled={!input.trim() || evaluating || isComplete}
              className="absolute bottom-3 right-3 w-9 h-9 rounded-lg flex items-center justify-center text-white transition-all duration-200 disabled:opacity-30"
              style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}
            >
              <Send className="w-4 h-4 -translate-y-px translate-x-px" />
            </button>
          </div>

          <div className="flex items-center justify-between mt-2.5">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
              <CornerDownLeft className="w-3 h-3" />
              <span>Enter to submit · Shift+Enter for new line</span>
            </div>

            {/* Hint button */}
            {!isComplete && !evaluating && (
              <button
                type="button"
                onClick={requestHint}
                disabled={hintLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-amber-400/80 hover:text-amber-300 transition-colors"
                style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.15)' }}
              >
                {hintLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Lightbulb className="w-3 h-3" />}
                Need a Hint? {hintsUsed > 0 && `(${hintsUsed})`}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
