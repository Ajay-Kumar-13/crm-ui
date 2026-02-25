import React, { createContext, useContext, useState, useEffect } from 'react';
import { MOCK_USERS, MOCK_LEADS, MOCK_COMPANIES, MOCK_AUTHORITIES, MOCK_ROLES, MOCK_NOTIFICATIONS } from '../services/mockData';
import { useUsers } from '../hooks/useUsers';

const AppContext = createContext(undefined);

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('nexus_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [users, setUsers] = useState([]);
  const [leads, setLeads] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [authorities, setAuthorities] = useState([]);
  const [roles, setRoles] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const [backendError, setBackendError] = useState(false);

  const { data: crm_users } = useUsers();

  useEffect(() => {
    if (user) {
      localStorage.setItem('nexus_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('nexus_user');
    }
  }, [user]);

  useEffect(() => {
    console.log("PROFILE_ACTIVE: ", import.meta.env.VITE_PROFILE_ACTIVE);
    
    if (import.meta.env.VITE_PROFILE_ACTIVE === 'local') {
      setUsers(MOCK_USERS);
      setLeads(MOCK_LEADS);
      setCompanies(MOCK_COMPANIES);
      setAuthorities(MOCK_AUTHORITIES);
      setRoles(MOCK_ROLES);
      setNotifications(MOCK_NOTIFICATIONS);
    } else {
      setUsers(crm_users);
      setLeads(MOCK_LEADS);
      setCompanies(MOCK_COMPANIES);
      setAuthorities(MOCK_AUTHORITIES);
      setRoles(MOCK_ROLES);
      setNotifications(MOCK_NOTIFICATIONS);
    }
  }, [crm_users]);

  const login = async (username) => {
    if (backendError) throw new Error('Backend Down');

    const foundUser = users.find((u) => u.username === username);
    if (foundUser && foundUser.accountActive) {
      setUser(foundUser);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
  };

  const triggerBackendError = () => setBackendError(true);
  const resetBackendError = () => setBackendError(false);

  const addUser = (newUser) => setUsers([...users, newUser]);
  const updateUser = (id, updates) => {
    setUsers(users.map((u) => (u.id === id ? { ...u, ...updates } : u)));
  };

  const addLead = (lead) => setLeads([...leads, lead]);
  const updateLead = (id, updates) => {
    setLeads(leads.map((l) => (l.id === id ? { ...l, ...updates } : l)));
  };

  const addAuthority = (auth) => setAuthorities([...authorities, auth]);
  const addCompany = (comp) => setCompanies([...companies, comp]);
  const addRole = (role) => setRoles([...roles, role]);

  const sendNotification = (toUserId, message) => {
    if (!user) return;
    const newNotif = {
      id: `n-${Date.now()}`,
      userId: toUserId,
      from: user.username || user.email || 'User',
      message,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const markNotificationAsRead = (id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  return (
    <AppContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
        backendError,
        triggerBackendError,
        resetBackendError,
        users,
        leads,
        companies,
        authorities,
        roles,
        notifications,
        addUser,
        updateUser,
        addLead,
        updateLead,
        addAuthority,
        addCompany,
        addRole,
        sendNotification,
        markNotificationAsRead,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
