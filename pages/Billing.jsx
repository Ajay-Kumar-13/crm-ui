import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Card, Button, Input, Select, Badge } from '../components/ui';
import { Modal } from '../components/Modal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { Tabs } from '../components/Tabs';
import { Pagination } from '../components/Pagination';
import { EmptyState } from '../components/EmptyState';
import { useToast } from '../context/ToastContext';
import { usePagination } from '../hooks/usePagination';
import { Receipt, Plus, Trash2, CheckCircle2, Download, X } from 'lucide-react';

const GST_RATES = [5, 12, 18, 28];
const GSTIN_REGEX = /^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}Z[A-Z\d]{1}$/;

const emptyLineItem = () => ({ id: `li-${Date.now()}-${Math.random()}`, description: '', amount: 0 });

const SEED_INVOICES = [
  {
    id: 'inv-1001',
    number: 'INV-2026-1001',
    companyName: 'TechSoft',
    gstin: '27AAAPL1234C1ZV',
    gstRate: 18,
    lineItems: [{ id: 'li-a', description: 'Annual CRM License', amount: 250000 }],
    status: 'PAID',
    date: '2026-06-12',
  },
  {
    id: 'inv-1002',
    number: 'INV-2026-1002',
    companyName: 'BuildIt',
    gstin: '29AACCB2345D1Z8',
    gstRate: 18,
    lineItems: [{ id: 'li-b', description: 'Onboarding & Setup', amount: 75000 }],
    status: 'PENDING',
    date: '2026-07-20',
  },
];

const calcTotals = (lineItems, gstRate) => {
  const subtotal = lineItems.reduce((sum, li) => sum + (Number(li.amount) || 0), 0);
  const gstAmount = Math.round((subtotal * gstRate) / 100);
  return { subtotal, gstAmount, cgst: gstAmount / 2, sgst: gstAmount / 2, total: subtotal + gstAmount };
};

const STATUS_COLOR = { PAID: 'green', PENDING: 'yellow', OVERDUE: 'red' };

