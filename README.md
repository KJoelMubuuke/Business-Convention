# Business Convention Registration System

> A secure, role-based, real-time registration and attendance tracking portal built for large-scale conventions.

## 🎯 The Problem
Managing large-scale business conventions traditionally involves chaotic paper records, fragmented spreadsheets, manual reconciliation of cash and mobile money payments, and slow check-in queues. This leads to data loss, inaccurate financial reporting, long wait times for attendees, and zero real-time visibility into the success of the event.

## 💡 The Solution
The **Business Convention Registration System** is a unified, production-ready web application designed to digitize the entire attendee lifecycle. From the registration desk to executive reporting, it provides:
- **Instant Data Capture:** Fast, validated entry of attendee details (Name, Church, District, Occupation).
- **Automated Fee Logic:** Automatically handles dynamic pricing (e.g., Resident vs. Non-Resident rates).
- **Real-Time Analytics:** A live dashboard showing total revenue collected, outstanding balances, gender demographics, and check-in status.
- **Secure Access Control:** A strict 3-tier role system ensures data integrity and privacy.

---

## 🏗️ Architecture & Tech Stack

This project is built using modern, edge-ready web technologies ensuring high performance and security:

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router, Server Actions, React Server Components)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) for a fully responsive, modern UI.
- **Database & Auth:** [Supabase](https://supabase.com/) (PostgreSQL + GoTrue Authentication + Row Level Security)
- **Validation:** [Zod](https://zod.dev/) for strict, type-safe form validation.
- **Icons & Assets:** Custom UI components utilizing clean design aesthetics.

---

## 🛡️ Role-Based Access Control (RBAC)

The system employs a strict 3-tier authorization model:

| Role | Privileges | Target User |
| :--- | :--- | :--- |
| **System Admin** | **Full Access.** Can create conventions, manage lookup data (districts, churches), promote/demote staff roles, view dashboards, and delete records. | IT Administrators & Core Organizers |
| **Supervisor** | **Analytics & Oversight.** Can view the live analytics dashboard, monitor check-ins, and view all registration records. Cannot alter system settings or delete users. | Event Managers & Finance Team |
| **Registerer** | **Data Entry.** Can only access the registration form and view/edit the specific records they have personally captured. | Registration Desk Staff |

*Note: All staff members sign in via a unified `/login` portal. The UI dynamically adapts based on their assigned role.*

---

## ✨ Key Features

1. **Intelligent Registration Flow**
   - Autocomplete fields for Churches, Districts, and Occupations to maintain clean data.
   - Immediate feedback on payment status (Cash, MoMo, Bank, Waived).

2. **Live Executive Dashboard**
   - Visual breakdown of payment methods, top districts, and participating churches.
   - Financial tracking (Expected Revenue vs. Collected Revenue).

3. **Secure Authentication**
   - Managed via Supabase Auth with secure, server-side HTTP-only cookies (`@supabase/ssr`).
   - Protected routes and strictly typed server actions.

4. **Data Export**
   - 1-click CSV export of all attendee records for external auditing or badging systems.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18.x or higher
- A Supabase Project

### Environment Setup
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Database Initialization
Navigate to the Supabase SQL Editor and run the provided `supabase/schema.sql` file. This will automatically:
- Set up the PostgreSQL tables (`profiles`, `conventions`, `attendees`, `lookups`).
- Enable Row Level Security (RLS) policies.
- Create the authentication triggers for automatic profile generation.

### Local Development
```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```
Navigate to `http://localhost:3000`. 

---

## 🔒 Security Notes
- **Row Level Security (RLS):** Enabled on all tables. Queries are scoped to the authenticated user's role directly at the database level.
- **Server Actions:** All database mutations occur securely on the server, avoiding exposed API routes.

---
*Built for the 12th Business Convention 2026.*
