import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import { createServer } from 'miragejs';
import {updatedUser, users} from './mirage-server/mocks/users';
import {authorities, roleAuthorities} from './mirage-server/mocks/authorities';
import {leads} from './mirage-server/mocks/leads';
import {roles} from './mirage-server/mocks/roles';
import { accessToken, refreshToken } from './mirage-server/mocks/accesstoken';

const queryClient = new QueryClient();

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

if (`${import.meta.env.VITE_PROFILE_ACTIVE}`.match('local')) {
  console.log("Starting Mirage Server..");

  createServer({
    routes(){
      this.urlPrefix="http://localhost:8080"
      this.namespace="api";
      this.get("/user/admin/users", users);
      this.post("/user/auth/login", accessToken);
      this.post("/user/auth/refresh", refreshToken);
      this.post("/user/admin/users", {})
      this.get("/user/admin/authorities", authorities);
      this.get("/user/admin/roles", roles);
      this.get("/user/admin/authorities/:roleId", roleAuthorities);
      this.post("/user/admin/authorities", {});
      this.post("/user/admin/roles", {});
      this.put("/user/admin/users/:userId", updatedUser);
      this.get("/handle-leads/admin/leads", leads);
      this.post("/handle-leads/admin/leads", {});
    }
  })
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
);
