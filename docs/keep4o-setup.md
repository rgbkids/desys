# keep4o Setup Guide

<context_gathering>
keep4o is an open-source AI chatbot app template built with Next.js, Vercel AI SDK, OpenAI, and Vercel KV.
This guide walks through the complete setup process to get keep4o running locally.
</context_gathering>

## Prerequisites

- **Node.js** (version 18 or higher)
- **pnpm** (package manager)
- **Git** (for repository cloning)

## Setup Instructions

### 1. System Requirements Verification

<verification>
Verify your current system environment:
</verification>

```bash
# Check Node.js version
node --version

# Check pnpm (install if not available)
pnpm --version || npm install -g pnpm

# Check Git
git --version
```

### 2. Install Dependencies

```bash
# Navigate to project directory
cd /path/to/keep4o

# Install dependencies
pnpm install
```

### 3. Environment Variables Setup

<persistence>
**Important**: All environment variables below are required. Create all service accounts and prepare the necessary information before proceeding.
</persistence>

#### Required Service Setup

**Services that require preliminary setup:**

1. **OpenAI API Key** (Required)
   - Enable Billing Account on [OpenAI Platform](https://platform.openai.com/account/billing/overview)
   - Generate API key from [API Keys](https://platform.openai.com/account/api-keys)
   - 🔑 Save your **OPENAI_API_KEY**

2. **Google OAuth** (Required)
   - Create OAuth client in [Google Cloud Console](https://console.cloud.google.com/apis/credentials/oauthclient/)
   - Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
   - 🔑 Save your **GOOGLE_CLIENT_ID** and **GOOGLE_CLIENT_SECRET**

3. **Vercel KV Database** (Required)
   - Create KV database following [Vercel KV Quickstart Guide](https://vercel.com/docs/storage/vercel-kv/quickstart#create-a-kv-database)
   - 🔑 Save the following values:
     - **KV_URL**
     - **KV_REST_API_URL**
     - **KV_REST_API_TOKEN**
     - **KV_REST_API_READ_ONLY_TOKEN**

#### Environment Variables Setup

Once you have prepared the above information, execute the following:

```bash
# Create .env file
cp .env.example .env

# Generate AUTH_SECRET
openssl rand -base64 32
```

Set all of the following in your `.env` file:

```env
NEXT_PUBLIC_API=http://localhost:3000
NEXTAUTH_URL=http://localhost:3000

# OpenAI API Key (Required)
OPENAI_API_KEY=sk-proj-...

# Generated secret (Required)
AUTH_SECRET=your_generated_random_key

# Google OAuth (Required)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Vercel KV Database (Required)
KV_URL=redis://your_kv_url
KV_REST_API_URL=https://your_kv_rest_api_url
KV_REST_API_TOKEN=your_kv_rest_api_token
KV_REST_API_READ_ONLY_TOKEN=your_kv_rest_api_read_only_token
```

### 4. Environment Variables Verification

Verify that all environment variables are set:

```bash
# Check .env file (sensitive information will not be displayed)
grep -E '^[A-Z]' .env | grep -v '=$'
```

Verify that all required items have values set before proceeding to the next step.

### 5. Start the Application

<exploration>
Start the development server and verify the application runs properly:
</exploration>

```bash
# Start development server
pnpm dev

# Alternative command
pnpm run dev
```

### 6. Functionality Verification

1. Access [http://localhost:3000](http://localhost:3000) in your browser
2. **Login Functionality:**
   - Verify OAuth login with Google works
   - Confirm chat interface appears after login
3. **Chat Functionality:**
   - Send a message and verify AI responds
   - Confirm conversation history is saved

## Troubleshooting

### Common Issues and Solutions

**Port 3000 is in use:**
```bash
# Start on different port
pnpm dev -- --port 3001
```

**Environment variables not loading properly:**
- Verify `.env` file is in project root
- Check for typos in environment variable names
- Ensure no environment variables are empty (all values must be set)
- Restart the server

**OpenAI API errors:**
- Verify API Key is valid on OpenAI Platform
- Confirm Billing Account is activated
- Check if API usage limits are exceeded
- Ensure API key starts with `sk-proj-` or `sk-`

**Authentication errors:**
- Verify `AUTH_SECRET` is properly set
- Check Google OAuth settings are correct
- Confirm callback URLs: `http://localhost:3000/api/auth/callback/google`
- Verify Google OAuth app is not restricted

**Database/KV errors:**
- Verify all 4 KV environment variables are set
- Check Vercel KV dashboard for connection status
- Ensure KV URLs and tokens are correct

## Additional Configuration

### Vercel Deployment

```bash
# Install Vercel CLI (if not installed)
npm i -g vercel

# Link project to Vercel
vercel link

# Pull environment variables from Vercel
vercel env pull
```

### Development Tools

**Code Quality Checks:**
```bash
# Run lint
pnpm run lint
```

**Production Build Testing:**
```bash
# Production build
pnpm run build

# Start production server
pnpm run start
```

## Completion Checklist

**Setup Preparation:**
- [ ] Node.js (v18+) is installed
- [ ] pnpm is installed
- [ ] Project dependencies are installed

**External Service Preparation:**
- [ ] OpenAI Billing Account activated and API Key obtained
- [ ] Google OAuth app created with correct callback URL
- [ ] Vercel KV database created and credentials obtained

**Environment Variables Setup:**
- [ ] `.env` file is created
- [ ] All required environment variables are set (no empty values)
- [ ] AUTH_SECRET is generated and set

**Functionality Verification:**
- [ ] Development server starts without errors
- [ ] http://localhost:3000 is accessible
- [ ] Google OAuth login functionality works
- [ ] Chat functionality works and AI responds
- [ ] Conversation history is saved in KV database

**Once setup is complete, you can start chatting with AI using keep4o!**

## Post-Setup Troubleshooting

If you encounter issues after completing the setup, check these specific areas:

### 🔐 **Cannot Login (Google Authentication Fails)**
- Verify your **Google OAuth keys** in `.env`:
  - Check `GOOGLE_CLIENT_ID` is correct
  - Check `GOOGLE_CLIENT_SECRET` is correct  
  - Ensure callback URL is set to `http://localhost:3000/api/auth/callback/google` in Google Cloud Console
  - Verify your Google OAuth app is not restricted to specific domains

### 💬 **Chat Not Working (AI Doesn't Respond)**  
- Verify your **OpenAI API key** in `.env`:
  - Check `OPENAI_API_KEY` is correct and active
  - Ensure your OpenAI account has billing enabled
  - Verify you have sufficient API credits/quota
  - Confirm the API key starts with `sk-proj-` or `sk-`

### 💾 **Chat History Not Saving**
- Verify your **Vercel KV credentials** in `.env`:
  - Check all 4 KV environment variables are set correctly:
    - `KV_URL`
    - `KV_REST_API_URL` 
    - `KV_REST_API_TOKEN`
    - `KV_REST_API_READ_ONLY_TOKEN`
  - Ensure your Vercel KV database is active and accessible

**💡 Pro Tip:** After modifying any environment variables, restart your development server with `pnpm dev` to apply the changes.
