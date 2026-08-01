import React, { useEffect, useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { EmptyState } from '../components/EmptyState';
import { MessageCircle, Search, Send, CheckCheck, ArrowLeft } from 'lucide-react';

const INCOMING_TEMPLATES = [
  "Hi, I'm interested in learning more about your CRM pricing.",
  'Can we schedule a demo call this week?',
  'Thanks for reaching out! Can you send more details?',
  "We're comparing a few options right now, what makes you different?",
  'Following up on our last conversation — any updates?',
];
const OUTGOING_TEMPLATES = [
  'Hi! Thanks for your interest — happy to walk you through pricing.',
  'Sure, does Thursday at 3 PM work for a quick call?',
  "Absolutely, I'll send over our feature comparison sheet.",
  'We offer flat-rate pricing with unlimited users, unlike per-seat models.',
  'Just checking in — let me know if you have any questions!',
];

const hashStr = (s = '') => s.split('').reduce((a, c) => a + c.charCodeAt(0), 0);

const buildThread = (lead) => {
  const seed = hashStr(lead.id);
  const count = 2 + (seed % 3);
  const now = Date.now();
  const messages = [];
  for (let i = 0; i < count; i++) {
    const isIncoming = (seed + i) % 2 === 0;
    const templates = isIncoming ? INCOMING_TEMPLATES : OUTGOING_TEMPLATES;
    messages.push({
      id: `${lead.id}-${i}`,
      from: isIncoming ? 'them' : 'me',
      text: templates[(seed + i) % templates.length],
      ts: now - (count - i) * 45 * 60 * 1000,
    });
  }
  const unread = messages[messages.length - 1]?.from === 'them' ? 1 + (seed % 3) : 0;
  return { messages, unread };
};

const formatTime = (ts) => new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const WhatsApp = () => {
  const { leads, users, user } = useApp();
  const [threads, setThreads] = useState({});
  const [selectedId, setSelectedId] = useState(null);
  const [search, setSearch] = useState('');
  const [draft, setDraft] = useState('');

  const contacts = useMemo(
    () => (user?.roles === 'EMPLOYEE' ? leads.filter((l) => l.assignedTo === user.id) : leads),
    [leads, user]
  );

  useEffect(() => {
    setThreads((prev) => {
      const next = { ...prev };
      let changed = false;
      contacts.forEach((c) => {
        if (!next[c.id]) {
          next[c.id] = buildThread(c);
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [contacts]);

  useEffect(() => {
    if (!selectedId && contacts.length > 0) setSelectedId(contacts[0].id);
  }, [contacts, selectedId]);

  const filteredContacts = contacts
    .filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      const at = threads[a.id]?.messages.at(-1)?.ts || 0;
      const bt = threads[b.id]?.messages.at(-1)?.ts || 0;
      return bt - at;
    });

  const selectedLead = contacts.find((c) => c.id === selectedId);
  const selectedThread = selectedId ? threads[selectedId] : null;
  const assignedUser = selectedLead ? users.find((u) => u.id === selectedLead.assignedTo) : null;

  const openThread = (id) => {
    setSelectedId(id);
    setThreads((prev) => (prev[id] ? { ...prev, [id]: { ...prev[id], unread: 0 } } : prev));
  };

  const sendMessage = (e) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text || !selectedId) return;
    const outgoing = { id: `${selectedId}-${Date.now()}`, from: 'me', text, ts: Date.now() };
    setThreads((prev) => ({
      ...prev,
      [selectedId]: { unread: 0, messages: [...(prev[selectedId]?.messages || []), outgoing] },
    }));
    setDraft('');

    setTimeout(() => {
      const reply = {
        id: `${selectedId}-${Date.now() + 1}`,
        from: 'them',
        text: INCOMING_TEMPLATES[Math.floor(Math.random() * INCOMING_TEMPLATES.length)],
        ts: Date.now(),
      };
      setThreads((prev) => ({
        ...prev,
        [selectedId]: { unread: 0, messages: [...(prev[selectedId]?.messages || []), reply] },
      }));
    }, 1200 + Math.random() * 1000);
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <MessageCircle className="w-6 h-6 text-primary-dark" /> WhatsApp
        </h1>
        <p className="text-sm text-slate-500 mt-1">Message your leads directly, right from the CRM.</p>
      </div>

      {contacts.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
          <EmptyState
            icon={MessageCircle}
            title="No conversations yet"
            description="Once you have leads, their WhatsApp threads will show up here."
          />
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] flex flex-1 min-h-[560px] overflow-hidden">
          <div className={`w-full md:w-80 border-r border-slate-100 flex-col ${selectedId ? 'hidden md:flex' : 'flex'}`}>
            <div className="p-3 border-b border-slate-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search contacts…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-full focus:ring-primary focus:border-primary outline-none"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {filteredContacts.map((c) => {
                const t = threads[c.id];
                const last = t?.messages.at(-1);
                return (
                  <button
                    key={c.id}
                    onClick={() => openThread(c.id)}
                    className={`w-full text-left px-4 py-3 flex items-center gap-3 border-b border-slate-50 hover:bg-slate-50 transition-colors ${
                      selectedId === c.id ? 'bg-primary/5' : ''
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary-dark flex items-center justify-center text-sm font-bold shrink-0">
                      {c.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex justify-between items-baseline">
                        <p className="text-sm font-semibold text-slate-800 truncate">{c.name}</p>
                        {last && <span className="text-[10px] text-slate-400 shrink-0 ml-2">{formatTime(last.ts)}</span>}
                      </div>
                      <p className="text-xs text-slate-500 truncate">{last?.text}</p>
                    </div>
                    {t?.unread > 0 && (
                      <span className="bg-primary text-ink text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shrink-0">
                        {t.unread}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className={`flex-1 flex-col ${selectedId ? 'flex' : 'hidden md:flex'}`}>
            {selectedLead ? (
              <>
                <div className="p-4 border-b border-slate-100 flex items-center gap-3">
                  <button className="md:hidden text-slate-500" onClick={() => setSelectedId(null)}>
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div className="w-9 h-9 rounded-full bg-primary/10 text-primary-dark flex items-center justify-center text-sm font-bold">
                    {selectedLead.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{selectedLead.name}</p>
                    <p className="text-xs text-slate-500">
                      {selectedLead.phone} · Owned by {assignedUser?.username || 'Unassigned'}
                    </p>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-slate-50/50">
                  {selectedThread?.messages.map((m) => (
                    <div key={m.id} className={`flex ${m.from === 'me' ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-md rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                          m.from === 'me' ? 'bg-ink text-white rounded-br-sm' : 'bg-white border border-slate-200 text-slate-800 rounded-bl-sm'
                        }`}
                      >
                        <p>{m.text}</p>
                        <div
                          className={`flex items-center gap-1 mt-1 text-[10px] ${
                            m.from === 'me' ? 'text-white/60 justify-end' : 'text-slate-400'
                          }`}
                        >
                          {formatTime(m.ts)}
                          {m.from === 'me' && <CheckCheck className="w-3 h-3" />}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <form onSubmit={sendMessage} className="p-4 border-t border-slate-100 flex items-center gap-2">
                  <input
                    type="text"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="Type a message…"
                    className="flex-1 h-11 px-4 bg-slate-50 border border-slate-200 rounded-full focus:ring-primary focus:border-primary outline-none text-sm"
                  />
                  <button
                    type="submit"
                    disabled={!draft.trim()}
                    className="w-11 h-11 rounded-full bg-ink text-white flex items-center justify-center hover:bg-primary hover:text-ink transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
                Select a conversation to get started
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default WhatsApp;
