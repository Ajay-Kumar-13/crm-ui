import React from 'react';
import { useApp } from '../context/AppContext';
import { Card } from '../components/ui';
import { Skeleton } from '../components/Skeleton';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { DollarSign, Users, Briefcase, TrendingUp } from 'lucide-react';

const Dashboard = () => {
  const { user, leads, companies, loading } = useApp();

  const totalLeads = leads.length;
  const wonLeads = leads.filter((l) => l.leadState?.toUpperCase() === 'WON').length;
  const pendingLeads = leads.filter((l) => !['WON', 'LOST'].includes(l.leadState?.toUpperCase())).length;
  const totalRevenue = leads.filter((l) => l.leadState?.toUpperCase() === 'WON').reduce((acc, l) => acc + (l.value || 0), 0);

  const statusData = [
    { name: 'New', value: leads.filter((l) => l.leadState?.toUpperCase() === 'NEW').length },
    { name: 'Contacted', value: leads.filter((l) => l.leadState?.toUpperCase() === 'CONTACTED').length },
    { name: 'Qualified', value: leads.filter((l) => l.leadState?.toUpperCase() === 'QUALIFIED').length },
    { name: 'Won', value: leads.filter((l) => l.leadState?.toUpperCase() === 'WON').length },
    { name: 'Lost', value: leads.filter((l) => l.leadState?.toUpperCase() === 'LOST').length },
  ];
  const COLORS = ['#1a3a8a', '#6d28d9', '#b45309', '#6fc935', '#dc2626'];

  const companyRevenueData = companies.map((c) => ({
    name: c.name,
    revenue: c.annualRevenue,
  }));

  const StatsCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white p-6 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border-l-4" style={{ borderColor: color }}>
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

  const StatsCardSkeleton = () => (
    <div className="bg-white p-6 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border-l-4 border-slate-100">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-7 w-14" />
        </div>
        <Skeleton className="w-12 h-12 rounded-full" />
      </div>
    </div>
  );

  const ChartSkeleton = () => (
    <div className="h-64 flex items-center justify-center">
      <Skeleton className="w-40 h-40 rounded-full" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">
          {user?.roles === 'ROOT'
            ? 'Executive Overview'
            : user?.roles === 'ADMIN'
            ? 'Admin Dashboard'
            : 'My Work'}
        </h1>
        <span className="text-sm text-slate-500">Welcome back, {user?.sub}</span>
      </div>

      {(user?.roles === 'ADMIN' || user?.roles === 'ROOT') && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <StatsCardSkeleton key={i} />)
          ) : (
            <>
              <StatsCard title="Total Leads" value={totalLeads} icon={Users} color="#1a3a8a" />
              <StatsCard title="Pipeline Value" value={`$${(totalRevenue / 1000).toFixed(1)}k`} icon={DollarSign} color="#3a9010" />
              <StatsCard title="Pending Actions" value={pendingLeads} icon={Briefcase} color="#b45309" />
              <StatsCard
                title="Conversion Rate"
                value={totalLeads ? `${((wonLeads / totalLeads) * 100).toFixed(0)}%` : '0%'}
                icon={TrendingUp}
                color="#6d28d9"
              />
            </>
          )}
        </div>
      )}

      {user?.roles === 'EMPLOYEE' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {loading ? (
            <>
              <StatsCardSkeleton />
              <StatsCardSkeleton />
            </>
          ) : (
            <>
              <StatsCard title="My Assigned Leads" value={leads.filter((l) => l.assignedTo === user.id).length} icon={Users} color="#1a3a8a" />
              <StatsCard
                title="My Wins"
                value={leads.filter((l) => l.assignedTo === user.id && l.leadState?.toUpperCase() === 'WON').length}
                icon={DollarSign}
                color="#3a9010"
              />
            </>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Lead Distribution">
          {loading ? (
            <ChartSkeleton />
          ) : (
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
          )}
        </Card>

        {user?.roles === 'ROOT' && (
          <Card title="Company Revenue Overview">
            {loading ? (
              <ChartSkeleton />
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={companyRevenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(val) => `$${val / 1000}k`} />
                    <Tooltip formatter={(val) => `$${val.toLocaleString()}`} />
                    <Bar dataKey="revenue" fill="#6fc935" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>
        )}

        {user?.roles !== 'SUPERUSER' && (
          <Card title="Recent Activity">
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between border-b pb-2 last:border-0">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                ))}
              </div>
            ) : leads.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">No recent activity yet.</p>
            ) : (
              <div className="space-y-4">
                {leads.slice(0, 3).map((lead) => (
                  <div key={lead.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                    <div>
                      <p className="font-medium text-slate-800">{lead.name}</p>
                      <p className="text-xs text-slate-500">Updated status to {lead.leadState}</p>
                    </div>
                    <span className="text-xs text-slate-400">{new Date().toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
