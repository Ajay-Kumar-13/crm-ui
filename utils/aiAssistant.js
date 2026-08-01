const countBy = (arr, fn) =>
  arr.reduce((acc, item) => {
    const key = fn(item) || 'Unknown';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

const formatCounts = (counts) =>
  Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([k, v]) => `${k}: ${v}`)
    .join('\n');

export const SUGGESTED_PROMPTS = [
  'How many leads do we have?',
  "What's our lead status breakdown?",
  'Who is unassigned right now?',
  "Who's my top performer?",
  'How are our partner companies doing?',
];

export const getAIResponse = (query, { leads = [], users = [], companies = [] } = {}) => {
  const q = query.trim().toLowerCase();

  if (!q) return "I didn't catch that — try asking about leads, your team, or partner companies.";

  if (/^(hi|hey|hello)\b/.test(q)) {
    return "Hey! I'm your thriveQ AI Agent. Ask me things like \"how many leads do we have\" or \"who's my top performer\".";
  }

  if (/breakdown|distribution|by status|status of/.test(q)) {
    const counts = countBy(leads, (l) => l.leadState);
    return leads.length
      ? `Here's the current lead status breakdown:\n\n${formatCounts(counts)}`
      : "There aren't any leads in the system yet.";
  }

  if (/unassigned|not assigned|no owner/.test(q)) {
    const unassigned = leads.filter((l) => !l.assignedTo);
    return unassigned.length
      ? `${unassigned.length} lead${unassigned.length === 1 ? ' is' : 's are'} unassigned right now:\n\n${unassigned
          .slice(0, 8)
          .map((l) => `• ${l.name} (${l.leadSource || 'unknown source'})`)
          .join('\n')}${unassigned.length > 8 ? `\n…and ${unassigned.length - 8} more` : ''}`
      : 'Every lead currently has an owner. Nice and tidy!';
  }

  if (/top performer|best (employee|agent|rep)|who.*most (leads|wins)|leaderboard/.test(q)) {
    const counts = countBy(
      leads.filter((l) => l.assignedTo),
      (l) => users.find((u) => u.id === l.assignedTo)?.username
    );
    const [topName, topCount] = Object.entries(counts).sort((a, b) => b[1] - a[1])[0] || [];
    return topName
      ? `${topName} is currently leading with ${topCount} assigned lead${topCount === 1 ? '' : 's'}.`
      : "No leads have been assigned yet, so there's no leaderboard to show.";
  }

  if (/won|converted|closed.?won/.test(q)) {
    const won = leads.filter((l) => ['WON', 'CONVERTED'].includes(l.leadState?.toUpperCase()));
    return won.length
      ? `${won.length} lead${won.length === 1 ? ' has' : 's have'} been won or converted so far:\n\n${won
          .slice(0, 8)
          .map((l) => `• ${l.name}`)
          .join('\n')}`
      : "No leads have closed as won yet — let's change that!";
  }

  if (/pipeline value|deal value|revenue forecast/.test(q)) {
    return "We don't track a per-lead deal value yet — connect a deal-value field and I'll forecast pipeline value for you.";
  }

  if (/compan(y|ies)|partner/.test(q)) {
    if (!companies.length) return "There aren't any partner companies on record yet.";
    const top = [...companies].sort((a, b) => (b.annualRevenue || 0) - (a.annualRevenue || 0))[0];
    return `We have ${companies.length} partner compan${companies.length === 1 ? 'y' : 'ies'}. The highest revenue partner is ${top.name} at $${(top.annualRevenue || 0).toLocaleString()}/yr.`;
  }

  if (/team|how many users|headcount|employees/.test(q)) {
    const counts = countBy(users, (u) => u.role?.name);
    return `Your team has ${users.length} user${users.length === 1 ? '' : 's'}:\n\n${formatCounts(counts)}`;
  }

  if (/how many leads|total leads|lead count/.test(q)) {
    return leads.length
      ? `You currently have ${leads.length} lead${leads.length === 1 ? '' : 's'} in the system.`
      : "There aren't any leads yet — import a batch from the Leads page to get started.";
  }

  if (/help|what can you do|commands/.test(q)) {
    return `I can answer questions about your CRM data. Try:\n\n${SUGGESTED_PROMPTS.map((p) => `• ${p}`).join('\n')}`;
  }

  return "I'm still learning that one. Try asking about lead counts, status breakdown, unassigned leads, top performers, or partner companies.";
};
