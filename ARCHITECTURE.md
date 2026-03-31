# Enterprise Dashboard - Architecture & Setup Guide

## 📋 Project Overview

**Enterprise Dashboard** is a business analytics platform built with modern web technologies that integrates with **Microsoft Dataverse** (the database behind Dynamics 365 CRM) to provide real-time insights into customer relationships, sales opportunities, and revenue metrics.

### What Problem Does It Solve?

Businesses using Microsoft Dynamics 365 often need custom dashboards that:
- Display KPIs at a glance (total accounts, contacts, opportunities)
- Visualize revenue trends over time
- Track sales pipeline by stage (Open/Won/Lost)
- Show top-performing accounts

This dashboard provides a **modern, responsive web interface** that pulls live data from Dataverse and presents it with interactive charts.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER BROWSER                            │
│                    (Next.js React Frontend)                     │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      NEXT.JS API ROUTES                         │
│              /api/analytics, /api/dataverse/*                   │
│                    (Server-side only)                           │
└─────────────────────────────────────────────────────────────────┘
                    │                       │
                    ▼                       ▼
┌───────────────────────────┐   ┌─────────────────────────────────┐
│        MONGODB            │   │      MICROSOFT DATAVERSE        │
│   (Analytics Cache &      │   │     (CRM Data: Accounts,        │
│    Report Storage)        │   │   Contacts, Opportunities)      │
└───────────────────────────┘   └─────────────────────────────────┘
                                            │
                                            │ OAuth 2.0
                                            ▼
                                ┌─────────────────────────────────┐
                                │      MICROSOFT ENTRA ID         │
                                │    (Azure AD Authentication)    │
                                └─────────────────────────────────┘
```

---

## 🔐 Authentication Flow

### How OAuth 2.0 Client Credentials Flow Works

```
1. Dashboard Backend                    2. Azure AD (Entra ID)
   ─────────────────                       ──────────────────
        │                                         │
        │  POST /oauth2/token                     │
        │  (client_id + client_secret)            │
        │ ───────────────────────────────────────>│
        │                                         │
        │         Access Token (JWT)              │
        │ <───────────────────────────────────────│
        │                                         │
        
3. Dashboard Backend                    4. Microsoft Dataverse
   ─────────────────                       ──────────────────
        │                                         │
        │  GET /api/data/v9.2/accounts            │
        │  Authorization: Bearer <token>          │
        │ ───────────────────────────────────────>│
        │                                         │
        │         JSON Response (CRM Data)        │
        │ <───────────────────────────────────────│
```

### Why This Flow?

- **Client Credentials Flow** = Server-to-server authentication
- No user login required (daemon/background service)
- Secure: Client secret never exposed to browser
- Tokens auto-refresh when expired

---

## 🧩 Component Explanation

### Microsoft Entra ID (Azure AD)

**What it is:** Microsoft's cloud identity service (like Google OAuth, but for Microsoft ecosystem)

**What it does:**
- Authenticates your application
- Issues access tokens (JWT)
- Controls which APIs your app can access
- Manages permissions (scopes)

**Key concepts:**
| Term | Description |
|------|-------------|
| **Tenant** | Your organization's Azure AD instance |
| **App Registration** | Your app's identity in Azure AD |
| **Client ID** | Unique identifier for your app |
| **Client Secret** | Password for your app (keep secure!) |
| **Scope** | What your app is allowed to do |

---

### Microsoft Dataverse

**What it is:** Cloud database that powers Power Platform and Dynamics 365

**What it does:**
- Stores business data (Accounts, Contacts, Opportunities, etc.)
- Provides REST API (OData) for CRUD operations
- Handles security and access control
- Supports complex queries and aggregations

**Key entities we use:**

| Entity | Description | Key Fields |
|--------|-------------|------------|
| **Account** | Companies/Organizations | name, revenue, industry |
| **Contact** | Individual people | firstname, lastname, email |
| **Opportunity** | Sales deals | estimatedvalue, statecode, closedate |

**API Example:**
```http
GET https://org.crm.dynamics.com/api/data/v9.2/accounts?$select=name,revenue&$top=10
Authorization: Bearer eyJ0eXAiOiJKV1Q...
```

---

### MongoDB

**What it is:** NoSQL document database

**What it does in this project:**
- Caches analytics data (reduces Dataverse API calls)
- Stores saved reports
- Enables fast dashboard loading

**Why not just use Dataverse?**
- Dataverse API has rate limits
- Caching improves performance
- Reports need custom storage

---

### Next.js

**What it is:** React framework for full-stack web applications

**What it does:**
- **Frontend:** React components with Server Components
- **Backend:** API routes that run on server
- **Routing:** File-based routing
- **Optimization:** Automatic code splitting, image optimization

**Why Next.js for this project?**
- API routes keep secrets server-side (secure)
- Server Components can fetch data directly
- Great developer experience
- Production-ready out of the box

---

## 🛠️ Setup Instructions

### Prerequisites

- Node.js 18+
- Docker (for MongoDB)
- Microsoft account (personal or work)

### Step 1: MongoDB (Local via Docker)

```bash
docker run -d \
  --name mongodb-dashboard \
  -p 27017:27017 \
  -v mongodb_dashboard_data:/data/db \
  mongo:7.0
```

### Step 2: Power Apps Developer Environment (Free)

1. Go to: https://powerapps.microsoft.com/developerplan/
2. Sign in with Microsoft account
3. Create your developer environment
4. Note your **Dataverse URL**: `https://orgXXXXX.crm.dynamics.com`

### Step 3: Azure AD App Registration

1. Go to: https://portal.azure.com
2. Search "App registrations" → New registration
3. Name: `enterprise-dashboard`
4. After creation, note:
   - **Application (client) ID**
   - **Directory (tenant) ID**

5. Add API permissions:
   - Click "API permissions" → Add permission
   - Select "Dynamics CRM" → `user_impersonation`
   - Click "Grant admin consent"

6. Create client secret:
   - Click "Certificates & secrets"
   - New client secret → Copy the **Value** immediately

### Step 4: Configure Environment

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:
```env
DEMO_MODE=false
MONGODB_URI=mongodb://localhost:27017/enterprise-dashboard
AZURE_TENANT_ID=your-tenant-id
AZURE_CLIENT_ID=your-client-id
AZURE_CLIENT_SECRET=your-client-secret
DATAVERSE_URL=https://your-org.crm.dynamics.com
```

### Step 5: Run

```bash
npm install
npm run dev
```

Open http://localhost:3000

---

## 📊 Features

### Dashboard Overview
- **KPI Cards:** Total Accounts, Contacts, Opportunities, Revenue
- **Revenue Chart:** 12-month trend line chart
- **Pipeline Chart:** Opportunities by stage (Open/Won/Lost)
- **Top Accounts:** Revenue leaderboard

### Entity Management
- View, create, edit Accounts
- View, create, edit Contacts
- View, create, edit Opportunities

### Reports
- Save custom reports
- Analytics caching for performance

---

## 🎯 Demo Mode

When `DEMO_MODE=true`, the dashboard uses realistic mock data:

- 8 German companies (Contoso, Fabrikam, etc.)
- 10 contacts with German names
- 12 opportunities in various stages
- €29M+ total revenue

This allows demonstrating the full UI without Azure/Dataverse setup.

---

## 🔒 Security Considerations

1. **Client secrets** are never exposed to the browser
2. **API routes** run server-side only
3. **Environment variables** store all credentials
4. **OAuth tokens** are short-lived and auto-refreshed
5. **MongoDB** runs locally (no external exposure)

---

## 📚 Tech Stack Summary

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14, React 19, TypeScript |
| Styling | Tailwind CSS |
| Charts | Recharts |
| Icons | Lucide React |
| Backend | Next.js API Routes |
| Database | MongoDB + Mongoose |
| Auth | MSAL.js (Microsoft Authentication Library) |
| CRM | Microsoft Dataverse Web API |

---

## 🎤 Interview Talking Points

1. **"Why Next.js?"**
   > Server Components keep API calls and secrets secure. API routes eliminate the need for a separate backend.

2. **"How does authentication work?"**
   > OAuth 2.0 client credentials flow. The app exchanges its client ID and secret for an access token, then uses that token to call Dataverse APIs.

3. **"Why cache in MongoDB?"**
   > Dataverse has rate limits. Caching frequently-accessed analytics data improves dashboard performance and reduces API calls.

4. **"How would you scale this?"**
   > Add Redis for distributed caching, deploy to Vercel with Edge Functions, use Dataverse webhooks for real-time updates.

5. **"What's Dataverse?"**
   > Microsoft's cloud database that powers Dynamics 365. It stores CRM data like Accounts, Contacts, and Opportunities with built-in security and business logic.

---

*Last updated: March 30, 2026*
