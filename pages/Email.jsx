import React, { useState } from 'react';
import { Card, Button, Input, Select, Badge } from '../components/ui';
import { Modal } from '../components/Modal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { EmptyState } from '../components/EmptyState';
import { useToast } from '../context/ToastContext';
import { Mail, Plus, Trash2, Pause, Play, Clock, X } from 'lucide-react';

const TRIGGERS = [
  { value: 'NEW_LEAD', label: 'New Lead Created' },
  { value: 'QUALIFIED', label: 'Lead Status = Qualified' },
  { value: 'INACTIVE_7D', label: 'Lead Inactive 7 Days' },
  { value: 'MANUAL', label: 'Manual / One-off Send' },
];

const triggerLabel = (value) => TRIGGERS.find((t) => t.value === value)?.label || value;

const emptyStep = () => ({ id: `s-${Date.now()}-${Math.random()}`, subject: '', body: '', delayDays: 0 });

const SEED_SEQUENCES = [
  {
    id: 'seq-1',
    name: 'New Lead Welcome',
    trigger: 'NEW_LEAD',
    active: true,
    steps: [
      { id: 's1', subject: 'Welcome to thriveQ 👋', body: "Thanks for your interest — here's how we can help your team sell more.", delayDays: 0 },
      { id: 's2', subject: "Here's what makes us different", body: 'Flat-rate pricing, unlimited users, and an AI agent built in.', delayDays: 2 },
      { id: 's3', subject: "Still deciding? Let's hop on a call", body: 'Happy to answer any questions on a quick 15-minute call.', delayDays: 5 },
    ],
  },
  {
    id: 'seq-2',
    name: 'Re-engagement',
    trigger: 'INACTIVE_7D',
    active: false,
    steps: [
      { id: 's4', subject: 'We miss you!', body: "It's been a while — anything we can help with?", delayDays: 0 },
      { id: 's5', subject: 'Special offer inside', body: 'Here’s a limited-time offer to help you get started.', delayDays: 3 },
    ],
  },
];

