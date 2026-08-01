import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Card, Button, Input, Select } from '../components/ui';
import { Modal } from '../components/Modal';
import { Pagination } from '../components/Pagination';
import { EmptyState } from '../components/EmptyState';
import { CardSkeleton } from '../components/Skeleton';
import { useToast } from '../context/ToastContext';
import { usePagination } from '../hooks/usePagination';
import { Building2, Plus, User as UserIcon, MessageCircle, Search } from 'lucide-react';

const CompaniesPage = () => {
  const { companies, addCompany, users, sendNotification, loading } = useApp();
  const toast = useToast();
  const [showForm, setShowForm] = useState(false);
  const [newCompany, setNewCompany] = useState({ name: '', industry: '', annualRevenue: 0, adminId: '' });

  const [companySearch, setCompanySearch] = useState('');

  const [messageModalOpen, setMessageModalOpen] = useState(false);
  const [selectedAdminId, setSelectedAdminId] = useState(null);
  const [messageText, setMessageText] = useState('');

  const adminUsers = users.filter((u) => u.role?.name === 'ADMIN');

  const handleAdd = (e) => {
    e.preventDefault();
    if (newCompany.name) {
      addCompany({
        id: `c-${Date.now()}`,
        name: newCompany.name,
        industry: newCompany.industry,
        annualRevenue: Number(newCompany.annualRevenue),
        associatedSince: new Date().toISOString(),
        adminId: newCompany.adminId,
      });
      setShowForm(false);
      setNewCompany({ name: '', industry: '', annualRevenue: 0, adminId: '' });
      toast.success('Company created successfully');
    }
  };

  const openMessageModal = (adminId) => {
    setSelectedAdminId(adminId);
    setMessageText('');
    setMessageModalOpen(true);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (selectedAdminId && messageText) {
      sendNotification(selectedAdminId, messageText);
      setMessageModalOpen(false);
      toast.success('Message sent successfully');
    }
  };

  const filteredCompanies = companies.filter(
    (c) =>
      c.name.toLowerCase().includes(companySearch.toLowerCase()) ||
      c.industry.toLowerCase().includes(companySearch.toLowerCase())
  );

  const {
    page,
    setPage,
    pageSize,
    setPageSize,
    pageCount,
    paginated: pagedCompanies,
    totalItems,
  } = usePagination(filteredCompanies, 9);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold text-slate-800">Partner Companies</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-2 inline" /> New Company
        </Button>
      </div>

      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
        <input
          type="text"
          placeholder="Search companies by name or industry..."
          className="pl-10 w-full h-10 px-3 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-primary focus:border-primary focus:outline-none shadow-sm text-sm"
          value={companySearch}
          onChange={(e) => setCompanySearch(e.target.value)}
        />
      </div>

      {showForm && (
        <Card className="mb-6 bg-slate-50 border border-slate-200">
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Company Name" value={newCompany.name} onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })} required />
              <Input label="Industry" value={newCompany.industry} onChange={(e) => setNewCompany({ ...newCompany, industry: e.target.value })} />
              <Input
                label="Revenue ($)"
                type="number"
                value={newCompany.annualRevenue}
                onChange={(e) => setNewCompany({ ...newCompany, annualRevenue: parseInt(e.target.value) })}
              />
              <Select
                label="Assign Admin Contact"
                value={newCompany.adminId}
                onChange={(e) => setNewCompany({ ...newCompany, adminId: e.target.value })}
                options={[
                  { value: '', label: 'Select an Admin...' },
                  ...adminUsers.map((u) => ({ value: u.id, label: u.username })),
                ]}
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit">Create Company</Button>
            </div>
          </form>
        </Card>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} className="h-48" />
          ))}
        </div>
      ) : pagedCompanies.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No companies found"
          description="Try a different search term, or add your first partner company."
          action={
            !showForm && (
              <Button variant="outline" onClick={() => setShowForm(true)}>
                <Plus className="w-4 h-4 mr-2 inline" /> New Company
              </Button>
            )
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pagedCompanies.map((company) => {
            const adminContact = users.find((u) => u.id === company.adminId);
            return (
              <Card key={company.id} className="hover:shadow-lg transition-shadow flex flex-col h-full">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Building2 className="w-6 h-6 text-primary" />
                  </div>
                  <span className="text-xs text-slate-500 font-mono bg-slate-100 px-2 py-1 rounded">{company.industry}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">{company.name}</h3>
                <p className="text-sm text-slate-500 mb-4">Since {new Date(company.associatedSince).getFullYear()}</p>

                <div className="mt-auto border-t pt-4 space-y-4">
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Annual Revenue</p>
                    <p className="text-xl font-bold text-slate-800">${company.annualRevenue.toLocaleString()}</p>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-lg flex items-center justify-between">
                    <div className="flex items-center">
                      <UserIcon className="w-8 h-8 p-1.5 bg-slate-200 rounded-full text-slate-500 mr-2" />
                      <div>
                        <p className="text-xs text-slate-500 font-semibold">Admin Contact</p>
                        <p className="text-sm text-slate-800">{adminContact ? adminContact.username : 'Unassigned'}</p>
                      </div>
                    </div>
                    {adminContact && (
                      <button
                        onClick={() => openMessageModal(adminContact.id)}
                        className="p-2 text-primary-dark hover:bg-primary/10 rounded-full transition-colors"
                        title="Send Message"
                      >
                        <MessageCircle className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {!loading && (
        <Pagination
          page={page}
          pageCount={pageCount}
          pageSize={pageSize}
          totalItems={totalItems}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          pageSizeOptions={[9, 18, 36]}
        />
      )}

      <Modal
        open={messageModalOpen}
        onClose={() => setMessageModalOpen(false)}
        title="Send Message to Admin"
      >
        <form onSubmit={handleSendMessage}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">Message</label>
            <textarea
              className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
              rows={4}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              required
            ></textarea>
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setMessageModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Send</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CompaniesPage;
