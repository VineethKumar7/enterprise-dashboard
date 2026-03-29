# Enterprise Dashboard — Next Steps

## 🔐 1. Azure AD Setup (Required)
- [ ] Register app in [Azure Portal](https://portal.azure.com) → Azure Active Directory → App registrations
- [ ] Add API permission: Dynamics CRM → `user_impersonation`
- [ ] Create client secret (copy immediately — shown once)
- [ ] Note: Tenant ID, Client ID, Client Secret

## 🗄️ 2. MongoDB Setup
- [ ] Option A: Local MongoDB (`mongod` running on localhost:27017)
- [ ] Option B: MongoDB Atlas (free tier works)
- [ ] Get connection string

## ⚙️ 3. Environment Configuration
```bash
cd ~/clawd/apps/enterprise-dashboard
cp .env.local.example .env.local
# Edit .env.local with your credentials
```

## 🧪 4. Test & Run
- [ ] `npm run dev` — Start dev server
- [ ] Open http://localhost:3000
- [ ] Verify Dataverse connection (Settings page shows "Connected")
- [ ] Test dashboard loads real data

## 🚀 5. Enhancements (Optional)
- [ ] Add authentication (NextAuth.js)
- [ ] Dark mode toggle (already has UI, needs implementation)
- [ ] Export reports to PDF/Excel
- [ ] Add more Dataverse entities (Leads, Cases, etc.)
- [ ] Real-time WebSocket updates
- [ ] Email notifications for opportunity changes

## 📦 6. Deployment
- [ ] Vercel (recommended for Next.js)
- [ ] Set environment variables in Vercel dashboard
- [ ] Connect custom domain (optional)

---

**Current Status:** ✅ Code complete, awaiting Azure AD + MongoDB configuration
