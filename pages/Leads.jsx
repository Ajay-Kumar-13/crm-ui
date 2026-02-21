import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Card, Button, Badge } from '../components/ui';
import { FileSpreadsheet, Search, UserCheck, X } from 'lucide-react';

const LeadsPage = () => {
  const { leads, users, updateLead, addLead, user } = useApp();
  const [filter, setFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [assignmentModalOpen, setAssignmentModalOpen] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState(null);
  const [userSearchTerm, setUserSearchTerm] = useState('');

  const handleImport = () => {
    alert("Parsing 'leads.xlsx'...\nImported 3 new leads successfully!");
    addLead({
      id: `l-imp-${Date.now()}`,
      companyName: 'Imported Co.',
      contactName: 'John Import',
      email: 'john@import.com',
      value: 15000,
      status: 'NEW',
      createdAt: new Date().toISOString(),
    });
  };

  const filteredLeads = leads.filter((l) => {
    const matchesSearch =
      l.companyName.toLowerCase().includes(filter.toLowerCase()) ||
      l.contactName.toLowerCase().includes(filter.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || l.status === statusFilter;
    const matchesAssignment = user?.role === 'EMPLOYEE' ? l.assignedToUserId === user.id : true;
    return matchesSearch && matchesStatus && matchesAssignment;
  });

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
      default:
        return 'gray';
    }
  };

  const openAssignmentModal = (leadId) => {
    setSelectedLeadId(leadId);
    setUserSearchTerm('');
    setAssignmentModalOpen(true);
  };

  const assignUser = (userId) => {
    if (selectedLeadId) {
      updateLead(selectedLeadId, { assignedToUserId: userId });
      setAssignmentModalOpen(false);
    }
  };

  const availableUsers = users.filter(
    (u) =>
      u.isActive &&
      (u.role === 'EMPLOYEE' || u.role === 'ADMIN') &&
      (u.name.toLowerCase().includes(userSearchTerm.toLowerCase()) || u.username.toLowerCase().includes(userSearchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <h1 className="text-2xl font-bold text-slate-800">{user?.role === 'EMPLOYEE' ? 'My Leads' : 'All Leads'}</h1>
        {(user?.role === 'ADMIN' || user?.role === 'SUPERUSER') && (
          <Button variant="outline" onClick={handleImport}>
            <FileSpreadsheet className="w-4 h-4 mr-2" /> Import Excel
          </Button>
        )}
      </div>

      <Card>
        <div className="flex flex-col md:flex-row gap-4 mb-6 items-center">
          <div className="flex-1 relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search companies or contacts..."
              className="pl-10 w-full h-10 px-3 bg-white text-slate-900 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500 focus:outline-none shadow-sm text-sm"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
          <div className="w-full md:w-48">
            <select
              className="w-full h-10 px-3 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500 focus:outline-none shadow-sm bg-white text-slate-900 text-sm"
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
        </div>

        <div className="overflow-x-auto border rounded-lg">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Lead Info</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Value</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Assigned To</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {filteredLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="text-sm font-semibold text-slate-900">{lead.companyName}</div>
                    <div className="text-sm text-slate-500">{lead.contactName}</div>
                    <div className="text-xs text-slate-400">{lead.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-700">${lead.value.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user?.role === 'EMPLOYEE' ? (
                      <div className="relative">
                        <select
                          value={lead.status}
                          onChange={(e) => updateLead(lead.id, { status: e.target.value })}
                          className="text-xs border-slate-200 bg-white shadow-sm rounded-full py-1 pl-2 pr-6 focus:ring-blue-500 focus:border-blue-500 cursor-pointer appearance-none border"
                          style={{
                            color:
                              getStatusColor(lead.status) === 'green' ? '#15803d' : getStatusColor(lead.status) === 'red' ? '#b91c1c' : '#334155',
                          }}
                        >
                          {['NEW', 'CONTACTED', 'QUALIFIED', 'NEGOTIATION', 'WON', 'LOST'].map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    ) : (
                      <Badge color={getStatusColor(lead.status)}>{lead.status}</Badge>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user?.role === 'ADMIN' || user?.role === 'SUPERUSER' ? (
                      <button
                        onClick={() => openAssignmentModal(lead.id)}
                        className="flex items-center space-x-2 text-sm text-slate-700 hover:text-blue-600 px-3 py-1.5 rounded border border-transparent hover:border-blue-200 hover:bg-blue-50 transition-all"
                      >
                        <UserCheck className="w-4 h-4 text-slate-400" />
                        <span>{users.find((u) => u.id === lead.assignedToUserId)?.name || 'Unassigned'}</span>
                      </button>
                    ) : (
                      <div className="flex items-center">
                        <div className="h-6 w-6 rounded-full bg-slate-200 flex items-center justify-center text-xs text-slate-600 font-bold mr-2">
                          {users.find((u) => u.id === lead.assignedToUserId)?.name?.charAt(0) || '?'}
                        </div>
                        <span className="text-sm text-slate-600">
                          {users.find((u) => u.id === lead.assignedToUserId)?.name || 'Unassigned'}
                        </span>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {filteredLeads.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                    No leads found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {assignmentModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-2xl h-[500px] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-slate-800">Assign Lead</h2>
              <button onClick={() => setAssignmentModalOpen(false)} className="text-slate-500 hover:text-slate-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-4 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search employees by name..."
                className="w-full pl-9 pr-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm outline-none"
                value={userSearchTerm}
                onChange={(e) => setUserSearchTerm(e.target.value)}
                autoFocus
              />
            </div>

            <div className="flex-1 overflow-y-auto border border-slate-100 rounded-md">
              {availableUsers.length > 0 ? (
                availableUsers.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => assignUser(u.id)}
                    className="w-full text-left px-4 py-3 hover:bg-slate-50 border-b border-slate-100 last:border-0 flex items-center justify-between group"
                  >
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold mr-3">
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-800">{u.name}</p>
                        <p className="text-xs text-slate-500">@{u.username} • {u.role}</p>
                      </div>
                    </div>
                    <span className="text-xs text-blue-600 opacity-0 group-hover:opacity-100 font-medium">Assign</span>
                  </button>
                ))
              ) : (
                <div className="p-8 text-center text-slate-500 text-sm">No users found.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadsPage;
