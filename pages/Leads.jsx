import React, { useMemo, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { Card, Button, Badge } from '../components/ui';
import { Modal } from '../components/Modal';
import { Tabs } from '../components/Tabs';
import { Pagination } from '../components/Pagination';
import { TableRowSkeleton } from '../components/Skeleton';
import { EmptyState } from '../components/EmptyState';
import { useToast } from '../context/ToastContext';
import { usePagination } from '../hooks/usePagination';
import { getLeadScore, TIER_STYLES } from '../utils/leadScoring';
import { FileSpreadsheet, Search, UserCheck, Briefcase, ChevronUp, ChevronDown, Route, Flame, Plus, X, Edit2, Send } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useUploadLeads } from '../hooks/useLeads';

const SOURCE_OPTIONS = ['Email Campaign', 'Social Media', 'Referral', 'Website', 'Cold Call'];
const LEAD_STATES = ['NEW', 'CONTACTED', 'QUALIFIED', 'NEGOTIATION', 'WON', 'LOST', 'CONVERTED'];
const emptyRule = () => ({ id: `rule-${Date.now()}-${Math.random()}`, source: '', userId: '' });

const hashStr = (s = '') => s.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
const COMMENT_TEMPLATES = [
  'Called and left a voicemail.',
  'Sent the pricing deck over email.',
  'Had a great intro call — very interested in the AI agent feature.',
  'Following up next week after their internal review.',
  'Requested a custom demo for their sales team.',
];
const buildComments = (lead, users) => {
  const seed = hashStr(lead.id);
  const count = seed % 3; // 0-2 seeded comments
  const author = users.find((u) => u.id === lead.assignedTo)?.username || 'System';
  const now = Date.now();
  return Array.from({ length: count }).map((_, i) => ({
    id: `${lead.id}-c${i}`,
    author,
    text: COMMENT_TEMPLATES[(seed + i) % COMMENT_TEMPLATES.length],
    ts: now - (count - i) * 3 * 24 * 60 * 60 * 1000,
  }));
};

