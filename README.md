# Enterprise Dashboard

A business analytics dashboard built with Next.js, TypeScript, Node.js, and MongoDB, featuring Microsoft Dataverse integration for real-time data visualization and reporting.

## 🚀 Features

- **Real-time Analytics Dashboard** - KPIs, revenue charts, opportunity pipeline
- **Microsoft Dataverse Integration** - Direct connection to CRM data (Accounts, Contacts, Opportunities)
- **RESTful APIs** - Full CRUD operations via Next.js API routes
- **MongoDB Storage** - Report persistence and analytics caching
- **Modern UI** - Tailwind CSS with responsive design
- **Interactive Charts** - Revenue trends, opportunity stages, top accounts

## 📋 Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Microsoft Dataverse environment with:
  - Azure AD App Registration
  - Dataverse API permissions

## 🛠️ Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.local.example` to `.env.local` and fill in your credentials:

```bash
cp .env.local.example .env.local
```

Required variables:
- `MONGODB_URI` - MongoDB connection string
- `AZURE_TENANT_ID` - Azure AD tenant ID
- `AZURE_CLIENT_ID` - Azure AD app client ID
- `AZURE_CLIENT_SECRET` - Azure AD app client secret
- `DATAVERSE_URL` - Your Dataverse environment URL (e.g., `https://your-org.crm.dynamics.com`)

### 3. Azure AD Setup

1. Go to [Azure Portal](https://portal.azure.com) → Azure Active Directory
2. Register a new application
3. Add API permissions:
   - Dynamics CRM → `user_impersonation`
   - Or configure for app-only access with `Application` permissions
4. Create a client secret
5. Note the Tenant ID, Client ID, and Secret

### 4. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── analytics/      # Dashboard metrics endpoint
│   │   ├── dataverse/      # Dataverse entity endpoints
│   │   │   ├── accounts/
│   │   │   ├── contacts/
│   │   │   └── opportunities/
│   │   └── reports/        # Report CRUD operations
│   └── dashboard/          # Dashboard pages
│       ├── accounts/
│       ├── contacts/
│       ├── opportunities/
│       ├── reports/
│       └── settings/
├── components/
│   ├── dashboard/          # Dashboard-specific components
│   └── ui/                 # Reusable UI components
├── lib/
│   ├── dataverse.ts        # Dataverse client with OAuth
│   └── mongodb.ts          # MongoDB connection & models
└── types/
    └── index.ts            # TypeScript interfaces
```

## 🔌 API Endpoints

### Dataverse
- `GET /api/dataverse/accounts` - List accounts
- `POST /api/dataverse/accounts` - Create account
- `GET /api/dataverse/contacts` - List contacts
- `GET /api/dataverse/opportunities` - List opportunities

### Analytics
- `GET /api/analytics` - Dashboard metrics (cached)

### Reports
- `GET /api/reports` - List reports
- `POST /api/reports` - Create report

## 🎨 Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **Database**: MongoDB with Mongoose
- **Dataverse**: MSAL.js for OAuth, Axios for REST API

## 📊 Dashboard Features

1. **Overview** - Key metrics (accounts, contacts, opportunities, revenue)
2. **Revenue Chart** - 12-month trend visualization
3. **Opportunity Pipeline** - By stage (Open/Won/Lost)
4. **Top Accounts** - Revenue leaderboard

## 🏗️ Architecture

This dashboard follows a **hybrid data architecture** pattern:

### Data Flow

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Frontend      │────▶│   Next.js API   │────▶│   Dataverse     │
│   (React)       │     │   Routes        │     │   (CRM Data)    │
└─────────────────┘     └────────┬────────┘     └─────────────────┘
                                 │
                                 ▼
                        ┌─────────────────┐
                        │    MongoDB      │
                        │  (Cache + App)  │
                        └─────────────────┘
```

### Why Two Data Sources?

| Component | Role | Data Stored |
|-----------|------|-------------|
| **Microsoft Dataverse** | Primary source of truth | Accounts, Contacts, Opportunities (CRM data) |
| **MongoDB** | Cache + App-specific data | Analytics cache, Custom reports |

### Design Rationale

1. **Enterprise Integration**: In real-world scenarios, business data lives in existing systems like Dynamics 365 or Salesforce. We integrate with these rather than duplicating data.

2. **Performance (Caching)**: Analytics queries across large datasets are expensive. We cache computed metrics in MongoDB with a 5-minute TTL to reduce API calls.

3. **CQRS Pattern**: Command Query Responsibility Segregation — reads come from the cache for speed, writes go to the source of truth for consistency.

4. **Flexibility**: Application-specific features (reports, user preferences) that don't belong in the CRM are stored in MongoDB.

### Demo Mode

For development without Azure credentials, set `DEMO_MODE=true` in `.env.local`. This uses mock data that simulates the Dataverse API responses.

## 🔒 Security

- OAuth 2.0 client credentials flow for Dataverse
- Environment variables for all secrets
- API routes run server-side only

## 📝 License

MIT
