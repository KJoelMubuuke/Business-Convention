# Business Convention Registration System

**A secure, role-based, real-time registration & attendance tracking portal — built for the 12th Business Convention 2026.**

---

## Overview

Managing a large-scale business convention with paper records and spreadsheets leads to data loss, inaccurate financial reporting, and slow check-in queues. This system eliminates that chaos entirely.

The **Business Convention Registration System** is a production-ready web portal that digitizes the complete attendee lifecycle — from the registration desk to executive financial reporting — in real time.

---

## Features

| Feature | Description |
| :--- | :--- |
| **Intelligent Registration** | Autocomplete for Churches, Districts, and Occupations. Immediate payment status feedback across Cash, MoMo, Bank, and Waived methods. |
| **Automated Fee Logic** | Dynamic pricing engine — automatically applies Resident (UGX 40,000) vs. Non-Resident (UGX 30,000) rates based on attendee type. |
| **Live Executive Dashboard** | Real-time breakdown of revenue collected vs. outstanding, payment method splits, top districts, and check-in status. |
| **Strict Role-Based Access** | A 3-tier privilege model enforced at both the application and database level via Supabase RLS policies. |
| **Secure Authentication** | Server-side HTTP-only session cookies via `@supabase/ssr`. Zero client-side token exposure. |
| **1-Click CSV Export** | Export the full attendee ledger instantly for external auditing or badge printing systems. |

---

## Role-Based Access Control

Access is enforced at three distinct levels. All staff authenticate through a unified `/login` portal — the UI adapts dynamically based on the assigned role.

```
┌─────────────────────────────────────────────────────────────────┐
│  SYSTEM ADMIN  ──  Full platform control                        │
│    ├── Convention & lookup management (districts, churches)     │
│    ├── Staff role promotion / demotion                          │
│    ├── Full dashboard & analytics access                        │
│    └── Delete records and system settings                       │
├─────────────────────────────────────────────────────────────────┤
│  SUPERVISOR  ──  Analytics & Oversight                          │
│    ├── View live analytics dashboard                            │
│    ├── Monitor all check-ins                                    │
│    └── Read-only access to all registration records             │
├─────────────────────────────────────────────────────────────────┤
│  REGISTERER  ──  Data Entry                                     │
│    ├── Access registration form                                 │
│    └── View & edit only their own captured records              │
└─────────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

```
Frontend         Next.js 16 (App Router · Server Actions · RSC)
Styling          Tailwind CSS
Language         TypeScript 5
Database         Supabase (PostgreSQL)
Auth             Supabase GoTrue + @supabase/ssr (HTTP-only cookies)
Validation       Zod (server-side schema enforcement)
Deployment       Cloudflare Pages / Vercel
```

---

## Getting Started

### Prerequisites

- **Node.js** `18.x` or higher
- A **[Supabase](https://supabase.com)** project (free tier works)

### 1. Clone & Install

```bash
git clone https://github.com/KJoelMubuuke/Business-Convention.git
cd Business-Convention
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 3. Initialize the Database

Open the **Supabase SQL Editor** and run `supabase/schema.sql`. This single script provisions:

- All PostgreSQL tables (`profiles`, `conventions`, `attendees`, `lookups`)
- Row Level Security (RLS) policies for every table
- Auth triggers for automatic user profile generation on sign-up

### 4. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Deployment

### Cloudflare Pages

```bash
npm run build:cloudflare
```

| Setting | Value |
| :--- | :--- |
| **Build command** | `npm run build:cloudflare` |
| **Output directory** | `.vercel/output/static` |

Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `NEXT_PUBLIC_SITE_URL` in your Cloudflare Pages environment variables dashboard.

> If `NEXT_PUBLIC_SITE_URL` is omitted, the app automatically falls back to Cloudflare's assigned deployment URL.

### Vercel

Deploy directly via the Vercel dashboard or CLI. The app is fully compatible with Vercel's Next.js runtime out of the box.

---

## Security

- **Row Level Security (RLS):** Enabled on all database tables. Every query is scoped to the authenticated user's role at the PostgreSQL level — not just in application code.
- **Server Actions:** All data mutations execute on the server. No direct API routes are exposed to the client.
- **HTTP-only Cookies:** Auth sessions are stored in server-side cookies, preventing XSS-based token theft.

---

## Project Structure

```
convention/
├── app/
│   ├── (app)/              # Authenticated routes (dashboard, admin, etc.)
│   ├── login/              # Login page
│   ├── signup/             # Sign-up page
│   └── forgot-password/    # Password reset
├── components/             # Shared UI components (NavLink, forms, etc.)
├── lib/
│   └── supabase/           # Supabase client & server utilities
├── supabase/
│   └── schema.sql          # Full database schema & RLS policies
└── public/                 # Static assets
```

---

---

Built with precision for the **12th Business Convention 2026** — *Victory Men Fellowship*
