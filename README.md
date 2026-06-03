# 🏥 AfyaConnect - Smart Hospital Management & Telemedicine System

A comprehensive smart hospital management and telemedicine platform built with **Vite + React + TypeScript**, powered by **Supabase** for patient care, appointment scheduling, electronic medical records, remote consultations, billing, and healthcare analytics.

## 👥 Project Team

### Steve Buamikusu KALALA
**Doctrine and Covenants 93:36:** *The glory of God is intelligence, or, in other words, light and truth.*

### Stephen Omondi Owino
**"The Lord loves effort because effort brings rewards that can't come without it." — Thomas S. Monson.**

---

## ✨ Key Features

### 📱 Core Features
- ✅ **Real Authentication** - Supabase Auth with email/password signup and login
- ✅ **Role-Based Access Control** - Patient, Doctor, Admin dashboards
- ✅ **Appointment Management** - Book, view, and manage appointments
- ✅ **Electronic Health Records (EHR)** - Medical records, consultation notes, reports
- ✅ **Prescription Management** - Track prescriptions and request refills
- ✅ **Laboratory Services** - Lab test management with results tracking
- ✅ **Billing & Invoicing** - Payment tracking and invoice management
- ✅ **Telemedicine** - Video consultation capabilities
- ✅ **AI-Powered Symptom Checker** - Initial health assessment
- ✅ **Pharmacy Services** - Medication tracking and prescriptions

### 🔄 Real-Time Features
- Real-time data synchronization across all pages
- Live appointment status updates
- Instant notification of lab results
- Live prescription refill requests
- Real-time medical record updates

