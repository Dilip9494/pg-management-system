# 🚀 Complete Setup Guide - PG Management System

This guide provides **detailed step-by-step instructions** for setting up your PG Management System with Supabase (backend) and Netlify (frontend hosting).

---

## 📋 Table of Contents

1. [Supabase Setup](#1-supabase-setup)
2. [Database Tables Creation](#2-database-tables-creation)
3. [Configure Application](#3-configure-application)
4. [Netlify Deployment](#4-netlify-deployment)
5. [Testing & Verification](#5-testing--verification)
6. [Troubleshooting](#6-troubleshooting)

---
###################
Supabase
Name**: `pg-management-system` (or your choice)
*Database Password**: Dksp@1994 Create a strong password (SAVE THIS!)
*Region**: asia-pacific  Choose closest to your location

Project URL : https://nxxxpdsogdghwcdfvvka.supabase.co
anon/public :- eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54eHhwZHNvZ2RnaHdjZGZ2dmthIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzNzQ3MDAsImV4cCI6MjA3ODk1MDcwMH0.DKmf4BgFH2v3MAgTLPAzmdwhKu9A2jyHCqoPjcI19_w

--->table creation
1. primary databse
Role: postgres

python -m http.server 8080
http://localhost:8080/index.html

#######################################
## 1. 🗄️ Supabase Setup

### Step 1.1: Create Supabase Account

1. Go to [https://supabase.com](https://supabase.com)
2. Click **"Start your project"**
3. Sign up with GitHub, Google, or Email
4. Verify your email address

### Step 1.2: Create New Project

1. Click **"New Project"**
2. Choose your organization (create one if needed)
3. Fill in project details:
   - **Name**: `pg-management` (or your choice)
   - **Database Password**: Dksp@1994 Create a strong password (SAVE THIS!)
   - **Region**: asia-pacific  Choose closest to your location
   - **Pricing Plan**: Free (perfect for this project)
4. Click **"Create new project"**
5. Wait 2-3 minutes for project initialization

### Step 1.3: Get API Credentials

1. In your Supabase dashboard, click **"Settings"** (gear icon)
2. Click **"API"** in the sidebar
3. Copy and save these values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: `eyJhbGc...` (long string)

⚠️ **IMPORTANT**: Save these credentials securely. You'll need them in Step 3.

---

## 2. 📊 Database Tables Creation

### Step 2.1: Open SQL Editor

1. In Supabase dashboard, click **"SQL Editor"** in sidebar
2. Click **"New query"**

### Step 2.2: Create `guests` Table

Copy and paste this SQL code, then click **"Run"**:

```sql
DROP TABLE IF EXISTS guests;

CREATE TABLE guests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "joiningDate" DATE NOT NULL,
    building TEXT NOT NULL,
    "roomNo" TEXT NOT NULL,
    "sharingType" INTEGER NOT NULL,
    name TEXT NOT NULL,
    mobile TEXT NOT NULL,
    "advancePayment" DECIMAL(10,2) NOT NULL,
    "paymentAmount" DECIMAL(10,2) NOT NULL,
    "monthlyPaymentStatus" TEXT NOT NULL,
    "monthlyPaymentDate" DATE,
    "upcomingPaymentDueDate" DATE,
    "daysLeft" TEXT,
    "roomVacate" TEXT DEFAULT 'No',
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_guests_building ON guests(building);
CREATE INDEX IF NOT EXISTS idx_guests_room ON guests("roomNo");
CREATE INDEX IF NOT EXISTS idx_guests_status ON guests("monthlyPaymentStatus");
CREATE INDEX IF NOT EXISTS idx_guests_vacate ON guests("roomVacate");

ALTER TABLE guests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all operations on guests" ON guests;

CREATE POLICY "Allow all operations on guests"
ON guests FOR ALL
USING (true)
WITH CHECK (true);


✅ **Success**: You should see "Success. No rows returned"

### Step 2.3: Create `login_history` Table

Create a new query and run:

```sql
-- Create login history table
CREATE TABLE login_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    username TEXT NOT NULL,
    login_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    logout_time TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_login_username ON login_history(username);
CREATE INDEX idx_login_time ON login_history(login_time DESC);

-- Enable Row Level Security
ALTER TABLE login_history ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY "Allow all operations on login_history" 
ON login_history FOR ALL 
USING (true) 
WITH CHECK (true);
```

### Step 2.4: Create `backups` Table

Create another new query and run:

```sql
-- Create backups table
CREATE TABLE backups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    backup_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    data JSONB NOT NULL,
    type TEXT DEFAULT 'manual',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index
CREATE INDEX idx_backup_date ON backups(backup_date DESC);

-- Enable Row Level Security
ALTER TABLE backups ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY "Allow all operations on backups" 
ON backups FOR ALL 
USING (true) 
WITH CHECK (true);
```

### Step 2.5: Verify Tables

1. Click **"Table Editor"** in sidebar
2. You should see 3 tables:
   - `guests`
   - `login_history`
   - `backups`

---

## 3. ⚙️ Configure Application

### Step 3.1: Extract Project Files

1. Extract the `pg-management-system` folder
2. Open the folder in your code editor

### Step 3.2: Update Configuration

1. Open `js/config.js`
2. Find these lines:

```javascript
const SUPABASE_CONFIG = {
    url: 'YOUR_SUPABASE_URL',
    anonKey: 'YOUR_SUPABASE_ANON_KEY',
};
```

3. Replace with YOUR credentials from Step 1.3:

```javascript
const SUPABASE_CONFIG = {
    url: 'https://xxxxx.supabase.co',  // Your actual URL
    anonKey: 'eyJhbGc...',              // Your actual anon key
};
```

4. **Save the file**

### Step 3.3: Test Locally (Optional)

1. Open `index.html` in a browser
2. Try logging in with:
   - Username: `admin1`
   - Password: `Admin@123`
3. If it works, you're ready for deployment!

---

## 4. 🌐 Netlify Deployment

### Method A: Drag & Drop (Easiest)

#### Step 4.1: Prepare Files

1. Make sure `js/config.js` has your Supabase credentials
2. Keep all files in the `pg-management-system` folder

#### Step 4.2: Deploy to Netlify

1. Go to [https://app.netlify.com](https://app.netlify.com)
2. Sign up/Login (use GitHub recommended)
3. Click **"Add new site"** → **"Deploy manually"**
4. **Drag the entire `pg-management-system` folder** into the deployment zone
5. Wait 10-30 seconds for deployment
6. Your site is live! 🎉

#### Step 4.3: Get Your URL

- Netlify assigns a random URL like: `https://random-name-12345.netlify.app`
- Click on the URL to open your PG Management System
- Test the login with admin credentials

#### Step 4.4: (Optional) Custom Domain

1. Click **"Domain settings"**
2. Click **"Options"** → **"Edit site name"**
3. Change to your preferred name: `my-pg-system.netlify.app`
4. Save

---

### Method B: GitHub Integration (Recommended for Updates)

#### Step 4B.1: Create GitHub Repository

1. Go to [https://github.com](https://github.com)
2. Click **"New repository"**
3. Name: `pg-management-system`
4. Set to **Public** or **Private**
5. Click **"Create repository"**

#### Step 4B.2: Push Code to GitHub

Open terminal/command prompt in your project folder:

```bash
# Initialize git
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: PG Management System"

# Add remote (replace with your repo URL)
git remote add origin https://github.com/YOUR_USERNAME/pg-management-system.git

# Push to GitHub
git branch -M main
git push -u origin main
```

#### Step 4B.3: Deploy from GitHub

1. Go to [https://app.netlify.com](https://app.netlify.com)
2. Click **"Add new site"** → **"Import an existing project"**
3. Click **"GitHub"**
4. Authorize Netlify to access GitHub
5. Select your repository: `pg-management-system`
6. Configure build settings:
   - **Branch to deploy**: `main`
   - **Build command**: (leave empty)
   - **Publish directory**: (leave empty or use `.`)
7. Click **"Deploy site"**
8. Wait for deployment to complete

#### Step 4B.4: Enable Auto-Deploy

With GitHub integration, every time you push code:
```bash
git add .
git commit -m "Updated features"
git push
```
Netlify automatically redeploys! 🚀

---

## 5. ✅ Testing & Verification

### Step 5.1: Test Login

1. Open your Netlify URL
2. Login with:
   - **Admin 1**: `admin1` / `Admin@123`
   - **Admin 2**: `admin2` / `Admin@456`

### Step 5.2: Test Guest Addition

1. Click **"Add Guest"**
2. Fill in all 14 fields
3. Click **"Save Guest"**
4. Verify guest appears in **"Guest List"**

### Step 5.3: Test All Features

✅ Dashboard statistics updated
✅ Guest list showing data
✅ Room status displaying correctly
✅ Reports generating
✅ Backup creation working
✅ Admin profile showing login history

---

## 6. 🔧 Troubleshooting

### Issue: "Error initializing Supabase"

**Solution**:
- Check `js/config.js` has correct URL and key
- Ensure no extra spaces in credentials
- Verify Supabase project is active

### Issue: "Policy violation" errors

**Solution**:
- Run the policy creation SQL commands again
- Ensure RLS policies allow all operations
- Check Supabase logs in dashboard

### Issue: No data showing

**Solution**:
- Open browser console (F12)
- Check for JavaScript errors
- Verify Supabase tables exist
- Check internet connection

### Issue: Login not working

**Solution**:
- Credentials are hardcoded (check auth.js)
- Try: `admin1` / `Admin@123` (case-sensitive)
- Clear browser cache and cookies
- Try incognito mode

### Issue: "Failed to fetch" errors

**Solution**:
- Check Supabase project is not paused
- Verify API credentials are correct
- Check browser console for CORS errors
- Ensure Supabase project URL is https://

---

## 🎯 Next Steps

1. **Add Your First Guest**: Test the complete workflow
2. **Set Up Automatic Backups**: Visit Storage page
3. **Review Room Status**: Ensure rooms display correctly
4. **Generate Reports**: Test monthly reports
5. **Bookmark Your Site**: Add to favorites for easy access

---

## 📞 Quick Reference

### Admin Credentials
- **Admin 1**: `admin1` / `Admin@123`
- **Admin 2**: `admin2` / `Admin@456`

### Important Files to Configure
- `js/config.js` - Supabase credentials

### Support Resources
- **Supabase Docs**: https://supabase.com/docs
- **Netlify Docs**: https://docs.netlify.com
- **Font Awesome**: https://fontawesome.com/icons

---

## 🎉 Congratulations!

Your PG Management System is now live and ready to use!

**Your URLs**:
- **Supabase Dashboard**: https://app.supabase.com
- **Netlify Dashboard**: https://app.netlify.com
- **Your PG System**: https://your-site.netlify.app

---

**Need Help?** Check the troubleshooting section or review the README.md file.
