import React, { createContext, useContext, useState, useEffect } from 'react';
import { MOCK_USERS, MOCK_LEADS, MOCK_COMPANIES, MOCK_AUTHORITIES, MOCK_ROLES, MOCK_NOTIFICATIONS } from '../services/mockData';
import { useUpdateUser, useUsers } from '../hooks/useUsers';
import { useAuthorities, useSaveAuthority } from '../hooks/useAuthorities';
import { useDeleteRole, useRoles, useSaveRole, useUpdateRole } from '../hooks/useRoles';
import { useAssignLead, useLeads } from '../hooks/useLeads';
import { fetchAccessToken, refreshAccessToken } from '../utils/system-utils';
import { jwtDecode } from 'jwt-decode';
import {useSaveUser} from '../hooks/useUsers';

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
  const [loading, setLoading] = useState(true);
  const [backendError, setBackendError] = useState(false);

  const { data: crm_users, isLoading: usersLoading } = useUsers(accessToken);
  const { data: crm_authorities, isLoading: authoritiesLoading } = useAuthorities(accessToken);
  const { data: crm_roles, isLoading: rolesLoading } = useRoles(accessToken);
  const { data: leadsData, isLoading: leadsLoading } = useLeads(accessToken);

  const createUser = useSaveUser();
  const createRole = useSaveRole();
  const createAuthority = useSaveAuthority();
  const updateExistingUser = useUpdateUser();
  const updateExistingRole = useUpdateRole();
  const assignLead = useAssignLead();
  const deleteExistingRole = useDeleteRole();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem("access_token");

        if (isTokenExpired(storedToken)) {
          try {
            if(storedToken) {
              const data = await refreshAccessToken();
              const newToken = data.accessToken;

              localStorage.setItem("access_token", newToken);

              const userFromToken = jwtDecode(newToken);

              setAccessToken(newToken);
              setUser(userFromToken);
            }
          } catch (error) {
            // refresh token expired
            localStorage.removeItem("access_token");
            setUser(null);
            setAccessToken(null);
          }
        } else {
          const userFromToken = jwtDecode(storedToken);

          setUser(userFromToken);
          setAccessToken(storedToken);
        }
      } catch (err) {
        console.error("Auth initialization failed:", err);
      } finally {
        setAuthLoading(false);
      }
    };

    initializeAuth();
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem('access_token', accessToken);
    } else {
      localStorage.removeItem('access_token');
    }
  }, [user]);

  useEffect(() => {
      console.log("PROFILE_ACTIVE: ", import.meta.env.VITE_PROFILE_ACTIVE);
      if(!usersLoading && !rolesLoading && !authoritiesLoading && !leadsLoading && crm_users && crm_authorities && crm_roles && leadsData) {
        setUsers(crm_users);
        setLeads(leadsData);
        setCompanies(MOCK_COMPANIES);
        setAuthorities(crm_authorities);
        setRoles(crm_roles);
        setNotifications(MOCK_NOTIFICATIONS);
        setLoading(false);
      }

  }, [crm_users, crm_authorities, crm_roles, leadsData]);

  const isTokenExpired = (token) => {
    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000; // in seconds
      return decoded.exp < currentTime;
    } catch (error) {
      return true; // If token is invalid, treat it as expired
    }
  }

  const login = async (authenticationObject) => {
    if (backendError) throw new Error('Backend Down');

    const token = await fetchAccessToken(authenticationObject);
    if (token && token.accessToken) {
      setAccessToken(token.accessToken);
      const userFromToken = jwtDecode(token.accessToken);
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

  const addUser = (newUser) => {
    const savedUser = createUser.mutate({userData: newUser, accessToken: accessToken});
  };

  const updateUser = (id, updates) => {
    const updatedUser = updateExistingUser.mutate({userId: id, userData: updates});
  };

  const addLead = (lead) => setLeads([...leads, lead]);
  const updateLead = (id, userId) => {
    assignLead.mutate({ leadId: id, userId: userId });
    setLeads(leads.map((l) => (l.id === id ? { ...l, assignedTo: userId } : l)));
  };

  const addAuthority = (auth) => {
    const savedAuth = createAuthority.mutate({authority: auth, accessToken: accessToken});
  };
  const addCompany = (comp) => setCompanies([...companies, comp]);
  const addRole = (role) => {
    const savedRole = createRole.mutate({roleData: role, accessToken: accessToken});
  };

  const updateRole = (id, updates) => {
    const updatedRole = updateExistingRole.mutate({roleId: id, roleData: updates, accessToken: accessToken});
  };

  const deleteRole = (id) => {
    const deletedRole = deleteExistingRole.mutate({roleId: id, accessToken: accessToken});
  };

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
        updateRole,
        deleteRole,
        addLead,
        updateLead,
        addAuthority,
        addCompany,
        addRole,
        sendNotification,
        markNotificationAsRead,
        accessToken,
        loading,
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