const LeadsPage = () => {
  const { leads, users, updateLead, addLead, user, loading } = useApp();
  const toast = useToast();
  const [filter, setFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [activeTab, setActiveTab] = useState('assigned');
  const [sort, setSort] = useState({ key: 'name', dir: 'asc' });
  const [routingModalOpen, setRoutingModalOpen] = useState(false);
  const [routingRules, setRoutingRules] = useState([]);

  const [detailLead, setDetailLead] = useState(null);
  const [detailForm, setDetailForm] = useState({ leadState: '', assignedTo: '' });
  const [comments, setComments] = useState({});
  const [commentDraft, setCommentDraft] = useState('');

  const fileInputRef = useRef();

  const uploadLeads = useUploadLeads();

  const handleImport = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(sheet);
      const payload = jsonData.map(row => ({
        "address": row["Address"],
        "email": row["Email"],
        "leadSource": row["Lead Source"],
        "leadState": row["Lead Stage"],
        "leadSubSource": row["Lead Sub source"],
        "leadType": row["Lead Type"],
        "name": row["Name"],
        "phone": row["Phone"]
      }));
      uploadLeads.mutate({ leadsData: payload });
      toast.success(`Successfully imported ${payload.length} leads`, `${file.name}`);
      e.target.value = '';
    }
    reader.readAsArrayBuffer(file);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'NEW':
        return 'blue';
      case 'WON':
        return 'green';
      case 'LOST':
        return 'red';
      case 'QUALIFIED':
        return 'yellow';
      case 'CONTACTED':
        return 'blue';
      case 'NEGOTIATION':
        return 'yellow';
      case 'CONVERTED':
        return 'green';
      default:
        return 'gray';
    }
  };

  const toggleSort = (key) => {
    setSort((prev) => (prev.key === key ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' }));
  };

  const SortHeader = ({ sortKey, children }) => (
    <button
      onClick={() => toggleSort(sortKey)}
      className="flex items-center gap-1 text-left hover:text-slate-800 transition-colors"
    >
      {children}
      {sort.key === sortKey ? (
        sort.dir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
      ) : (
        <ChevronDown className="w-3 h-3 opacity-20" />
      )}
    </button>
  );

  const filteredLeads = useMemo(() => {
    const term = filter.trim().toLowerCase();
    const filtered = leads.filter((l) => {
      const matchesSearch =
        !term ||
        l.name?.toLowerCase().includes(term) ||
        l.email?.toLowerCase().includes(term) ||
        l.leadSource?.toLowerCase().includes(term);
      const matchesStatus = statusFilter === 'ALL' || l.leadState?.toUpperCase() === statusFilter;
      const matchesAssignment = user?.roles === 'EMPLOYEE' ? l.assignedTo === user.id : true;
      const matchesTab =
        user?.roles === 'EMPLOYEE'
          ? true
          : activeTab === 'assigned'
          ? !!l.assignedTo
          : !l.assignedTo;
      return matchesSearch && matchesStatus && matchesAssignment && matchesTab;
    });

    const dir = sort.dir === 'asc' ? 1 : -1;
    return [...filtered].sort((a, b) => {
      const av = (sort.key === 'status' ? a.leadState : a.name) || '';
      const bv = (sort.key === 'status' ? b.leadState : b.name) || '';
      return av.localeCompare(bv) * dir;
    });
  }, [leads, filter, statusFilter, activeTab, user, sort]);

  const {
    page,
    setPage,
    pageSize,
    setPageSize,
    pageCount,
    paginated: pagedLeads,
    totalItems,
  } = usePagination(filteredLeads, 10);

  const openDetail = (lead) => {
    setDetailLead(lead);
    setDetailForm({ leadState: lead.leadState, assignedTo: lead.assignedTo || '' });
    setCommentDraft('');
    setComments((prev) => (prev[lead.id] ? prev : { ...prev, [lead.id]: buildComments(lead, users) }));
  };

  const closeDetail = () => setDetailLead(null);

  const handleSaveDetail = (e) => {
    e.preventDefault();
    updateLead(detailLead.id, detailForm);
    toast.success('Lead updated successfully');
    closeDetail();
  };

  const handleAddComment = () => {
    const text = commentDraft.trim();
    if (!text || !detailLead) return;
    const entry = { id: `${detailLead.id}-c${Date.now()}`, author: user?.sub || user?.username || 'You', text, ts: Date.now() };
    setComments((prev) => ({ ...prev, [detailLead.id]: [...(prev[detailLead.id] || []), entry] }));
    setCommentDraft('');
  };

  const addRoutingRule = () => setRoutingRules((prev) => [...prev, emptyRule()]);
  const updateRoutingRule = (id, patch) =>
    setRoutingRules((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  const removeRoutingRule = (id) => setRoutingRules((prev) => prev.filter((r) => r.id !== id));
  const saveRoutingRules = (e) => {
    e.preventDefault();
    setRoutingModalOpen(false);
    toast.success('Routing rules saved', `${routingRules.filter((r) => r.source && r.userId).length} active rule(s)`);
  };

  const columnCount = 6 + (user?.roles === 'EMPLOYEE' ? 1 : 0);
  const detailComments = detailLead ? comments[detailLead.id] || [] : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <h1 className="text-2xl font-bold text-slate-800">
          {user?.role?.name === 'EMPLOYEE' ? 'My Leads' : 'All Leads'}
        </h1>
        {(user?.roles === 'ADMIN' || user?.roles === 'ROOT') && (
          <Tabs
            tabs={[
              { value: 'assigned', label: 'Assigned' },
              { value: 'unassigned', label: 'Un-assigned' },
            ]}
            active={activeTab}
            onChange={setActiveTab}
          />
        )}
      </div>

      <Card>
        <div className="flex flex-col md:flex-row gap-4 mb-6 items-center">
          <div className="flex-1 relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email, or source..."
              className="pl-10 w-full h-10 px-3 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-primary focus:border-primary focus:outline-none shadow-sm text-sm"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
          <div className="w-full md:w-48">
            <select
              className="w-full h-10 px-3 border border-slate-300 rounded-lg focus:ring-primary focus:border-primary focus:outline-none shadow-sm bg-white text-slate-900 text-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Statuses</option>
              <option value="NEW">New</option>
              <option value="CONTACTED">Contacted</option>
              <option value="QUALIFIED">Qualified</option>
              <option value="WON">Won</option>
              <option value="LOST">Lost</option>
            </select>
          </div>
          {(user?.roles === 'ADMIN' || user?.roles === 'ROOT') && (
            <div className="flex gap-2">
              <input type='file' ref={fileInputRef} accept='.xlsx,.xls' style={{display: 'none'}} onChange={handleFileChange}/>
              <Button variant="outline" onClick={() => setRoutingModalOpen(true)} className='flex items-center'>
                <Route className="w-4 h-4 mr-2" /> Routing Rules
              </Button>
              <Button variant="outline" onClick={handleImport} className='flex items-center'>
                <FileSpreadsheet className="w-4 h-4 mr-2" /> Import Excel
              </Button>
            </div>
          )}
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                  <SortHeader sortKey="name">Info</SortHeader>
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                  <SortHeader sortKey="status">State</SortHeader>
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Source</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Score</th>
                {(user?.roles === 'EMPLOYEE') && <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Phone</th>}
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Assigned To</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {loading ? (
                <TableRowSkeleton columns={columnCount} />
              ) : pagedLeads.length === 0 ? (
                <tr>
                  <td colSpan={columnCount}>
                    <EmptyState
                      icon={Briefcase}
                      title="No leads found"
                      description="Try adjusting your search or filters, or import a new batch of leads."
                    />
                  </td>
                </tr>
              ) : (
                pagedLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <button onClick={() => openDetail(lead)} className="text-sm font-semibold text-slate-900 hover:text-primary-dark transition-colors">
                      {lead.name}
                    </button>
                    <div className="text-sm text-slate-500">{lead.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge color={getStatusColor(lead.leadState.toUpperCase())}>{lead.leadState}</Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-semibold text-slate-900">{lead.leadSource}</div>
                    <div className="text-sm text-slate-500">{lead.leadSubSource}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {(() => {
                      const { score, tier } = getLeadScore(lead);
                      return (
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${TIER_STYLES[tier]}`}>
                          <Flame className="w-3 h-3" /> {score} · {tier}
                        </span>
                      );
                    })()}
                  </td>
                  {(user?.roles === 'EMPLOYEE') && <td className="px-6 py-4">
                    <div className="text-sm font-semibold text-slate-900">{lead.phone}</div>
                  </td>}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-6 w-6 rounded-full bg-slate-200 flex items-center justify-center text-xs text-slate-600 font-bold mr-2">
                        {users.find((u) => u.id === lead.assignedTo)?.username?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <span className="text-sm text-slate-600">
                        {users.find((u) => u.id === lead.assignedTo)?.username || 'Unassigned'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button onClick={() => openDetail(lead)} className="text-primary-dark hover:text-ink flex items-center gap-1.5">
                      <Edit2 className="w-4 h-4" /> View / Edit
                    </button>
                  </td>
                </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && (
          <Pagination
            page={page}
            pageCount={pageCount}
            pageSize={pageSize}
            totalItems={totalItems}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        )}
      </Card>

      <Modal
        open={!!detailLead}
        onClose={closeDetail}
        title={detailLead?.name}
        subtitle={detailLead?.email}
        icon={UserCheck}
        size="lg"
        footer={
          <div className="w-full flex items-center gap-2">
            <input
              type="text"
              value={commentDraft}
              onChange={(e) => setCommentDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddComment();
                }
              }}
              placeholder="Log a call, note, or update…"
              className="flex-1 h-10 px-4 bg-slate-50 border border-slate-200 rounded-full focus:ring-primary focus:border-primary outline-none text-sm"
            />
            <button
              type="button"
              onClick={handleAddComment}
              disabled={!commentDraft.trim()}
              className="w-10 h-10 rounded-full bg-ink text-white flex items-center justify-center hover:bg-primary hover:text-ink transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        }
      >
        {detailLead && (
          <>
            <form onSubmit={handleSaveDetail} className="space-y-4 pb-4 mb-4 border-b border-slate-100">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-0.5">Phone</p>
                  <p className="text-slate-800">{detailLead.phone || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-0.5">Source</p>
                  <p className="text-slate-800">
                    {detailLead.leadSource}
                    {detailLead.leadSubSource ? ` · ${detailLead.leadSubSource}` : ''}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Status</label>
                  <select
                    value={detailForm.leadState}
                    onChange={(e) => setDetailForm({ ...detailForm, leadState: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-primary focus:border-primary outline-none"
                  >
                    {LEAD_STATES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Assigned To</label>
                  {(user?.roles === 'ADMIN' || user?.roles === 'ROOT') ? (
                    <select
                      value={detailForm.assignedTo}
                      onChange={(e) => setDetailForm({ ...detailForm, assignedTo: e.target.value })}
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-primary focus:border-primary outline-none"
                    >
                      <option value="">Unassigned</option>
                      {users
                        .filter((u) => u.accountActive && (u.role?.name === 'EMPLOYEE' || u.role?.name === 'ADMIN'))
                        .map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.username}
                          </option>
                        ))}
                    </select>
                  ) : (
                    <p className="px-3 py-2 text-sm text-slate-600 bg-slate-50 rounded-lg">
                      {users.find((u) => u.id === detailLead.assignedTo)?.username || 'Unassigned'}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="submit" className="!px-4 !py-2 text-sm">
                  Save Changes
                </Button>
              </div>
            </form>

            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Activity &amp; Comments</p>
            {detailComments.length === 0 ? (
              <p className="text-sm text-slate-400 italic">No comments yet — be the first to log an update.</p>
            ) : (
              <div className="space-y-3">
                {detailComments.map((c) => (
                  <div key={c.id} className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-primary/10 text-primary-dark flex items-center justify-center text-xs font-bold shrink-0">
                      {c.author?.charAt(0)?.toUpperCase()}
                    </div>
                    <div className="bg-slate-50 rounded-lg px-3 py-2 flex-1">
                      <div className="flex justify-between items-baseline gap-2">
                        <span className="text-xs font-semibold text-slate-700">{c.author}</span>
                        <span className="text-[10px] text-slate-400 shrink-0">{new Date(c.ts).toLocaleString()}</span>
                      </div>
                      <p className="text-sm text-slate-700 mt-0.5">{c.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </Modal>

      <Modal
        open={routingModalOpen}
        onClose={() => setRoutingModalOpen(false)}
        title="Auto-Routing Rules"
        subtitle="Automatically assign new leads based on their source."
        icon={Route}
        size="lg"
      >
        <form onSubmit={saveRoutingRules}>
          <div className="space-y-3 mb-4">
            {routingRules.length === 0 && (
              <p className="text-sm text-slate-500 italic">No rules yet — add one below to start auto-assigning leads.</p>
            )}
            {routingRules.map((rule) => (
              <div key={rule.id} className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg p-3">
                <span className="text-xs text-slate-500 shrink-0">If source is</span>
                <select
                  value={rule.source}
                  onChange={(e) => updateRoutingRule(rule.id, { source: e.target.value })}
                  className="flex-1 px-2 py-1.5 text-sm bg-white border border-slate-200 rounded-lg focus:ring-primary focus:border-primary outline-none"
                >
                  <option value="">Select source…</option>
                  {SOURCE_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <span className="text-xs text-slate-500 shrink-0">assign to</span>
                <select
                  value={rule.userId}
                  onChange={(e) => updateRoutingRule(rule.id, { userId: e.target.value })}
                  className="flex-1 px-2 py-1.5 text-sm bg-white border border-slate-200 rounded-lg focus:ring-primary focus:border-primary outline-none"
                >
                  <option value="">Select user…</option>
                  {users
                    .filter((u) => u.accountActive && (u.role?.name === 'EMPLOYEE' || u.role?.name === 'ADMIN'))
                    .map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.username}
                      </option>
                    ))}
                </select>
                <button type="button" onClick={() => removeRoutingRule(rule.id)} className="text-slate-400 hover:text-red-600 shrink-0">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <button type="button" onClick={addRoutingRule} className="text-xs text-primary-dark hover:text-ink font-medium flex items-center gap-1 mb-6">
            <Plus className="w-3.5 h-3.5" /> Add Rule
          </button>

          <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setRoutingModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Rules</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default LeadsPage;