const Billing = () => {
  const { companies } = useApp();
  const toast = useToast();
  const [invoices, setInvoices] = useState(SEED_INVOICES);
  const [statusTab, setStatusTab] = useState('ALL');
  const [modalOpen, setModalOpen] = useState(false);
  const [toDelete, setToDelete] = useState(null);
  const [gstinError, setGstinError] = useState('');
  const [form, setForm] = useState({
    companyName: '',
    gstin: '',
    gstRate: 18,
    lineItems: [emptyLineItem()],
  });

  const openNew = () => {
    setForm({ companyName: companies[0]?.name || '', gstin: '', gstRate: 18, lineItems: [emptyLineItem()] });
    setGstinError('');
    setModalOpen(true);
  };

  const updateLineItem = (id, patch) => {
    setForm((f) => ({ ...f, lineItems: f.lineItems.map((li) => (li.id === id ? { ...li, ...patch } : li)) }));
  };
  const addLineItem = () => setForm((f) => ({ ...f, lineItems: [...f.lineItems, emptyLineItem()] }));
  const removeLineItem = (id) => setForm((f) => ({ ...f, lineItems: f.lineItems.filter((li) => li.id !== id) }));

  const { subtotal, gstAmount, cgst, sgst, total } = calcTotals(form.lineItems, form.gstRate);

  const handleCreate = (e) => {
    e.preventDefault();
    if (form.gstin && !GSTIN_REGEX.test(form.gstin.toUpperCase())) {
      setGstinError('That GSTIN doesn’t look right — expected format like 27AAAPL1234C1ZV.');
      return;
    }
    const newInvoice = {
      id: `inv-${Date.now()}`,
      number: `INV-${new Date().getFullYear()}-${1000 + invoices.length + 1}`,
      companyName: form.companyName,
      gstin: form.gstin.toUpperCase(),
      gstRate: form.gstRate,
      lineItems: form.lineItems.filter((li) => li.description),
      status: 'PENDING',
      date: new Date().toISOString().slice(0, 10),
    };
    setInvoices((prev) => [newInvoice, ...prev]);
    setModalOpen(false);
    toast.success('Invoice created successfully', newInvoice.number);
  };

  const markPaid = (inv) => {
    setInvoices((prev) => prev.map((i) => (i.id === inv.id ? { ...i, status: 'PAID' } : i)));
    toast.success(`${inv.number} marked as paid`);
  };

  const confirmDelete = () => {
    setInvoices((prev) => prev.filter((i) => i.id !== toDelete.id));
    toast.success('Invoice deleted successfully');
    setToDelete(null);
  };

  const filteredInvoices = statusTab === 'ALL' ? invoices : invoices.filter((i) => i.status === statusTab);

  const { page, setPage, pageSize, setPageSize, pageCount, paginated, totalItems } = usePagination(filteredInvoices, 10);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Receipt className="w-6 h-6 text-primary-dark" /> Billing & GST Invoices
          </h1>
          <p className="text-sm text-slate-500 mt-1">Generate GST-compliant invoices for your partner companies.</p>
        </div>
        <Button onClick={openNew}>
          <Plus className="w-4 h-4 mr-2 inline" /> New Invoice
        </Button>
      </div>

      <Tabs
        tabs={[
          { value: 'ALL', label: 'All' },
          { value: 'PAID', label: 'Paid' },
          { value: 'PENDING', label: 'Pending' },
          { value: 'OVERDUE', label: 'Overdue' },
        ]}
        active={statusTab}
        onChange={setStatusTab}
      />

      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Invoice</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Company</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-slate-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <EmptyState icon={Receipt} title="No invoices found" description="Create your first invoice to get started." />
                  </td>
                </tr>
              ) : (
                paginated.map((inv) => {
                  const { total: invTotal } = calcTotals(inv.lineItems, inv.gstRate);
                  return (
                    <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-slate-900">{inv.number}</div>
                        <div className="text-xs text-slate-500">{inv.date}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-800">{inv.companyName}</div>
                        <div className="text-xs text-slate-400 font-mono">{inv.gstin || 'No GSTIN on file'}</div>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-slate-800">
                        ₹{invTotal.toLocaleString('en-IN')}
                        <span className="block text-xs font-normal text-slate-400">incl. {inv.gstRate}% GST</span>
                      </td>
                      <td className="px-6 py-4">
                        <Badge color={STATUS_COLOR[inv.status]}>{inv.status}</Badge>
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium whitespace-nowrap">
                        {inv.status !== 'PAID' && (
                          <button onClick={() => markPaid(inv)} className="text-primary-dark hover:text-ink mr-3" title="Mark as Paid">
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        )}
                        <button onClick={() => toast.info('This is a demo — PDF export isn’t wired up yet.')} className="text-slate-400 hover:text-ink mr-3" title="Download PDF">
                          <Download className="w-4 h-4" />
                        </button>
                        <button onClick={() => setToDelete(inv)} className="text-red-600 hover:opacity-80" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <Pagination
          page={page}
          pageCount={pageCount}
          pageSize={pageSize}
          totalItems={totalItems}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New GST Invoice" icon={Receipt} size="lg">
        <form onSubmit={handleCreate}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Company"
              value={form.companyName}
              onChange={(e) => setForm({ ...form, companyName: e.target.value })}
              options={
                companies.length
                  ? companies.map((c) => ({ value: c.name, label: c.name }))
                  : [{ value: '', label: 'No companies yet' }]
              }
            />
            <Input
              label="Company GSTIN"
              value={form.gstin}
              onChange={(e) => {
                setForm({ ...form, gstin: e.target.value });
                setGstinError('');
              }}
              placeholder="27AAAPL1234C1ZV"
              className="uppercase"
            />
          </div>
          {gstinError && <p className="text-xs text-red-600 -mt-3 mb-4">{gstinError}</p>}

          <Select
            label="GST Rate"
            value={form.gstRate}
            onChange={(e) => setForm({ ...form, gstRate: Number(e.target.value) })}
            options={GST_RATES.map((r) => ({ value: r, label: `${r}%` }))}
          />

          <div className="mb-2 flex items-center justify-between">
            <label className="block text-sm font-medium text-slate-700">Line Items</label>
            <button type="button" onClick={addLineItem} className="text-xs text-primary-dark hover:text-ink font-medium flex items-center gap-1">
              <Plus className="w-3.5 h-3.5" /> Add Line Item
            </button>
          </div>
          <div className="space-y-2 mb-4">
            {form.lineItems.map((li) => (
              <div key={li.id} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Description"
                  value={li.description}
                  onChange={(e) => updateLineItem(li.id, { description: e.target.value })}
                  required
                  className="flex-1 px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-primary focus:border-primary outline-none"
                />
                <div className="relative w-36">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">₹</span>
                  <input
                    type="number"
                    min={0}
                    placeholder="Amount"
                    value={li.amount}
                    onChange={(e) => updateLineItem(li.id, { amount: Math.max(0, Number(e.target.value)) })}
                    className="w-full pl-7 pr-2 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-primary focus:border-primary outline-none"
                  />
                </div>
                {form.lineItems.length > 1 && (
                  <button type="button" onClick={() => removeLineItem(li.id)} className="text-slate-400 hover:text-red-600 shrink-0">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="bg-slate-50 rounded-lg p-4 space-y-1.5 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span>₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-slate-500 text-xs">
              <span>CGST ({form.gstRate / 2}%)</span>
              <span>₹{cgst.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-slate-500 text-xs">
              <span>SGST ({form.gstRate / 2}%)</span>
              <span>₹{sgst.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-slate-900 font-bold pt-1.5 border-t border-slate-200">
              <span>Total</span>
              <span>₹{total.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="flex justify-end space-x-2 mt-6 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Invoice</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={confirmDelete}
        title={`Delete invoice "${toDelete?.number}"?`}
        description="This cannot be undone."
        confirmLabel="Delete Invoice"
      />
    </div>
  );
};

export default Billing;