### 🎨 UI/UX
- Modern, responsive design with Tailwind CSS
- Mobile-first approach
- Accessible components using shadcn/ui
- Smooth animations and transitions
- Dark mode ready

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **Vite 6.3.5** | Lightning-fast build tool & dev server |
| **React 18** | UI framework with hooks and context API |
| **TypeScript** | Type-safe development |
| **React Router 7** | Client-side routing |
| **Tailwind CSS** | Utility-first styling |
| **shadcn/ui** | Reusable UI components |
| **Supabase** | PostgreSQL database + authentication |
| **Lucide Icons** | Beautiful SVG icons |

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Supabase Connection Guide](#supabase-connection-guide)
4. [Database Schema](#database-schema)
5. [Running the Application](#running-the-application)
6. [Authentication](#authentication)
7. [Features Overview](#features-overview)
8. [Testing](#testing)
9. [Troubleshooting](#troubleshooting)
10. [Project Structure](#project-structure)

---

## Prerequisites

Before you begin, ensure you have:
- **Node.js** 16+ installed
- **npm** or **pnpm** package manager
- **Supabase Account** (free tier available at https://supabase.com)
- **Git** for version control

---

## Installation

### 1. Clone or Download the Project
```bash
cd Smart-Hospital-Management-Telemedicine-System-
```

### 2. Install Dependencies
```bash
npm install
# or
pnpm install
```

### 3. Environment Configuration
Create or verify your `.env` file in the root directory:
```bash
VITE_SUPABASE_URL="https://oroyltyxqhkobubbfrcr.supabase.co"
VITE_SUPABASE_ANON_KEY="your_supabase_anon_key_here"
```

These credentials are already configured for the AfyaConnect project, but you can replace them with your own Supabase project.

---

# 🏥 Supabase Connection Guide - Complete Setup

## Project Overview

AfyaConnect is **fully configured** to use Supabase as its backend! This guide covers everything you need to get started.

### ✅ What's Already Configured

1. **Supabase Client** - `src/lib/supabase.ts`
   - Initializes the Supabase connection with environment variables
   - Exports client for use throughout the app

2. **Environment Variables** - `.env` file includes:
   - `VITE_SUPABASE_URL` - Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` - Anonymous public key for client access

3. **Database Schema** - `supabase/schema.sql`
   - Defines all 9 tables with proper relationships
   - Includes data types and constraints

4. **Full Setup Script** - `supabase/full-setup.sql`
   - Creates all tables
   - Sets up Row Level Security (RLS) policies
   - Inserts sample data for testing

5. **React Context Providers** - Connected to Supabase:
   - **AuthContext** - User authentication & session management
   - **LaboratoryContext** - Lab test data from `lab_tests` table
   - **BillingContext** - Invoice data from `invoices` table
   - **AppointmentsContext** - Appointment management with real-time updates
   - **PrescriptionsContext** - Prescription tracking with real-time sync
   - **MedicalRecordsContext** - Medical record management with real-time updates

6. **Real-Time Connection Status**
   - Landing page displays real-time Supabase connection status
   - Automatically tests database connectivity

---

## 📋 Step-by-Step Connection Instructions

### Step 1: Verify Your Supabase Credentials ✓

Your `.env` file already contains credentials:
```
VITE_SUPABASE_URL="https://oroyltyxqhkobubbfrcr.supabase.co"
VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**To use a different Supabase project:**
1. Go to https://supabase.com and create a new project
2. Get your project URL and anon key from **Settings** → **API**
3. Replace the values in `.env`

### Step 2: Initialize Your Database

#### Option A: Fresh Setup (Recommended)
1. Sign into https://supabase.com
2. Select your project **AfyaConnect** (or your project name)
3. Go to **SQL Editor** → Click **New Query**
4. Copy the entire content from `supabase/full-setup.sql` file
5. Paste it into the SQL Editor
6. Click **Run** button to execute
7. Wait for completion (should see ✓ success message)

#### Option B: Verify Existing Setup
If you've already set up the database, verify it exists:
1. Go to **SQL Editor** → New Query
2. Run this verification command:
   ```sql
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public';
   ```
3. You should see these 9 tables:
   - ✓ profiles
   - ✓ doctors
   - ✓ patients
   - ✓ appointments
   - ✓ lab_tests
   - ✓ invoices
   - ✓ prescriptions
   - ✓ medical_records
   - ✓ messages

### Step 3: Verify Setup in Supabase Dashboard

1. Go to **Table Editor** in your Supabase dashboard
2. Click on each table to verify data exists:
   - `profiles` - User profiles
   - `doctors` - Doctor information
   - `patients` - Patient information
   - `appointments` - Scheduled appointments
   - `lab_tests` - ⭐ Has sample lab results
   - `invoices` - ⭐ Has sample invoices
   - `prescriptions` - Prescription records
   - `medical_records` - Medical records storage
   - `messages` - Communication logs


## 🚀 Running the Application

### Start Development Server
```bash
npm run dev
# Server runs at http://localhost:5177 (or next available port)
```

### Build for Production
```bash
npm run build
# Creates optimized build in dist/ folder
```

### Preview Production Build
```bash
npm run preview
# Preview the built version locally
```

### What to See

When the app starts, you should see:
1. **Landing Page** loads successfully
2. **Supabase Connection Status** shows one of:
   - 🔄 **Checking** - Connection test in progress
   - ✅ **Supabase Connected!** - Database is working
   - ❌ **Connection Failed** - Check error message and troubleshooting

---

## 🔐 Authentication System

### How Real Authentication Works

The app uses **Supabase Auth** for real user authentication:

#### User Registration (`/register`)
```typescript
// Validates and creates new account
await supabaseSignup(
  email,              // user@example.com
  password,           // 6+ characters
  role,              // 'patient' | 'doctor' | 'admin'
  fullName           // First + Last name
);
```

#### User Login (`/login`)
```typescript
// Authenticates existing user
await supabaseLogin(email, password);
```

### Authentication Flow
1. User fills registration form with details
2. Submit triggers `supabaseSignup()` 
3. Supabase creates auth user and profile
4. User is redirected to login
5. User logs in with email/password
6. Session is stored and user accesses dashboard
7. Session persists across page refreshes

### Role-Based Dashboards
- **Patient Dashboard** - View appointments, medical records, prescriptions
- **Doctor Dashboard** - View patient appointments, manage records
- **Admin Dashboard** - System administration and analytics

### Session Management
- Automatic session restoration on page reload
- Token refresh handled by Supabase
- Logout clears session and redirects to login

---

## 📊 Database Schema

### Core Tables

#### 1. **profiles** (All Users)
```
id (UUID, Primary Key)
full_name (Text) - User's full name
email (Text) - Email address
role (Text) - 'patient' | 'doctor' | 'admin'
phone (Text) - Contact number
avatar_url (Text) - Profile picture URL
created_at (Timestamp) - Account creation date
updated_at (Timestamp) - Last update date
```

#### 2. **doctors** (Doctor Information)
```
id (UUID, Foreign Key → profiles)
specialty (Text) - Medical specialty
available_days (Array) - ['Mon', 'Tue', 'Wed', ...]
license_number (Text) - Medical license
hourly_rate (Number) - Consultation rate
```

#### 3. **patients** (Patient Information)
```
id (UUID, Foreign Key → profiles)
date_of_birth (Date) - Birth date
blood_type (Text) - Blood type
allergies (Array) - Known allergies
medical_conditions (Array) - Existing conditions
emergency_contact (Text) - Emergency contact info
```

#### 4. **appointments** ⭐ (Real-Time Enabled)
```
id (UUID, Primary Key)
patient_id (UUID, Foreign Key → patients)
doctor_id (UUID, Foreign Key → doctors)
appointment_date (Date) - Date of appointment
appointment_time (Time) - Time slot
appointment_type (Text) - 'In-Person' | 'Video'
reason (Text) - Reason for visit
status (Text) - 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed'
notes (Text) - Additional notes
created_at (Timestamp)
```

#### 5. **lab_tests** ⭐ (Real-Time Enabled)
```
id (UUID, Primary Key)
patient_id (UUID, Foreign Key → patients)
doctor_id (UUID, Foreign Key → doctors)
test_name (Text) - Type of test (CBC, Urinalysis, etc.)
test_date (Date) - When test was performed
status (Text) - 'Pending' | 'In Progress' | 'Completed'
result (Text) - Test results
notes (Text) - Doctor's notes
created_at (Timestamp)
```

#### 6. **invoices** ⭐ (Real-Time Enabled)
```
id (UUID, Primary Key)
patient_id (UUID, Foreign Key → patients)
service (Text) - Service description
amount (Number) - Amount in currency
invoice_date (Date) - Invoice date
due_date (Date) - Payment due date
status (Text) - 'Pending' | 'Paid' | 'Overdue'
payment_date (Date) - When paid
notes (Text) - Payment notes
```

#### 7. **prescriptions** ⭐ (Real-Time Enabled)
```
id (UUID, Primary Key)
patient_id (UUID, Foreign Key → patients)
doctor_id (UUID, Foreign Key → doctors)
medication (Text) - Medication name
dosage (Text) - Dosage amount
frequency (Text) - How often to take
duration (Text) - Treatment duration
status (Text) - 'Active' | 'Refill Needed' | 'Completed'
remaining_supply (Number) - Quantity left
prescription_date (Date)
```

#### 8. **medical_records** ⭐ (Real-Time Enabled)
```
id (UUID, Primary Key)
patient_id (UUID, Foreign Key → patients)
doctor_id (UUID, Foreign Key → doctors)
record_type (Text) - 'Consultation' | 'Lab' | 'Report' | etc.
title (Text) - Record title
content (Text) - Full content
record_date (Date) - Record date
file_url (Text) - Link to documents/images
created_at (Timestamp)
```

#### 9. **messages**
```
id (UUID, Primary Key)
sender_id (UUID, Foreign Key → profiles)
receiver_id (UUID, Foreign Key → profiles)
content (Text) - Message content
is_read (Boolean) - Read status
created_at (Timestamp)
```

---

## 🔌 Connected Features

### Features Actively Using Supabase

#### 1. **Authentication System**
- Real signup and login with Supabase Auth
- Session persistence
- Token management
- Logout functionality

#### 2. **Laboratory** (`/laboratory`)
- Fetches lab tests from `lab_tests` table
- Add new lab tests
- View test results
- Track test status
- Real-time updates

#### 3. **Billing** (`/billing`)
- Fetches invoices from `invoices` table
- View payment status
- Download invoices
- Real-time invoice updates

#### 4. **Appointments** (`/appointments`)
- Book new appointments
- View all appointments
- Cancel appointments
- Real-time appointment updates
- Appointment status tracking

#### 5. **Medical Records** (`/ehr/records`)
- View all medical records
- Track consultation notes
- Access lab reports
- Download records
- Real-time record updates

#### 6. **Prescriptions** (Integrated in Medical Records)
- View active prescriptions
- Track remaining supply
- Request refills
- Real-time prescription updates

#### 7. **Landing Page** (`/`)
- Tests Supabase connection
- Displays connection status
- Queries database for connectivity verification

---

## 🔄 Real-Time Subscriptions

The application uses **Supabase Realtime** for live data synchronization:

```typescript
// Real-time subscription example
const subscription = supabase
  .channel('public:appointments')
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'appointments' },
    (payload) => {
      // Handle INSERT, UPDATE, DELETE events
      // Update UI automatically
    }
  )
  .subscribe();
```

### Supported Real-Time Events
- **INSERT** - New record created
- **UPDATE** - Existing record modified
- **DELETE** - Record deleted

### Tables with Real-Time Enabled
- ✓ appointments
- ✓ lab_tests
- ✓ invoices
- ✓ prescriptions
- ✓ medical_records

---

## 📝 Sample Data

After running `full-setup.sql`, the database includes:

### Sample Doctor
- **Name:** Dr. Sarah Johnson
- **Specialty:** Cardiologist
- **License:** LIC-CARDIO-001
- **Available:** Mon-Fri

### Sample Patient
- **Name:** John Doe
- **Blood Type:** O+
- **Allergies:** Penicillin
- **Conditions:** Hypertension

### Sample Lab Tests
1. **Complete Blood Count (CBC)**
   - Status: Completed
   - Result: Normal
   - Date: 2026-05-15

2. **Lipid Panel**
   - Status: Completed
   - Result: Abnormal - High Cholesterol
   - Date: 2026-05-10

3. **Urinalysis**
   - Status: In Progress
   - Result: Pending
   - Date: 2026-05-20

### Sample Invoices
1. **Consultation - Dr. Sarah Johnson**
   - Amount: KES 5,000
   - Status: Paid

2. **Blood Test - Complete Panel**
   - Amount: KES 3,500
   - Status: Paid

3. **X-Ray Imaging**
   - Amount: KES 8,000
   - Status: Pending

4. **Medication - Pharmacy**
   - Amount: KES 2,500
   - Status: Paid

---

## 🐛 Troubleshooting

### Issue: Connection Shows "❌ Error - Connection refused"

**Causes & Solutions:**
1. ✓ Verify `.env` file has correct credentials
2. ✓ Check Supabase project is active (not paused)
3. ✓ Ensure `full-setup.sql` has been executed
4. ✓ Check browser console (F12) for detailed error message
5. ✓ Verify internet connection is working

**Steps to Fix:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install

# Restart dev server
npm run dev
```

### Issue: "Checking..." indicator never resolves

**Causes & Solutions:**
1. ✓ Clear browser cache (Ctrl+Shift+Delete)
2. ✓ Check VITE_SUPABASE_URL value in `.env`
3. ✓ Verify Supabase project exists and is accessible
4. ✓ Check browser console for CORS errors

### Issue: Can't see sample data in tables

**Causes & Solutions:**
1. ✓ Run `full-setup.sql` in Supabase SQL Editor
2. ✓ Go to Table Editor and refresh browser
3. ✓ Verify `lab_tests` table has 3 rows
4. ✓ Verify `invoices` table has 4 rows

**To re-run setup:**
```sql
-- Go to Supabase SQL Editor and run:
-- Drop existing tables (WARNING: deletes data)
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS medical_records CASCADE;
DROP TABLE IF EXISTS prescriptions CASCADE;
DROP TABLE IF EXISTS invoices CASCADE;
DROP TABLE IF EXISTS lab_tests CASCADE;
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS patients CASCADE;
DROP TABLE IF EXISTS doctors CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Then run full-setup.sql again
```

### Issue: Changes not saving to Supabase

**Causes & Solutions:**
1. ✓ Check Row Level Security (RLS) policies
2. ✓ Verify you're authenticated (if using auth policies)
3. ✓ Check browser console for permission errors
4. ✓ Ensure user role matches policy requirements

### Issue: Real-time updates not working

**Causes & Solutions:**
1. ✓ Enable Realtime in Supabase for target tables
2. ✓ Verify subscription is set up correctly
3. ✓ Check WebSocket connection in browser DevTools
4. ✓ Ensure table has realtime enabled in Supabase dashboard

**To enable realtime:**
1. Go to Supabase dashboard
2. Click **Replication**
3. Toggle ON for desired tables
4. Wait a few seconds for changes to apply

### Issue: Authentication not working

**Causes & Solutions:**
1. ✓ Verify Supabase Auth is enabled in dashboard
2. ✓ Check email/password are entered correctly
3. ✓ Ensure password is at least 6 characters
4. ✓ Check browser console for auth errors
5. ✓ Verify email is not already registered

---

## 📁 Project Structure

```
Smart-Hospital-Management-Telemedicine-System-/
├── src/
│   ├── main.tsx                          # Entry point
│   ├── app/
│   │   ├── App.tsx                       # Main app component
│   │   ├── routes.tsx                    # Route definitions
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   │   └── ProtectedRoute.tsx
│   │   │   ├── layout/
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── Footer.tsx
│   │   │   │   └── Layout.tsx
│   │   │   └── ui/                      # shadcn components
│   │   ├── contexts/
│   │   │   ├── AuthContext.tsx          # Authentication
│   │   │   ├── AppointmentsContext.tsx  # Appointments
│   │   │   ├── PrescriptionsContext.tsx # Prescriptions
│   │   │   ├── MedicalRecordsContext.tsx# Medical Records
│   │   │   ├── LaboratoryContext.tsx    # Lab Tests
│   │   │   └── BillingContext.tsx       # Invoices
│   │   └── pages/
│   │       ├── LandingPage.tsx
│   │       ├── auth/
│   │       │   ├── Login.tsx
│   │       │   └── Register.tsx
│   │       ├── appointments/
│   │       │   ├── BookAppointment.tsx
│   │       │   └── ViewAppointments.tsx
│   │       ├── ehr/
│   │       │   ├── MedicalRecords.tsx
│   │       │   └── ConsultationNotes.tsx
│   │       ├── billing/
│   │       │   ├── Billing.tsx
│   │       │   └── Payments.tsx
│   │       ├── laboratory/
│   │       │   └── Laboratory.tsx
│   │       ├── pharmacy/
│   │       │   └── Pharmacy.tsx
│   │       ├── telemedicine/
│   │       │   └── Telemedicine.tsx
│   │       └── dashboards/
│   │           ├── PatientDashboard.tsx
│   │           ├── DoctorDashboard.tsx
│   │           └── AdminDashboard.tsx
│   ├── lib/
│   │   └── supabase.ts                  # Supabase client
│   └── styles/
│       ├── globals.css
│       ├── index.css
│       └── theme.css
├── supabase/
│   ├── schema.sql                       # Database schema
│   ├── full-setup.sql                   # Complete setup script
│   ├── fix-policies.sql                 # RLS policies
│   └── test-connection.sql              # Connection test
├── .env                                 # Environment variables
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md                            # This file
```

---

## 🚀 Quick Start Checklist

- [ ] Clone/download the project
- [ ] Run `npm install`
- [ ] Verify `.env` has Supabase credentials
- [ ] Run `supabase/full-setup.sql` in Supabase SQL Editor
- [ ] Run `npm run dev`
- [ ] Visit http://localhost:5177
- [ ] Verify ✅ Supabase Connected! appears
- [ ] Test login with demo credentials
- [ ] Explore Laboratory, Billing, and Medical Records pages
- [ ] Create new test records

---

## 📚 Useful Resources

### Official Documentation
- [Supabase Docs](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- [React Documentation](https://react.dev)
- [React Router Documentation](https://reactrouter.com)

### Guides
- [Row Level Security (RLS)](https://supabase.com/docs/guides/auth/row-level-security)
- [Real-time Subscriptions](https://supabase.com/docs/guides/realtime)
- [Authentication](https://supabase.com/docs/guides/auth)
- [Tailwind CSS](https://tailwindcss.com/docs)

### Community
- [Supabase Discord](https://discord.supabase.com)
- [GitHub Discussions](https://github.com/supabase/supabase/discussions)

---

## ✨ Key Achievements

✅ **Supabase Backend** - PostgreSQL database fully configured
✅ **Real Authentication** - Email/password with Supabase Auth
✅ **Real-Time Data** - Live updates across all pages
✅ **Role-Based Access** - Patient, Doctor, Admin roles
✅ **Context API** - State management with React Context
✅ **Responsive Design** - Mobile-friendly UI
✅ **Type Safety** - Full TypeScript coverage
✅ **Sample Data** - Pre-loaded test data ready
✅ **Error Handling** - Comprehensive error management
✅ **Production Ready** - Optimized build ready

---

## 🎯 Next Steps

### Phase 1: Testing (Current)
- [ ] Verify all features work
- [ ] Test real-time updates
- [ ] Test authentication flow
- [ ] Load test with sample data

### Phase 2: Customization
- [ ] Customize branding and colors
- [ ] Add custom business rules
- [ ] Implement additional features
- [ ] Deploy to production

### Phase 3: Production
- [ ] Set up custom domain
- [ ] Configure email notifications
- [ ] Enable SSL/TLS
- [ ] Monitor performance
- [ ] Regular backups

---

## 📝 License & Support

For questions, issues, or support:
1. Check Troubleshooting section
2. Review Supabase documentation
3. Check browser console for error details
4. Contact project maintainers
