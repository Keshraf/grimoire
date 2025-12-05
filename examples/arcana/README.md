# Arcana - Personal Knowledge Base Example

A mystical knowledge base exploring consciousness, creativity, and the philosophy of mind. This example demonstrates NEXUS configured for personal knowledge management with a dark, mystical aesthetic.

## Features

- **Personal Mode**: Flat exploration without linear navigation
- **Dark Theme**: Purple/black mystical color palette (arcana.css)
- **12 Interconnected Notes**: Philosophy and creativity topics with wikilinks
- **Password Authentication**: Simple single-user access

## Prerequisites

1. A Supabase project with the NEXUS schema applied
2. Node.js 18+ installed
3. Environment variables configured

## Setup Instructions

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Run the schema setup in SQL Editor:
   ```sql
   -- Copy contents from scripts/setup-supabase.sql
   ```

### 2. Configure Environment Variables

Create a `.env` file in the project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXUS_PASSWORD=arcana-demo
```

### 3. Copy Configuration

```bash
cp examples/arcana/nexus.config.yaml ./nexus.config.yaml
```

### 4. Seed the Database

```bash
npm run seed -- arcana
```

### 5. Run Locally

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Demo Credentials

- **Password**: `arcana-demo` (or whatever you set in `NEXUS_PASSWORD`)

## Deployment to Vercel

1. Push to GitHub
2. Import to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

## Note Topics

| Topic              | Description                                       |
| ------------------ | ------------------------------------------------- |
| Consciousness      | The nature of awareness and subjective experience |
| Qualia             | The subjective, qualitative aspects of experience |
| Free Will          | Agency, choice, and determinism                   |
| Creativity         | The process of generating novel ideas             |
| Flow State         | Optimal experience and focused engagement         |
| Philosophy of Mind | The study of consciousness and mental phenomena   |

## Customization

To create your own example based on Arcana:

1. Copy this directory: `cp -r examples/arcana examples/my-example`
2. Edit `nexus.config.yaml` with your settings
3. Replace `seed-data.sql` with your content
4. Update this README
5. Run: `npm run seed -- my-example`
