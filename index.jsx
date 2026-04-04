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
      this.get("/admin/users", users);
      this.post("/auth/login", accessToken);
      this.post("/auth/refresh", refreshToken);
      this.post("/admin/users", {})
      this.get("/admin/authorities", authorities);
      this.get("/admin/roles", roles);
      this.get("/admin/authorities/:roleId", roleAuthorities);
      this.post("/admin/authorities", {});
      this.post("/admin/roles", {});
      this.put("/admin/users/:userId", updatedUser);
      this.get("/admin/leads", leads);
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
