import React, { createContext, useContext, useState, useEffect } from 'react';
import { MOCK_USERS, MOCK_LEADS, MOCK_COMPANIES, MOCK_AUTHORITIES, MOCK_ROLES, MOCK_NOTIFICATIONS } from '../services/mockData';
import { useUsers } from '../hooks/useUsers';
import { useAuthorities } from '../hooks/useAuthorities';
import { useRoles } from '../hooks/useRoles';
import { fetchAccessToken } from '../utils/system-utils';
import { jwtDecode } from 'jwt-decode';

const AppContext = createContext(undefined);

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState();

  const [users, setUsers] = useState([]);
  const [leads, setLeads] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [authorities, setAuthorities] = useState([]);
  const [roles, setRoles] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [accessToken, setAccessToken] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [backendError, setBackendError] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      const userFromToken = jwtDecode(token);
      setUser(userFromToken);
      setAccessToken(token);
      setAuthLoading(false);
    } else {
      setAuthLoading(false);
    }
  }, [])

  useEffect(() => {
    if (user) {
      localStorage.setItem('access_token', accessToken);
    } else {
      localStorage.removeItem('access_token');
    }
  }, [user]);

  const { data: crm_users, isLoading: usersLoading } = useUsers(accessToken);
  const { data: crm_authorities, isLoading: authoritiesLoading } = useAuthorities(accessToken);
  const { data: crm_roles, isLoading: rolesLoading } = useRoles(accessToken);

  useEffect(() => {
      console.log("PROFILE_ACTIVE: ", import.meta.env.VITE_PROFILE_ACTIVE);
      if(!usersLoading && crm_users && crm_authorities && crm_roles) {
        setUsers(crm_users);
        setLeads(MOCK_LEADS);
        setCompanies(MOCK_COMPANIES);
        setAuthorities(crm_authorities);
        setRoles(crm_roles);
        setNotifications(MOCK_NOTIFICATIONS);
      }

  }, [crm_users, crm_authorities, crm_roles]);

  const login = async (authenticationObject) => {
    if (backendError) throw new Error('Backend Down');
    console.log("authenticationObject: ", authenticationObject);

    const token = await fetchAccessToken(authenticationObject);
    if (token && token.jwtToken) {
      setAccessToken(token.jwtToken);
      const userFromToken = jwtDecode(token.jwtToken);
      setUser(userFromToken);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    setAccessToken(null);
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
        accessToken,
        loading: usersLoading,
        authLoading
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
