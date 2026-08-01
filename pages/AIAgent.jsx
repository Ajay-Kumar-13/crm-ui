import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { Button } from '../components/ui';
import { getAIResponse, SUGGESTED_PROMPTS } from '../utils/aiAssistant';
import { Bot, Send, Sparkles, User } from 'lucide-react';

let idCounter = 0;
const nextId = () => `m-${++idCounter}-${Date.now()}`;

const AIAgent = () => {
  const { leads, users, companies, user } = useApp();
  const [messages, setMessages] = useState([
    {
      id: nextId(),
      role: 'assistant',
      text: `Hi ${user?.sub || 'there'}! I'm your thriveQ AI Agent. Ask me anything about your leads, team, or partner companies.`,
    },
  ]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, thinking]);

  const send = (text) => {
    const value = (text ?? input).trim();
    if (!value || thinking) return;
    setMessages((prev) => [...prev, { id: nextId(), role: 'user', text: value }]);
    setInput('');
    setThinking(true);
    const delay = 500 + Math.random() * 500;
    setTimeout(() => {
      const reply = getAIResponse(value, { leads, users, companies });
      setMessages((prev) => [...prev, { id: nextId(), role: 'assistant', text: reply }]);
      setThinking(false);
    }, delay);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    send();
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-primary-dark" /> AI Agent
        </h1>
        <p className="text-sm text-slate-500 mt-1">Ask natural-language questions about your CRM data.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] flex flex-col flex-1 min-h-[520px] overflow-hidden">
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((m) => (
            <div key={m.id} className={`flex items-start gap-3 ${m.role === 'user' ? 'justify-end' : ''}`}>
              {m.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-ink flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
              )}
              <div
                className={`max-w-lg rounded-2xl px-4 py-3 text-sm whitespace-pre-line leading-relaxed ${
                  m.role === 'user' ? 'bg-ink text-white rounded-br-sm' : 'bg-slate-100 text-slate-800 rounded-bl-sm'
                }`}
              >
                {m.text}
              </div>
              {m.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary-dark flex items-center justify-center shrink-0">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {thinking && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-ink flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-primary" />
              </div>
              <div className="bg-slate-100 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {messages.length <= 1 && (
          <div className="px-6 pb-3 flex flex-wrap gap-2">
            {SUGGESTED_PROMPTS.map((p) => (
              <button
                key={p}
                onClick={() => send(p)}
                className="text-xs px-3 py-1.5 rounded-full border border-slate-200 text-slate-600 hover:border-primary hover:text-primary-dark transition-colors"
              >
                {p}
              </button>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="border-t border-slate-100 p-4 flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your leads, team, or companies…"
            className="flex-1 h-11 px-4 bg-slate-50 text-slate-900 border border-slate-200 rounded-full focus:ring-primary focus:border-primary focus:outline-none text-sm"
          />
          <Button type="submit" className="shrink-0 px-4" disabled={!input.trim() || thinking}>
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AIAgent;
