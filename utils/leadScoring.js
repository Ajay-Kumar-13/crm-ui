const hashStr = (s = '') => s.split('').reduce((a, c) => a + c.charCodeAt(0), 0);

const BASE_SCORE = {
  WON: 95,
  CONVERTED: 95,
  NEGOTIATION: 75,
  QUALIFIED: 65,
  CONTACTED: 45,
  NEW: 30,
  LOST: 5,
};

export const getLeadScore = (lead) => {
  const state = lead.leadState?.toUpperCase();
  const base = BASE_SCORE[state] ?? 30;
  const variance = (hashStr(lead.id) % 21) - 10; // -10..+10, deterministic per lead
  const score = Math.max(0, Math.min(100, base + variance));
  const tier = score >= 70 ? 'Hot' : score >= 40 ? 'Warm' : 'Cold';
  return { score, tier };
};

export const TIER_STYLES = {
  Hot: 'bg-primary/10 text-primary-dark border-primary/25',
  Warm: 'bg-[#fff3e8] text-[#b45309] border-[#b45309]/20',
  Cold: 'bg-slate-100 text-slate-500 border-slate-200',
};
