import React, { useEffect, useState } from 'react';
import { Card, Button, Input } from '../components/ui';
import { useToast } from '../context/ToastContext';
import { Palette, Upload, RotateCcw, LayoutDashboard, Users, Briefcase, Building2 } from 'lucide-react';

const STORAGE_KEY = 'thriveq_white_label';

const DEFAULTS = {
  companyName: 'thriveQ',
  primaryColor: '#6fc935',
  subdomain: 'yourcompany',
  logoDataUrl: null,
};

const loadSaved = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : DEFAULTS;
  } catch {
    return DEFAULTS;
  }
};

const Settings = () => {
  const toast = useToast();
  const [form, setForm] = useState(loadSaved);

  useEffect(() => {
    document.title = `${form.companyName || 'thriveQ'} CRM`;
  }, [form.companyName]);

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => setForm((f) => ({ ...f, logoDataUrl: evt.target.result }));
    reader.readAsDataURL(file);
  };

  const handleSave = (e) => {
    e.preventDefault();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
    toast.success('Branding saved successfully', 'Changes are visible in the preview below.');
  };

  const handleReset = () => {
    setForm(DEFAULTS);
    localStorage.removeItem(STORAGE_KEY);
    toast.info('Branding reset to thriveQ defaults');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Palette className="w-6 h-6 text-primary-dark" /> White Label
        </h1>
        <p className="text-sm text-slate-500 mt-1">Customize the CRM's branding for your workspace or resale clients.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <Card title="Branding">
          <form onSubmit={handleSave}>
            <Input
              label="Company / Workspace Name"
              value={form.companyName}
              onChange={(e) => setForm({ ...form, companyName: e.target.value })}
              placeholder="thriveQ"
            />

            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-1">Primary Brand Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={form.primaryColor}
                  onChange={(e) => setForm({ ...form, primaryColor: e.target.value })}
                  className="w-10 h-10 rounded-lg border border-slate-200 cursor-pointer"
                />
                <input
                  type="text"
                  value={form.primaryColor}
                  onChange={(e) => setForm({ ...form, primaryColor: e.target.value })}
                  className="flex-1 px-3 py-2 text-sm font-mono bg-white border border-slate-200 rounded-lg focus:ring-primary focus:border-primary outline-none"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-1">Logo</label>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                  {form.logoDataUrl ? (
                    <img src={form.logoDataUrl} alt="Logo preview" className="w-full h-full object-cover" />
                  ) : (
                    <Upload className="w-5 h-5 text-slate-400" />
                  )}
                </div>
                <label className="cursor-pointer">
                  <span className="text-sm px-3 py-2 rounded-full border border-slate-300 text-slate-600 hover:border-ink hover:text-ink transition-colors inline-block">
                    Upload Image
                  </span>
                  <input type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
                </label>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-1">Subdomain</label>
              <div className="flex items-center rounded-lg border border-slate-200 overflow-hidden focus-within:ring-2 focus-within:ring-primary">
                <input
                  type="text"
                  value={form.subdomain}
                  onChange={(e) => setForm({ ...form, subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                  className="flex-1 px-3 py-2 text-sm outline-none"
                  placeholder="yourcompany"
                />
                <span className="px-3 py-2 text-sm text-slate-400 bg-slate-50 border-l border-slate-200">.thriveq.in</span>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={handleReset}>
                <RotateCcw className="w-4 h-4 mr-2 inline" /> Reset
              </Button>
              <Button type="submit">Save Branding</Button>
            </div>
          </form>
        </Card>

        <div className="space-y-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">Live Preview</p>
          <div className="rounded-2xl overflow-hidden shadow-[0_8px_40px_rgba(0,0,0,0.1),0_2px_6px_rgba(0,0,0,0.06)] border border-slate-100">
            <div className="flex h-72" style={{ backgroundColor: '#f8fafc' }}>
              <div className="w-44 shrink-0 p-4 flex flex-col" style={{ backgroundColor: '#111111' }}>
                <div className="flex items-center gap-2 mb-6">
                  {form.logoDataUrl ? (
                    <img src={form.logoDataUrl} alt="" className="w-6 h-6 rounded object-cover" />
                  ) : (
                    <div className="w-6 h-6 rounded" style={{ backgroundColor: form.primaryColor }} />
                  )}
                  <span className="text-white text-sm font-bold truncate">{form.companyName || 'thriveQ'}</span>
                </div>
                {[
                  { icon: LayoutDashboard, label: 'Dashboard', active: true },
                  { icon: Users, label: 'Users' },
                  { icon: Briefcase, label: 'Leads' },
                  { icon: Building2, label: 'Companies' },
                ].map(({ icon: Icon, label, active }) => (
                  <div
                    key={label}
                    className="flex items-center gap-2 text-xs px-2 py-2 rounded-lg mb-1"
                    style={active ? { backgroundColor: form.primaryColor, color: '#111111', fontWeight: 700 } : { color: 'rgba(255,255,255,0.5)' }}
                  >
                    <Icon className="w-3.5 h-3.5" /> {label}
                  </div>
                ))}
              </div>
              <div className="flex-1 p-4">
                <div className="bg-white rounded-xl shadow-sm p-3 mb-3">
                  <div className="h-2 w-16 rounded bg-slate-200 mb-2" />
                  <div className="h-4 w-10 rounded bg-slate-300" />
                </div>
                <div className="bg-white rounded-xl shadow-sm p-3 h-28" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl overflow-hidden shadow-[0_8px_40px_rgba(0,0,0,0.1),0_2px_6px_rgba(0,0,0,0.06)] border border-slate-100 p-6 bg-white text-center">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3"
              style={{ backgroundColor: `${form.primaryColor}22` }}
            >
              {form.logoDataUrl ? (
                <img src={form.logoDataUrl} alt="" className="w-6 h-6 rounded object-cover" />
              ) : (
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: form.primaryColor }} />
              )}
            </div>
            <p className="font-bold text-slate-900 text-sm">Sign in to {form.companyName || 'thriveQ'}</p>
            <div className="mt-3 h-9 rounded-full text-white text-xs font-semibold flex items-center justify-center" style={{ backgroundColor: '#111111' }}>
              Sign In
            </div>
            <p className="text-[10px] text-slate-400 mt-3">{form.subdomain || 'yourcompany'}.thriveq.in</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