const EmailPage = () => {
  const toast = useToast();
  const [sequences, setSequences] = useState(SEED_SEQUENCES);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: '', trigger: 'NEW_LEAD', steps: [emptyStep()] });
  const [toDelete, setToDelete] = useState(null);

  const openNew = () => {
    setEditingId(null);
    setForm({ name: '', trigger: 'NEW_LEAD', steps: [emptyStep()] });
    setModalOpen(true);
  };

  const openEdit = (seq) => {
    setEditingId(seq.id);
    setForm({ name: seq.name, trigger: seq.trigger, steps: seq.steps.map((s) => ({ ...s })) });
    setModalOpen(true);
  };

  const updateStep = (id, patch) => {
    setForm((f) => ({ ...f, steps: f.steps.map((s) => (s.id === id ? { ...s, ...patch } : s)) }));
  };

  const addStep = () => setForm((f) => ({ ...f, steps: [...f.steps, emptyStep()] }));
  const removeStep = (id) => setForm((f) => ({ ...f, steps: f.steps.filter((s) => s.id !== id) }));

  const handleSave = (e) => {
    e.preventDefault();
    if (!form.name.trim() || form.steps.length === 0) return;

    if (editingId) {
      setSequences((prev) => prev.map((s) => (s.id === editingId ? { ...s, ...form } : s)));
      toast.success('Sequence updated successfully');
    } else {
      setSequences((prev) => [...prev, { id: `seq-${Date.now()}`, active: true, ...form }]);
      toast.success('Sequence created successfully');
    }
    setModalOpen(false);
  };

  const toggleActive = (seq) => {
    setSequences((prev) => prev.map((s) => (s.id === seq.id ? { ...s, active: !s.active } : s)));
    toast.success(seq.active ? 'Sequence paused' : 'Sequence activated');
  };

  const confirmDelete = () => {
    setSequences((prev) => prev.filter((s) => s.id !== toDelete.id));
    toast.success('Sequence deleted successfully');
    setToDelete(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Mail className="w-6 h-6 text-primary-dark" /> Email Sequences
          </h1>
          <p className="text-sm text-slate-500 mt-1">Automated multi-step email campaigns triggered by lead activity.</p>
        </div>
        <Button onClick={openNew}>
          <Plus className="w-4 h-4 mr-2 inline" /> New Sequence
        </Button>
      </div>

      {sequences.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
          <EmptyState
            icon={Mail}
            title="No sequences yet"
            description="Create your first automated email sequence to start nurturing leads."
            action={
              <Button variant="outline" onClick={openNew}>
                <Plus className="w-4 h-4 mr-2 inline" /> New Sequence
              </Button>
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {sequences.map((seq) => (
            <Card key={seq.id} className="flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{seq.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Trigger: {triggerLabel(seq.trigger)}</p>
                </div>
                <Badge color={seq.active ? 'green' : 'gray'}>{seq.active ? 'Active' : 'Paused'}</Badge>
              </div>

              <div className="space-y-2 flex-1">
                {seq.steps.map((step, i) => (
                  <div key={step.id} className="flex items-start gap-3 text-sm">
                    <div className="w-6 h-6 rounded-full bg-primary/10 text-primary-dark flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                      {i + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-slate-800 truncate">{step.subject || '(no subject)'}</p>
                      <p className="text-xs text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {step.delayDays === 0 ? 'Immediately' : `${step.delayDays} day${step.delayDays === 1 ? '' : 's'} later`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-slate-100">
                <Button variant="outline" onClick={() => toggleActive(seq)} className="!px-3 !py-1.5 text-xs">
                  {seq.active ? <Pause className="w-3.5 h-3.5 mr-1.5 inline" /> : <Play className="w-3.5 h-3.5 mr-1.5 inline" />}
                  {seq.active ? 'Pause' : 'Activate'}
                </Button>
                <Button variant="outline" onClick={() => openEdit(seq)} className="!px-3 !py-1.5 text-xs">
                  Edit
                </Button>
                <button
                  onClick={() => setToDelete(seq)}
                  className="text-red-600 hover:bg-red-50 rounded-full p-2 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit Sequence' : 'New Sequence'}
        icon={Mail}
        size="lg"
      >
        <form onSubmit={handleSave}>
          <Input
            label="Sequence Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            placeholder="e.g. New Lead Welcome"
          />
          <Select
            label="Trigger"
            value={form.trigger}
            onChange={(e) => setForm({ ...form, trigger: e.target.value })}
            options={TRIGGERS}
          />

          <div className="mb-2 flex items-center justify-between">
            <label className="block text-sm font-medium text-slate-700">Steps</label>
            <button type="button" onClick={addStep} className="text-xs text-primary-dark hover:text-ink font-medium flex items-center gap-1">
              <Plus className="w-3.5 h-3.5" /> Add Step
            </button>
          </div>

          <div className="space-y-3">
            {form.steps.map((step, i) => (
              <div key={step.id} className="border border-slate-200 rounded-lg p-3 bg-slate-50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-500">Step {i + 1}</span>
                  {form.steps.length > 1 && (
                    <button type="button" onClick={() => removeStep(step.id)} className="text-slate-400 hover:text-red-600">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  placeholder="Email subject"
                  value={step.subject}
                  onChange={(e) => updateStep(step.id, { subject: e.target.value })}
                  required
                  className="w-full mb-2 px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-lg focus:ring-primary focus:border-primary outline-none"
                />
                <textarea
                  placeholder="Email body…"
                  value={step.body}
                  onChange={(e) => updateStep(step.id, { body: e.target.value })}
                  rows={2}
                  className="w-full mb-2 px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-lg focus:ring-primary focus:border-primary outline-none"
                />
                <div className="flex items-center gap-2">
                  <label className="text-xs text-slate-500">Send after</label>
                  <input
                    type="number"
                    min={0}
                    value={step.delayDays}
                    onChange={(e) => updateStep(step.id, { delayDays: Math.max(0, Number(e.target.value)) })}
                    className="w-16 px-2 py-1 text-sm bg-white border border-slate-200 rounded-lg focus:ring-primary focus:border-primary outline-none"
                  />
                  <span className="text-xs text-slate-500">day(s)</span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end space-x-2 mt-6 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">{editingId ? 'Save Changes' : 'Create Sequence'}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={confirmDelete}
        title={`Delete sequence "${toDelete?.name}"?`}
        description="This cannot be undone. Leads currently in this sequence will stop receiving emails."
        confirmLabel="Delete Sequence"
      />
    </div>
  );
};

export default EmailPage;
