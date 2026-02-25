import React from 'react';
import { useApp } from '../context/AppContext';
import { Card } from '../components/ui';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { DollarSign, Users, Briefcase, TrendingUp } from 'lucide-react';

const Dashboard = () => {
  const { user, leads, companies } = useApp();

  const totalLeads = leads.length;
  const wonLeads = leads.filter((l) => l.status === 'WON').length;
  const pendingLeads = leads.filter((l) => l.status !== 'WON' && l.status !== 'LOST').length;
  const totalRevenue = leads.filter((l) => l.status === 'WON').reduce((acc, l) => acc + l.value, 0);

  const statusData = [
    { name: 'New', value: leads.filter((l) => l.status === 'NEW').length },
    { name: 'Contacted', value: leads.filter((l) => l.status === 'CONTACTED').length },
    { name: 'Qualified', value: leads.filter((l) => l.status === 'QUALIFIED').length },
    { name: 'Won', value: leads.filter((l) => l.status === 'WON').length },
    { name: 'Lost', value: leads.filter((l) => l.status === 'LOST').length },
  ];
  const COLORS = ['#3b82f6', '#8b5cf6', '#eab308', '#22c55e', '#ef4444'];

  const companyRevenueData = companies.map((c) => ({
    name: c.name,
    revenue: c.annualRevenue,
  }));

  const StatsCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white p-6 rounded-lg shadow border-l-4" style={{ borderColor: color }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
        </div>
        <div className="p-3 rounded-full bg-slate-100">
          <Icon className="w-6 h-6" style={{ color: color }} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">
          {user?.role?.name === 'SUPERUSER'
            ? 'Executive Overview'
            : user?.role?.name === 'ADMIN'
            ? 'Admin Dashboard'
            : 'My Work'}
        </h1>
        <span className="text-sm text-slate-500">Welcome back, {user?.username}</span>
      </div>

      {(user?.role?.name === 'ADMIN' || user?.role?.name === 'SUPERUSER') && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard title="Total Leads" value={totalLeads} icon={Users} color="#3b82f6" />
          <StatsCard title="Pipeline Value" value={`$${(totalRevenue / 1000).toFixed(1)}k`} icon={DollarSign} color="#22c55e" />
          <StatsCard title="Pending Actions" value={pendingLeads} icon={Briefcase} color="#eab308" />
          <StatsCard title="Conversion Rate" value={`${((wonLeads / totalLeads) * 100).toFixed(0)}%`} icon={TrendingUp} color="#8b5cf6" />
        </div>
      )}

      {user?.role?.name === 'EMPLOYEE' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatsCard title="My Assigned Leads" value={leads.filter((l) => l.assignedToUserId === user.id).length} icon={Users} color="#3b82f6" />
          <StatsCard title="My Wins" value={leads.filter((l) => l.assignedToUserId === user.id && l.status === 'WON').length} icon={DollarSign} color="#22c55e" />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Lead Distribution">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {user?.role?.name === 'SUPERUSER' && (
          <Card title="Company Revenue Overview">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={companyRevenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(val) => `$${val / 1000}k`} />
                  <Tooltip formatter={(val) => `$${val.toLocaleString()}`} />
                  <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}

        {user?.role?.name !== 'SUPERUSER' && (
          <Card title="Recent Activity">
            <div className="space-y-4">
              {leads.slice(0, 3).map((lead) => (
                <div key={lead.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                  <div>
                    <p className="font-medium text-slate-800">{lead.companyName}</p>
                    <p className="text-xs text-slate-500">Updated status to {lead.status}</p>
                  </div>
                  <span className="text-xs text-slate-400">{new Date().toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
