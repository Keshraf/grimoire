# NEXUS Setup Guide

Welcome! This guide will walk you through setting up your own NEXUS knowledge base. No coding experience required — just follow the steps below.

## What You'll Need

Before starting, make sure you have:

- A computer with internet access
- About 30 minutes of time
- A free [Supabase](https://supabase.com) account (we'll create this together)
- A free [Vercel](https://vercel.com) account for hosting (optional, for deployment)

---

## Quick Start Checklist

Use this checklist to track your progress:

- [ ] Create a Supabase account and project
- [ ] Set up the database schema
- [ ] Get your API keys
- [ ] Configure environment variables
- [ ] Choose your app (Arcana or Codex)
- [ ] Deploy to Vercel (optional)

---

## Step 1: Create Your Supabase Project

Supabase is a free database service that stores all your notes. Here's how to set it up:

### 1.1 Sign Up for Supabase

1. Go to [supabase.com](https://supabase.com)
2. Click **"Start your project"** (green button)
3. Sign up with your GitHub account or email
4. Verify your email if prompted

### 1.2 Create a New Project

1. Once logged in, click **"New Project"**
2. Fill in the details:
   - **Name**: Give it a name like "my-nexus" or "knowledge-base"
   - **Database Password**: Create a strong password (save this somewhere safe!)
   - **Region**: Choose the location closest to you
3. Click **"Create new project"**
4. Wait 2-3 minutes for your project to be ready

### 1.3 Set Up the Database

Now we need to create the tables that store your notes:

1. In your Supabase dashboard, click **"SQL Editor"** in the left sidebar
2. Click **"New query"**
3. Copy the entire contents of the file `scripts/setup-supabase.sql` from this repository
4. Paste it into the SQL Editor
5. Click **"Run"** (or press Ctrl/Cmd + Enter)
6. You should see "Success. No rows returned" — this means it worked!

---

## Step 2: Get Your API Keys

You need two keys from Supabase to connect your app:

### 2.1 Find Your Keys

1. In Supabase, click **"Settings"** (gear icon) in the left sidebar
2. Click **"API"** under "Project Settings"
3. You'll see two important values:
   - **Project URL**: Looks like `https://xxxxx.supabase.co`
   - **anon public key**: A long string starting with `eyJ...`

### 2.2 Save Your Keys

Copy these values somewhere safe — you'll need them in the next step:

```
Project URL: https://your-project-id.supabase.co
Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Step 3: Configure Your App

### 3.1 Choose Your App

NEXUS comes with two pre-configured apps:

| App        | Best For                         | Features                                      |
| ---------- | -------------------------------- | --------------------------------------------- |
| **Arcana** | Personal notes, journals, ideas  | Dark theme, graph view, password protection   |
| **Codex**  | Documentation, guides, tutorials | Light theme, linear navigation, public access |

### 3.2 Set Up Environment Variables

Environment variables are like secret settings for your app. Here's what each one means:

| Variable                        | What It Does                    | Required?       |
| ------------------------------- | ------------------------------- | --------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Your Supabase project URL       | Yes             |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase public key        | Yes             |
| `SUPABASE_SERVICE_ROLE_KEY`     | Admin key for server operations | Yes             |
| `NEXUS_PASSWORD`                | Password to protect your notes  | Only for Arcana |
| `OPENAI_API_KEY`                | Enables AI-powered search       | Optional        |
| `GEMINI_API_KEY`                | Alternative AI search provider  | Optional        |

### 3.3 Create Your .env File

1. Navigate to your chosen app folder (`apps/arcana` or `apps/codex`)
2. Copy the example file: `cp .env.example .env`
3. Open `.env` in a text editor
4. Replace the placeholder values with your actual keys:

```bash
# Required - paste your Supabase values here
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# For Arcana only - set your password
NEXUS_PASSWORD=your-secret-password
```

---

## Step 4: Run Locally (Optional)

If you want to test your app before deploying:

### 4.1 Install Node.js

1. Go to [nodejs.org](https://nodejs.org)
2. Download the **LTS** version (recommended)
3. Run the installer and follow the prompts

### 4.2 Install Dependencies

Open a terminal/command prompt and run:

```bash
# Navigate to the project folder
cd nexus

# Install all dependencies
npm install
```

### 4.3 Seed Sample Data

Add some example notes to get started:

```bash
# For Arcana (personal notes)
npm run seed:arcana

# For Codex (documentation)
npm run seed:codex
```

### 4.4 Start the App

```bash
# For Arcana
npm run dev:arcana

# For Codex
npm run dev:codex
```

Open your browser to `http://localhost:3001` (Arcana) or `http://localhost:3002` (Codex).

---

## Step 5: Deploy to Vercel

Vercel is a free hosting service that makes your app accessible on the internet.

### 5.1 Sign Up for Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **"Sign Up"**
3. Sign up with your GitHub account (recommended)

### 5.2 Import Your Project

1. Push your code to GitHub (if you haven't already)
2. In Vercel, click **"Add New..."** → **"Project"**
3. Select your GitHub repository
4. Choose the app folder:
   - For Arcana: Set **Root Directory** to `apps/arcana`
   - For Codex: Set **Root Directory** to `apps/codex`

### 5.3 Add Environment Variables

1. Before deploying, click **"Environment Variables"**
2. Add each variable from your `.env` file:
   - Name: `NEXT_PUBLIC_SUPABASE_URL`
   - Value: Your Supabase URL
3. Repeat for all required variables
4. Click **"Deploy"**

### 5.4 Access Your App

Once deployed, Vercel will give you a URL like `your-app.vercel.app`. Your knowledge base is now live!

---

## Customizing Your NEXUS

### Changing the Theme

Edit `nexus.config.yaml` in your app folder:

```yaml
theme:
  preset: "dark" # or "light"
  colors:
    primary: "#9333ea" # Main accent color
    background: "#0c0a1d" # Page background
```

### Changing the Site Title

```yaml
site:
  title: "My Knowledge Base"
  description: "Personal notes and ideas"
```

### Enabling/Disabling Features

```yaml
features:
  local_graph: true # Show connection graph
  backlinks_panel: true # Show "linked from" panel
  search: true # Enable search
  ai_search: false # AI-powered search (needs API key)
```

---

## Troubleshooting

### "Failed to fetch notes" Error

**Cause**: Database connection issue

**Solution**:

1. Check your Supabase URL and keys are correct
2. Make sure you ran the SQL setup script
3. Verify your Supabase project is active (not paused)

### "Unauthorized" Error

**Cause**: Missing or incorrect API key

**Solution**:

1. Double-check your `NEXT_PUBLIC_SUPABASE_ANON_KEY`
2. Make sure there are no extra spaces in your `.env` file
3. Restart your development server after changing `.env`

### Password Not Working (Arcana)

**Cause**: `NEXUS_PASSWORD` not set correctly

**Solution**:

1. Check that `NEXUS_PASSWORD` is set in your `.env` file
2. The password is case-sensitive
3. Restart the server after changes

### Build Fails on Vercel

**Cause**: Missing environment variables

**Solution**:

1. Go to your Vercel project settings
2. Check that ALL required environment variables are added
3. Redeploy after adding missing variables

### Notes Not Saving

**Cause**: Database permissions issue

**Solution**:

1. In Supabase, go to **Authentication** → **Policies**
2. Make sure RLS (Row Level Security) policies are set up
3. Re-run the SQL setup script if needed

---

## Getting Help

- **GitHub Issues**: Report bugs or request features
- **Discussions**: Ask questions and share ideas
- **Documentation**: Check the main README for more details

---

## Next Steps

Now that your NEXUS is running:

1. **Create your first note**: Click the "+" button or use Cmd/Ctrl + N
2. **Link notes together**: Type `[[` to create a link to another note
3. **Explore the graph**: See how your notes connect visually
4. **Import existing notes**: Use the import feature for markdown files

Happy knowledge building! 🚀
