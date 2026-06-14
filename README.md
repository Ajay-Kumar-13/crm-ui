# CRM Web Application — Frontend

A full-stack **Customer Relationship Management (CRM)** system built with React.js and Spring Boot. Designed to streamline sales workflows, contact management, and deal pipeline tracking for enterprise teams.

> **Status:** MVP Complete · Additional features in active development

---

## ✨ Features (MVP — Complete)

- 🔐 **JWT Authentication** with Role-Based Access Control (RBAC) — Admin, Manager, Agent roles
- 📋 **Lead Management** — Create, track, and update leads across the sales pipeline
- 👥 **Contact Management** — Full CRUD for customer contacts
- 📊 **Deal Pipeline** — Visual pipeline for tracking deal stages
- 🔄 **Real-time State Management** — React context for live updates across modules
- 🚀 **Deployed on AWS** — Cost-optimised ECS architecture

## 🔧 In Progress

- Enhanced reporting and analytics dashboard
- Sales pipeline automation
- Activity timeline per contact

---

## 🛠️ Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | React.js, JavaScript, Vite          |
| State Mgmt | React Context API                   |
| Auth       | JWT, RBAC                           |
| Backend    | Spring Boot (separate repo)         |
| Database   | MySQL / PostgreSQL                  |
| DevOps     | Docker, AWS ECS, GitHub Actions CI  |

---

## 📁 Project Structure

```
crm-ui/
├── components/       # Reusable UI components
├── context/          # React context (global state)
├── hooks/            # Custom React hooks
├── pages/            # Route-level page components
├── services/         # API service layer (Axios)
├── utils/            # Helper utilities
└── App.jsx           # Root component & routing
```

---

## 🚀 Getting Started

**Prerequisites:** Node.js 18+

```bash
# 1. Clone the repository
git clone https://github.com/Ajay-Kumar-13/crm-ui.git
cd crm-ui

# 2. Install dependencies
npm install

# 3. Set up environment
cp .env.example .env
# Add your API base URL in .env

# 4. Start development server
npm run dev
```

---

## 🔗 Related Repositories

- [Leads API](https://github.com/Ajay-Kumar-13/Leads-API) — Spring Boot microservice for lead management
- [Users API](https://github.com/Ajay-Kumar-13/Users-API) — Spring Boot microservice for user management

---

## 👤 Author

**Ajay Kumar Pulletikurthi**  
[LinkedIn](https://www.linkedin.com/in/ajay-kumar-pulletikurthi-677b80222/) · [GitHub](https://github.com/Ajay-Kumar-13)
