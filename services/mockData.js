export const MOCK_AUTHORITIES = [
  { id: '1', name: 'READ_ALL', description: 'Can read all data' },
  { id: '2', name: 'WRITE_LEADS', description: 'Can edit leads' },
  { id: '3', name: 'MANAGE_USERS', description: 'Can manage users' },
  { id: '4', name: 'VIEW_FINANCE', description: 'Can view financial data' },
  { id: '5', name: 'EXPORT_DATA', description: 'Can export data to Excel/CSV' },
  { id: '6', name: 'IMPORT_DATA', description: 'Can import data' },
  { id: '7', name: 'DELETE_LEADS', description: 'Can permanently delete leads' },
  { id: '8', name: 'ASSIGN_ROLES', description: 'Can assign roles to users' },
  { id: '9', name: 'VIEW_AUDIT_LOGS', description: 'Can view system audit logs' },
  { id: '10', name: 'MANAGE_API_KEYS', description: 'Can manage system API keys' },
  { id: '11', name: 'VIEW_COMPANIES', description: 'Can view partner companies' },
  { id: '12', name: 'EDIT_COMPANIES', description: 'Can edit company details' },
  { id: '13', name: 'ARCHIVE_DATA', description: 'Can archive old records' },
  { id: '14', name: 'MANAGE_NOTIFICATIONS', description: 'Can send system broadcasts' },
  { id: '15', name: 'VIEW_DASHBOARD_STATS', description: 'Can view high-level dashboard stats' },
  { id: '16', name: 'GENERATE_REPORTS', description: 'Can generate PDF reports' },
  { id: '17', name: 'SEND_EMAILS', description: 'Can send emails via CRM' },
  { id: '18', name: 'MANAGE_BILLING', description: 'Can access billing information' },
  { id: '19', name: 'VIEW_SYSTEM_HEALTH', description: 'Can view server status' },
  { id: '20', name: 'CONFIGURE_SETTINGS', description: 'Can configure global settings' },
];

export const MOCK_ROLES = [
  {
    id: 'r1',
    name: 'SUPERUSER',
    description: 'Full system access',
    authorities: MOCK_AUTHORITIES.map((a) => a.name),
  },
  {
    id: 'r2',
    name: 'ADMIN',
    description: 'Administrator access',
    authorities: ['READ_ALL', 'WRITE_LEADS', 'MANAGE_USERS', 'EXPORT_DATA', 'VIEW_COMPANIES', 'VIEW_DASHBOARD_STATS', 'SEND_EMAILS'],
  },
  {
    id: 'r3',
    name: 'EMPLOYEE',
    description: 'Standard employee access',
    authorities: ['WRITE_LEADS', 'VIEW_DASHBOARD_STATS'],
  },
];

const findRoleByName = (name) => MOCK_ROLES.find((r) => r.name === name);

const buildAuthoritiesForRole = (roleName) => {
  const role = findRoleByName(roleName);
  if (!role) return [];
  return role.authorities
    .map((authName) => MOCK_AUTHORITIES.find((a) => a.name === authName))
    .filter(Boolean)
    .map((a) => ({ id: a.id, name: a.name }));
};

export const MOCK_USERS = [
  {
    id: 'u1',
    username: 'super',
    email: 'super@gmail.com',
    role: (() => {
      const role = findRoleByName('SUPERUSER');
      return role ? { id: role.id, name: role.name } : null;
    })(),
    authorities: buildAuthoritiesForRole('SUPERUSER'),
    accountActive: true,
  },
  {
    id: 'u3',
    username: 'admin',
    email: 'admin@gmail.com',
    role: (() => {
      const role = findRoleByName('ADMIN');
      return role ? { id: role.id, name: role.name } : null;
    })(),
    authorities: buildAuthoritiesForRole('ADMIN'),
    accountActive: true,
  },
  {
    id: 'u4',
    username: 'emp1',
    email: 'emp1@gmail.com',
    role: (() => {
      const role = findRoleByName('EMPLOYEE');
      return role ? { id: role.id, name: role.name } : null;
    })(),
    authorities: buildAuthoritiesForRole('EMPLOYEE'),
    accountActive: false,
  },
  {
    id: 'u5',
    username: 'emp2',
    email: 'emp2@gmail.com',
    role: (() => {
      const role = findRoleByName('EMPLOYEE');
      return role ? { id: role.id, name: role.name } : null;
    })(),
    authorities: buildAuthoritiesForRole('EMPLOYEE'),
    accountActive: true,
  },
];

export const MOCK_LEADS = [
  { id: 'l1', companyName: 'Acme Corp', contactName: 'Alice', email: 'alice@acme.com', value: 50000, status: 'NEW', createdAt: '2023-10-01' },
  { id: 'l2', companyName: 'Globex', contactName: 'Bob', email: 'bob@globex.com', value: 120000, status: 'NEGOTIATION', assignedToUserId: 'u3', createdAt: '2023-10-05' },
  { id: 'l3', companyName: 'Soylent Corp', contactName: 'Charlie', email: 'charlie@soylent.com', value: 75000, status: 'WON', assignedToUserId: 'u3', createdAt: '2023-10-10' },
  { id: 'l4', companyName: 'Umbrella Inc', contactName: 'Dave', email: 'dave@umbrella.com', value: 200000, status: 'CONTACTED', assignedToUserId: 'u4', createdAt: '2023-10-12' },
  { id: 'l5', companyName: 'Stark Ind', contactName: 'Tony', email: 'tony@stark.com', value: 1000000, status: 'QUALIFIED', assignedToUserId: 'u2', createdAt: '2023-10-15' },
];

export const MOCK_COMPANIES = [
  { id: 'c1', name: 'TechSoft', industry: 'Software', annualRevenue: 5000000, associatedSince: '2020-01-01', adminId: 'u2' },
  { id: 'c2', name: 'BuildIt', industry: 'Construction', annualRevenue: 12000000, associatedSince: '2019-05-15', adminId: 'u2' },
  { id: 'c3', name: 'MediCare', industry: 'Healthcare', annualRevenue: 8500000, associatedSince: '2021-08-20', adminId: 'u2' },
];

export const MOCK_NOTIFICATIONS = [
  {
    id: 'n1',
    userId: 'u2',
    from: 'Super Admin',
    message: 'Welcome to the new CRM system. Please review the new leads assigned to your team.',
    isRead: false,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'n2',
    userId: 'u2',
    from: 'System',
    message: 'Monthly revenue reports are ready for download.',
    isRead: false,
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
];
