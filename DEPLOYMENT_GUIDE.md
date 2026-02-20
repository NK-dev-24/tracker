# 75-Day Protocol Tracker: Deployment & Testing Guide

This guide covers everything you need to take this application from local development to a fully functioning, monetised micro-SaaS.

---

## 1. Database & Authentication Setup (Supabase)

The app uses Supabase for database storage and Google OAuth for authentication.

1. **Create a Supabase Project:**
   - Go to [supabase.com](https://supabase.com) and create a new project.
2. **Set up the Database Schema:**
   - Go to the **SQL Editor** in your Supabase dashboard.
   - Copy the contents of `supabase/schema.sql` from this repository.
   - Run the SQL to create the `profiles`, `challenges`, and `daily_logs` tables, along with the RLS policies and triggers.
3. **Configure Google OAuth:**
   - In Supabase, go to **Authentication > Providers** and enable Google.
   - You will need a Google Cloud Console account. Create a new project, configure the OAuth consent screen, and create Web application credentials.
   - Set the Authorized Redirect URI in Google Cloud to your Supabase callback URL (found in the Supabase Google provider settings, usually `https://<YOUR_PROJECT_ID>.supabase.co/auth/v1/callback`).
   - Copy the **Client ID** and **Client Secret** from Google into the Supabase Google provider settings.
4. **Environment Variables:**
   - In Supabase, go to **Project Settings > API**.
   - Copy the `Project URL` and `anon public` key. Add them to your local `.env.local` file:
     ```env
     NEXT_PUBLIC_SUPABASE_URL=your_project_url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
     ```
   - *Important:* Ensure your Vercel/production deployment also has these variables set.

---

## 2. Payments Setup (Dodo Payments)

1. **Create a Dodo Payments Account:**
   - Go to [dodopayments.com](https://dodopayments.com) and register.
2. **Create a Product:**
   - Create a new "One-time payment" product titled "75-Day Tracker Full Access" (or similar) priced at $4.
   - Copy the **Payment Link** provided by Dodo.
3. **Configure Webhooks:**
   - In Dodo Payments, go to the Developer / Webhooks section.
   - Add a new webhook endpoint. The URL will be `https://<YOUR_PRODUCTION_DOMAIN>/api/webhook/dodo`.
   - Select events related to successful payments (e.g., `payment.succeeded`).
   - Dodo will provide a **Webhook Secret** (used to verify the payment originated from them).
4. **Environment Variables:**
   - Add the payment link and webhook secret to your local `.env.local`:
     ```env
     NEXT_PUBLIC_DODO_PAYMENT_LINK=your_payment_link_here
     DODO_PAYMENTS_WEBHOOK_SECRET=your_webhook_secret_here
     ```

---

## 3. Deployment (Vercel)

1. **Push Code to GitHub:**
   - Ensure all your code is pushed to a GitHub repository.
2. **Import Project to Vercel:**
   - Go to [vercel.com](https://vercel.com) and import your repository.
3. **Configure Environment Variables:**
   - Add the 4 environment variables outlined above to the Vercel project settings:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `NEXT_PUBLIC_DODO_PAYMENT_LINK`
     - `DODO_PAYMENTS_WEBHOOK_SECRET`
4. **Set Auth Redirects for Production:**
   - **Crucial:** Once deployed, copy your final Vercel domain (e.g., `https://my-75day-tracker.vercel.app`).
   - In Supabase, go to **Authentication > URL Configuration** and add your Vercel domain to the **Site URL** and **Redirect URLs** list. Otherwise, Google login won't return users to your production site.
5. **Vercel Cron Setup (Midnight Resets):**
   - Vercel will automatically read your `vercel.json` file.
   - To secure the cron route, create a random string and add it to your environment variables as `CRON_SECRET`.
   - Update `vercel.json` to pass this secret if your API route expects it, or use Vercel's built-in `authorization` header mechanism (the code currently relies on Vercel's internal cron token check, which happens automatically).

---

## 4. End-to-End Testing Workflow

To ensure everything works perfectly before launching, run through this test suite on your **production URL**:

### Test 1: Landing & Onboarding (Free Flow)
1. Go to the landing page. Read the copy, check the demo tasks, ensure confetti fires.
2. Click "Start the challenge".
3. Enter a name (e.g., "Test User"), select 31 Days.
4. On the Goals step, edit a task, remove a task, and add a task (ensure limits work). Confirm the tasks.
5. "Sign the contract" and click "Continue with Google".
6. Authenticate with a test Google account.
7. You should be redirected to the `/onboarding/complete` paywall page.
8. Click the **"Use without saving"** button at the bottom.
9. Verify you land on `/tracker` (the Free Tracker).
10. Check off some tasks. Refresh the page. Ensure the tasks *stay checked* (it uses `localStorage`).

### Test 2: The Paywall & Payment Webhook
1. Go back to `/onboarding/complete` (or log in again—the middleware will route you there because you haven't paid).
2. Click the **"Pay $4 and start tracking"** button. This should open Dodo Payments.
3. *If Dodo supports test mode*, use a test credit card to complete the purchase.
4. If payment works, the Dodo webhook will ping your `/api/webhook/dodo` endpoint, which will set `has_paid = true` for your user in Supabase.
5. In your browser, go to the landing page and log in again (or if Dodo redirects you back, your middleware will check auth).
6. Because you are now "paid", logging in should redirect you to `/dashboard` instead of the paywall.

### Test 3: Core Dashboard & Persistence (Pro Flow)
1. Open `/dashboard`. Verify the custom tasks you set during onboarding are displayed.
2. Verify the Day counter says "1 / 31" and the progress grid shows the first day highlighted.
3. Check off all tasks. Verify the celebration confetti fires and the "ALL TASKS COMPLETE" banner appears.
4. Refresh the page. Verify tasks *stay checked* (it's pulling from Supabase now).
5. In your Supabase dashboard, check the `challenges.current_day` value. It should still be 1. It only increments on the next calendar day.
6. **(Optional) Force a day advance:** Go to Supabase > `challenges` table. Edit your row. Change `start_date` to yesterday. Refresh the `/dashboard`. You should see `current_day` is now 2.

### Test 4: The Midnight Reset (Cron)
1. To test the cron job immediately, open your browser or Postman and make a `GET` request to `https://<YOUR_PRODUCTION_DOMAIN>/api/reset-streak`.
   *(Note: You might need to bypass the auth check in the API temporarily to test this manually, or trigger it directly from the Vercel dashboard).*
2. In Supabase, manually set the `challenges.current_day` to 5 and `challenges.last_completed_date` to a date *two days ago*.
3. Run the cron job.
4. Verify the `challenges` row resets `current_day` back to 1. Go to `/dashboard` and verify the red "YOU MISSED A DAY" banner appears.

---

## 5. Launch
Once all tests pass, you have a fully operational micro-SaaS. Remove any test data from Supabase and announce your launch!
