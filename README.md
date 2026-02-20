# 75-Day Protocol Tracker

A brutal, no-excuses micro-SaaS designed to track the 75-Day protocol (or 31/90 day variants). Built with Next.js 14, Supabase, and Dodo Payments.

## Features

- **Editable Custom Tasks:** Users choose their duration (31/75/90) and define their own non-negotiables (1-6 tasks), which lock in for the duration.
- **Two-Tier System:** 
  - **Free Tracker:** A daily resetting checklist that uses `localStorage`. No historical data is saved.
  - **Pro Dashboard ($4 one-time):** Persists progress to Supabase, features a 75-day grid visualization, motivational checkpoints, and midnight streak validation.
- **Google Auth:** Frictionless sign-up via Google OAuth directly after the commitment signature.
- **Midnight Enforcer:** A Vercel Cron job sweeps the database nightly, identifying users who missed tasks and mercilessly resetting them to Day 1.

## Project Structure

- `/src/components`: The core interactive islands (Landing, Onboarding, Dashboard, FreeTracker).
- `/src/app`: Next.js App Router definitions.
- `/src/lib`: Utilities for Supabase, task definitions, and motivational copy.
- `/supabase`: The database definitions (`schema.sql`).

## Getting Started Locally

1. Install dependencies: `npm install`
2. Create `.env.local` with your Supabase and Dodo variables.
3. Run dev server: `npm run dev`

## Deployment

Refer to the complete `DEPLOYMENT_GUIDE.md` for step-by-step instructions on wiring up Supabase, Google OAuth, webhooks, and pushing to Vercel.
