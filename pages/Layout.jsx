import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Building2,
  LogOut,
  Menu,
  ShieldAlert,
  Bell,
} from 'lucide-react';

const Layout = () => {
  const { user, logout, triggerBackendError, notifications, markNotificationAsRead } = useApp();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [expandedNotifId, setExpandedNotifId] = useState(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const myNotifications = notifications.filter((n) => n.userId === user?.id);
  const unreadCount = myNotifications.filter((n) => !n.isRead).length;

  const NavItem = ({ to, icon: Icon, label }) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
          isActive ? 'bg-blue-700 text-white' : 'text-blue-100 hover:bg-blue-800'
        }`
      }
      onClick={() => setSidebarOpen(false)}
    >
      <Icon className="w-5 h-5" />
      <span>{label}</span>
    </NavLink>
  );

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      <div className="md:hidden fixed w-full bg-primary text-white z-20 flex justify-between items-center p-4 shadow-md">
        <span className="font-bold text-xl">Nexus CRM</span>
        <button onClick={() => setSidebarOpen(!sidebarOpen)}><Menu /></button>
      </div>

      <aside
        className={`
        fixed inset-y-0 left-0 z-10 w-64 bg-slate-900 text-white transform transition-transform duration-200 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 shadow-xl
        flex flex-col
      `}
      >
        <div className="p-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-white hidden md:block">Nexus CRM</h1>
        </div>

        <nav className="px-4 space-y-2 mt-4 flex-1">
          <NavItem to="/" icon={LayoutDashboard} label="Dashboard" />

          {(user?.role?.name === 'ADMIN' || user?.role?.name === 'SUPERUSER') && (
            <NavItem to="/users" icon={Users} label="Users & Roles" />
          )}

          <NavItem to="/leads" icon={Briefcase} label={user?.role?.name === 'EMPLOYEE' ? 'My Leads' : 'Leads'} />

          {user?.role?.name === 'SUPERUSER' && (
            <NavItem to="/companies" icon={Building2} label="Companies" />
          )}
        </nav>

        <div className="px-4 py-2 border-t border-slate-800">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="w-full flex items-center justify-between text-blue-100 hover:text-white py-2"
          >
            <div className="flex items-center">
              <Bell className="w-5 h-5 mr-3" />
              <span>Notifications</span>
            </div>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{unreadCount}</span>
            )}
          </button>

          {notificationsOpen && (
            <div className="mt-2 bg-slate-800 rounded-lg p-2 max-h-64 overflow-y-auto">
              {myNotifications.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-2">No notifications</p>
              ) : (
                myNotifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => {
                      markNotificationAsRead(n.id);
                      setExpandedNotifId(expandedNotifId === n.id ? null : n.id);
                    }}
                    className={`text-xs p-2 mb-2 rounded cursor-pointer transition-colors ${
                      n.isRead ? 'bg-slate-700/50 text-slate-400' : 'bg-slate-700 text-white border-l-2 border-blue-500'
                    } hover:bg-slate-700/80`}
                  >
                    <p className="font-bold mb-1 flex justify-between">
                      {n.from}
                      <span className="text-[10px] font-normal opacity-70">{new Date(n.createdAt).toLocaleTimeString()}</span>
                    </p>
                    <p className={`${expandedNotifId === n.id ? '' : 'truncate'}`}>{n.message}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <div className="w-full p-4 border-t border-slate-800">
          <div className="flex items-center space-x-3 mb-4 px-4">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold text-white">
              {user?.username?.charAt(0)?.toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate">{user?.username}</p>
              <p className="text-xs text-slate-400 truncate">{user?.role?.name}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-2 text-sm text-red-400 hover:text-red-300 transition-colors"
          >
            <LogOut className="w-4 h-4 mr-2" /> Sign Out
          </button>

          <button
            onClick={triggerBackendError}
            className="w-full mt-2 flex items-center px-4 py-2 text-xs text-slate-500 hover:text-white transition-colors"
          >
            <ShieldAlert className="w-3 h-3 mr-2" /> Sim. Trap Page
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-4 md:p-8 pt-20 md:pt-8 relative">
        <Outlet />
      </main>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-0 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;
