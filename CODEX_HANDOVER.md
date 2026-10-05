# HFE Media Lead Engine - Codex Migration Handover

## 1. Handover Purpose

This repository is being migrated from one ChatGPT/Codex account to a new work account. The new account may not have access to the previous Codex conversation history.

This document preserves technical, operational, and historical project context so a new Codex instance can open this same local folder and continue safely.

Evidence labels used below:

- VERIFIED: confirmed from the current repository, Git state, configuration, or inspected source.
- HISTORICAL CONTEXT: known from the available Codex conversation context but not necessarily directly provable from the current repository alone.
- CURRENT WIP: present but unfinished or not committed at the migration snapshot.
- PLANNED / PROPOSED: discussed or useful, but not confirmed implemented.
- REJECTED / ABANDONED: explicitly rejected by the user or intentionally rolled back.
- UNKNOWN / NEEDS VERIFICATION: cannot be determined confidently from available evidence.

## 2. Executive Summary

VERIFIED: HFE Media Lead Engine is a private Next.js App Router SaaS-style dashboard for lead generation and sales tracking. It uses Supabase as the database and Google Places API server-side to discover businesses with no website.

HISTORICAL CONTEXT: The user wanted a premium dark HFE-branded lead generation app for HFE Media, with black/charcoal UI, HFE gold accents, white text, and no blue. The initial purpose was finding South African businesses with no website. The app later evolved into a broader workflow that includes database-driven search-term generation, a leads CRM, and a call tracker for final lead outcomes.

VERIFIED: Current core capabilities include:

- dashboard
- search term queue
- database-driven search term generator
- Google Places batch search
- lead deduplication and saving
- CSV export
- settings for batch size and delay
- leads CRM
- call tracker with sales statuses and outcome analytics
- responsive/mobile UI with a burger menu

VERIFIED: The repo is connected to GitHub and appears intended to deploy through Vercel when `main` is pushed.

## 3. Current Snapshot

VERIFIED migration snapshot:

- Snapshot time: `2026-09-10T21:05:11+02:00` Africa/Johannesburg.
- Current local path: `C:\dev\Lead HFE`.
- Current branch: `main`.
- Current HEAD: `2e65a9888c4a91c1816d43acdb4284cffd2b3968`.
- HEAD short commit: `2e65a98 Replace mobile nav strip with burger menu`.
- Git status before creating migration docs: clean, shown as `## main...origin/main`.
- Remote: `origin https://github.com/HFE-Media/Lead-Gen-HFE-Media.git`.
- Local branches:
  - `main` at `2e65a98`
  - `codex/lead-hfe-media` at `b3f2b39`
- Remote-tracking branches:
  - `origin/main` at `2e65a98`
  - `origin/codex/lead-hfe-media` at `b3f2b39`
- Existing `AGENTS.md` before this task: none found.
- Existing `CODEX_HANDOVER.md` before this task: none found.

CURRENT WIP after this migration task:

- `AGENTS.md` created.
- `CODEX_HANDOVER.md` created.
- No application/source code should be changed by this task.

## 4. Technology Stack

VERIFIED:

- Language: TypeScript.
- Framework: Next.js `14.2.30`, App Router.
- React: `18.3.1`.
- Styling: Tailwind CSS `3.4.17`.
- Database/client: Supabase JavaScript client `@supabase/supabase-js` `^2.49.8`.
- Icons: `lucide-react` `^0.511.0`.
- Build tooling: Next.js, TypeScript, PostCSS, Autoprefixer.
- Package manager evidence: `package-lock.json` exists, so npm is the intended package manager.
- Database: Supabase/Postgres via SQL in `sql/schema.sql`.
- External API: Google Places API (New), using `places:searchText` and Place Details endpoints.
- Deployment: Vercel is used historically and the GitHub remote is configured. No Vercel config file is present.

## 5. Repository Structure

VERIFIED important files and directories:

- `app/`: route tree for the application.
- `app/layout.tsx`: root layout that wraps pages in `AppShell`.
- `app/page.tsx`: dashboard.
- `app/search-terms/page.tsx`: manual/bulk search term queue page.
- `app/search-terms/generator/page.tsx`: generator page.
- `app/run-search/page.tsx`: batch search execution page.
- `app/leads/page.tsx`: Leads CRM page.
- `app/call-tracker/page.tsx`: Call Tracker page.
- `app/already-searched/page.tsx`: searched terms page.
- `app/settings/page.tsx`: settings page.
- `app/api/`: route handlers for server-side operations.
- `components/app-shell.tsx`: desktop sidebar and mobile burger menu.
- `components/leads-table.tsx`: Leads CRM and Call Tracker table plus lead edit modal.
- `components/search-terms-manager.tsx`: add/import search terms and queue table UI.
- `components/search-term-generator.tsx`: generator tabs, CSV imports, generation preview, save/push/export workflows.
- `components/run-search-panel.tsx`: search execution controls/progress.
- `lib/data.ts`: Supabase reads and dashboard/generator dataset aggregation.
- `lib/run-search.ts`: main Google Places to leads workflow.
- `lib/google-places.ts`: server-side Google Places calls.
- `lib/search-term-generator.ts`: generator limits, normalization, batching, CSV parsing.
- `lib/crm.ts`: lead status/outcome constants and validators.
- `lib/regions.ts`: supported Google Places region codes and labels.
- `lib/env.ts`: required environment variable checks.
- `lib/supabase.ts`: server-side service-role Supabase client.
- `sql/schema.sql`: database schema and idempotent alterations.
- `sql/generator-seed.sql`: optional pattern seed data.
- `deploy.ps1`: user-triggered helper for `git add`, `git commit`, and `git push`.
- `logo.png`: HFE Media logo used by the UI.
- `Frontend.png`: screenshot/visual reference asset.

## 6. Architecture

VERIFIED:

The application uses server-rendered App Router pages for page-level data loading. Many workflows are interactive client components that call local `/api/...` route handlers. Those route handlers use the server-side Supabase service-role client and, for search execution, the Google Places API key.

High-level flow:

1. User adds or imports search terms into `search_terms`.
2. User runs the search from `/run-search`.
3. `app/api/run-search/step/route.ts` calls `runSearchBatch`.
4. `runSearchBatch` loads pending terms, calls Google Places Text Search, then Place Details for each result.
5. Leads with a non-empty website are skipped.
6. Leads without a website are deduplicated and inserted into `leads`.
7. Search terms are marked as `searched`.
8. UI paths are revalidated.
9. Leads can be managed in `/leads` and `/call-tracker`.

VERIFIED security boundary:

- Google Places API key is read only in `lib/google-places.ts`.
- Supabase service-role key is used only through `lib/supabase.ts`.
- Client components do not directly call Google Places or initialize service-role Supabase.

## 7. Major Features / Functional Areas

### Dashboard

VERIFIED IMPLEMENTED:

- Shows high-level lead/search/follow-up metrics.
- Was simplified after the user disliked having the call charts on the dashboard.

HISTORICAL CONTEXT:

- The user prefers dashboard views that are useful and not cramped.
- Call analytics were intentionally moved to Call Tracker.

### Search Terms

VERIFIED IMPLEMENTED:

- Add one search term manually.
- Bulk import terms.
- Region selector with `za` as default.
- Terms are saved to `search_terms`.
- Duplicates are checked by term and region.
- Queue table supports deleting search terms.

HISTORICAL CONTEXT:

- Region was originally fixed to South Africa. The user requested a dropdown because they wanted leads outside South Africa too. The current default remains `za`.

### Search Term Generator

VERIFIED IMPLEMENTED:

- Page at `/search-terms/generator`.
- Uses Supabase tables for business categories, locations, and patterns.
- Has tabs for Generate, Categories, Locations, Patterns, and Generated Terms.
- Imports CSV data for categories, locations, and patterns.
- Can activate/deactivate datasets.
- Can filter by category groups and provinces.
- Can generate previews and save generated terms.
- Saves generated terms in batches of 500.
- Supports limits of 1,000, 5,000, 10,000, and 50,000.
- Can export generated terms to CSV.
- Can push generated terms into the main search queue.

HISTORICAL CONTEXT:

- A hardcoded generator was originally created and then explicitly rejected by the user.
- The final accepted direction was database-driven only, with no hardcoded category/location/pattern arrays in React/TypeScript files.

### Run Search

VERIFIED IMPLEMENTED:

- Batch size and delay controls.
- Calls `/api/run-search/step`.
- Progress UI tracks processed terms, added leads, skips, checked details, and remaining terms.
- API clamps batch size to 1 through 20.
- Delay is non-negative.

### Leads CRM

VERIFIED IMPLEMENTED:

- Shows no-website leads.
- Supports CSV export.
- Has search and status filtering.
- Lead rows can be managed in a modal popup.
- Modal includes call lead, save update, status/outcome/date/follow-up/value/agent/notes fields.
- `Call Lead` uses a `tel:` link when a phone number exists.

### Call Tracker

VERIFIED IMPLEMENTED:

- Dedicated page at `/call-tracker`.
- Uses the same `LeadsTable` component in tracker mode.
- Shows CRM-oriented metrics and charts.
- Performance chart shows recent business days only, not Saturdays/Sundays.
- Mobile chart displays two day cards at a time in a horizontal snap layout.
- Extra repeated Call Tracker summary block was removed from this page.

HISTORICAL CONTEXT:

- The user wanted one final call per lead, not many call attempts.
- The user asked for analytics and charts similar to a premium sales dashboard.
- The user repeatedly refined the modal layout, button sizing, spacing, and mobile chart behaviour.

### Already Searched

VERIFIED IMPLEMENTED:

- Displays search terms with status `searched`.

### Settings

VERIFIED IMPLEMENTED:

- Stores default batch size and default delay in `app_settings`.
- Settings are updated through `/api/settings`.

## 8. Data / Database

VERIFIED database technology:

- Supabase/Postgres.
- Schema maintained in `sql/schema.sql`.

VERIFIED tables:

- `business_categories`
  - category dataset for generator.
  - unique index on lower name plus lower group name.
- `locations`
  - location dataset for generator.
  - unique index on lower name, province, country.
- `term_patterns`
  - pattern dataset for generator.
  - unique index on lower pattern.
- `generated_search_terms`
  - generated terms before they are pushed to queue.
  - references category/location/pattern rows.
  - statuses: `pending`, `queued`, `skipped`.
- `search_terms`
  - main Google Places queue.
  - statuses: `pending`, `searched`.
  - unique index on lower term plus lower region.
- `leads`
  - no-website lead records and CRM/call fields.
  - dedupe unique partial indexes on `place_id` and lower name plus normalized phone.
  - lead statuses: `new`, `contacted`, `interested`, `demo_booked`, `quoted`, `won`, `lost`.
  - call outcomes: `no_answer`, `wrong_number`, `gatekeeper`, `existing_website`, `not_interested`, `call_back_later`, `info_requested`, `interested`, `demo_booked`, `quoted`, `won`, `lost`.
- `app_settings`
  - default batch size and delay settings.

VERIFIED schema behaviours:

- `pgcrypto` extension is created if missing for `gen_random_uuid`.
- Existing `search_terms_term_key` constraint is dropped to support uniqueness by term plus region.
- `touch_app_settings_updated_at` trigger maintains `app_settings.updated_at`.
- `touch_leads_updated_at` trigger maintains `leads.updated_at`.

VERIFIED optional seed:

- `sql/generator-seed.sql` inserts starter `term_patterns`, not categories or locations.

Database safety:

- Do not run schema changes without explicit user instruction.
- Never document or expose Supabase credentials.
- Treat all route handlers that use the service role as security-sensitive.

## 9. Authentication / Authorization

VERIFIED:

- No application authentication system is evident in the current code.
- No Supabase Auth flow is implemented in inspected files.
- No middleware-based auth is active; `middleware.ts` only sets `x-pathname`.

SECURITY IMPLICATION:

- The deployed app should be treated as a trusted/private operational tool unless proper authentication is added.
- Because the app exposes powerful server-side mutation routes backed by the Supabase service-role key, adding authentication/authorization is a high-priority future hardening task if anyone beyond the owner will access it.

## 10. Integrations

### Supabase

VERIFIED:

- Used for all persistent app data.
- Client created in `lib/supabase.ts`.
- Requires `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.
- Access happens server-side.

Risks:

- Service-role key bypasses normal row-level constraints. Route handlers must validate requests carefully.
- `.env.example` is tracked; ensure it contains placeholders before sharing the repo.

### Google Places API

VERIFIED:

- Used in `lib/google-places.ts`.
- Text Search endpoint: `https://places.googleapis.com/v1/places:searchText`.
- Place Details endpoint: `https://places.googleapis.com/v1/{resourceName}`.
- Uses `X-Goog-Api-Key` header.
- Text search field mask: `places.id,places.displayName,places.formattedAddress,places.rating,places.name`.
- Details field mask: `id,displayName,formattedAddress,internationalPhoneNumber,nationalPhoneNumber,websiteUri,rating`.
- Requires `GOOGLE_PLACES_API_KEY`.

HISTORICAL CONTEXT:

- The user once hit a Google error because Places API (New) was disabled in the Google Cloud project. Enabling Places API (New), billing, and correct API key restrictions resolved it.

### Vercel

HISTORICAL CONTEXT:

- The app was deployed to `https://leads-hfe-media.vercel.app`.
- Vercel was connected to the GitHub repository.
- Production is expected to update from pushes to `main`.

VERIFIED:

- No `vercel.json` is present.
- The repo has no framework-specific deployment config beyond standard Next.js files.

## 11. UI / UX Structure

VERIFIED routes:

- `/`: Dashboard.
- `/search-terms`: Search Terms queue.
- `/search-terms/generator`: Search Term Generator.
- `/run-search`: Run Search.
- `/leads`: Leads CRM.
- `/call-tracker`: Call Tracker.
- `/already-searched`: Already Searched.
- `/settings`: Settings.

VERIFIED navigation:

- Desktop sidebar in `components/app-shell.tsx`.
- Mobile burger menu in `components/app-shell.tsx`.
- Active route highlighting uses `usePathname()`.
- Search Terms has its own two-tab nav using `SearchTermsNav`.

VERIFIED design conventions:

- Dark background: `#0B0B0B`.
- Cards: `#151515`.
- Border: `#2A2A2A`.
- Gold: `#C99A32`.
- Light gold: `#F3D36B`.
- Text: `#FFFFFF`.
- Muted text: `#B8B8B8`.
- The user repeatedly emphasized no blue.

HISTORICAL CONTEXT:

- A more "modern SaaS" restyle was attempted and then rejected by the user. Do not perform sweeping redesigns without explicit approval.
- The user prefers iterative visual tweaks, often with screenshots and immediate feedback.
- The sidebar logo was adjusted multiple times. Avoid making it more decorative/heavy without user approval.

## 12. Core Workflows

### Manual Search Queue Workflow

VERIFIED:

1. User enters one term or bulk terms in `/search-terms`.
2. User chooses a region, defaulting to South Africa (`za`).
3. API normalizes and deduplicates terms by lower term plus lower region.
4. New rows are inserted into `search_terms` with status `pending`.
5. UI revalidates relevant pages.

### Google Places Run Workflow

VERIFIED:

1. User opens `/run-search`.
2. User chooses batch size and delay.
3. Client calls `/api/run-search/step`.
4. Server loads oldest pending `search_terms` up to batch size.
5. For each term, server calls Google Places Text Search with that term's region.
6. For each result, server calls Place Details.
7. Results with a website are skipped.
8. Results without a website are deduped.
9. New no-website leads are inserted into `leads`.
10. Processed terms are marked `searched`.
11. Progress is returned to the client.

### Generator Workflow

VERIFIED:

1. User imports or activates categories, locations, and patterns.
2. Generator fetches active datasets from Supabase.
3. User filters category groups/provinces and chooses a generation limit.
4. UI builds normalized combinations using `{category}` and `{location}` pattern replacement.
5. User previews combinations.
6. User saves generated terms in 500-row batches through `/api/generator/generated-terms/save-batch`.
7. Server skips terms already in `generated_search_terms` or `search_terms`.
8. User can export generated terms or push them into the main queue.

### Lead CRM / Final Call Workflow

VERIFIED:

1. User opens `/leads` or `/call-tracker`.
2. User clicks `Manage`.
3. A modal opens.
4. User can call through a `tel:` link.
5. User records one final status/outcome for the lead.
6. User can set call date, follow-up date, assigned agent, quote value, won value, and call notes.
7. PATCH `/api/leads/[id]` validates status/outcome and saves fields.
8. Dashboard, Leads CRM, and Call Tracker are revalidated.

HISTORICAL CONTEXT:

- The user specifically clarified that they wanted one final call record per lead, not a call history with many attempts.

## 13. Configuration & Environment

VERIFIED env variable names:

- `NEXT_PUBLIC_APP_URL`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GOOGLE_PLACES_API_KEY`

VERIFIED behaviour:

- `lib/env.ts` considers `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and `GOOGLE_PLACES_API_KEY` required.
- `getMissingEnv()` and `hasCoreEnv()` support setup-mode style empty data.
- `getEnv()` throws if required variables are missing.

HISTORICAL CONTEXT:

- The user originally added env values to `.env.example`, which Next.js does not load at runtime. They were told to create `.env`.
- The user has had `.env` open in screenshots. Future Codex must never echo secret values.

## 14. Build / Run / Development

VERIFIED npm scripts:

- `npm run dev`: starts Next development server.
- `npm run build`: production build.
- `npm start`: starts built app.

VERIFIED package state:

- `node_modules` exists locally.
- `package-lock.json` exists.

Common commands:

```powershell
npm install
npm run dev
npx tsc --noEmit
npm run build
```

VERIFIED:

- There is no `lint` script.
- There is no `test` script.

## 15. Testing / Verification

VERIFIED:

- Recent development frequently used `npx tsc --noEmit` after changes.
- `npm run build` completed successfully earlier in historical context, though it is not re-run in this migration task.

Known testing gaps:

- No automated test suite is present.
- No lint script is present.
- Google Places/Supabase workflows depend on external services and should be manually tested with real environment variables.
- Database schema changes must be tested against Supabase after user approval.

## 16. Hosting / Deployment

HISTORICAL CONTEXT:

- Live Vercel URL: `https://leads-hfe-media.vercel.app`.
- The user wanted to open the app on phone and other devices.
- Vercel was recommended over Firebase Hosting because this app needs server-side Next.js route handlers.
- Firebase App Hosting was identified as possible, but Vercel was the easier path.

VERIFIED:

- Git remote points to `https://github.com/HFE-Media/Lead-Gen-HFE-Media.git`.
- Current branch `main` tracks `origin/main`.
- `deploy.ps1` stages, commits, and pushes local changes. A push to `main` is expected to trigger Vercel automatically.

Deployment safety:

- Do not commit, push, or deploy unless the user explicitly asks.
- Do not assume Vercel environment variables are current; verify in Vercel if deployment problems occur.
- Production requires Vercel env vars matching local required names.

## 17. Git / Development History

VERIFIED meaningful commit milestones from Git:

- `29a18c6 Initial commit`: initial Next.js/Tailwind/Supabase/Google Places app.
- `b5956f0 Improve mobile layout`: mobile responsiveness improvements.
- `0337d96 Improve mobile layout and blend sidebar logo`: early mobile/logo iteration.
- `fe43d81 Refine mobile layout and simplify sidebar logo`: later logo simplification.
- `b3f2b39 Add deploy helper script`: introduced `deploy.ps1`.
- `013bace Add lead call tracking and sales dashboard`: added CRM/call tracking fields and dashboard analytics.
- `fa2f181 Refine dashboard spacing and activity layout`: dashboard spacing pass.
- `c3dc0f8 Move CRM analytics to call tracker and fix mobile open behavior`: moved sales analytics away from Dashboard and improved mobile `Open` behaviour.
- `b2262da Exclude weekends from call tracker activity`: call charts use business days only.
- `244a375 Refine sidebar sizing and spacing`: sidebar stopped stretching full page height.
- `e19e3ca Make call tracker performance chart vertical`: changed sales activity chart to vertical bars.
- `3ebe7fc Remove redundant labels from call tracker chart`: removed repeated `CON/INT/WON` style labels.
- `8c8cf52 Convert lead profile panel into modal popup`: changed lead editor from side panel to modal.
- `359344e Remove top header text from lead modal`: removed duplicate modal shell text.
- `8bcac12 Move modal close button into header and remove redundant close action`: close button placed with modal heading, redundant close button removed.
- `d0468eb Make call notes spacing consistent`: normalized modal field spacing.
- `bdaf3e1 Reduce call notes textarea to four rows`: made call notes less tall.
- `3b8ad1d Change value input step to 50`: number input arrows now increment by 50.
- `9d6634e Remove duplicate call tracker header block`: avoids repeated Call Tracker intro block.
- `bf7d3ff Fix sidebar active state using live pathname`: sidebar active state now uses `usePathname`.
- `934fc56 Make call tracker chart swipeable one-day view on mobile`: mobile chart improvement.
- `c37fbe3 Show two call tracker chart cards at a time on mobile`: current mobile chart shows two cards at a time.
- `4be38ea Center call tracker chart legend`: centered legend.
- `88ff4aa Make lead modal action buttons equal size`: equal Call Lead / Save Update buttons.
- `2e65a98 Replace mobile nav strip with burger menu`: current HEAD, mobile navigation uses burger menu.

HISTORICAL CONTEXT:

- The user frequently asked for small UI refinements and reversions. Many commits represent micro-adjustments after visual review.
- Future changes should be small, screenshot-driven, and easy to revert.

## 18. Major Decisions & Reasoning

Decision: Google Places calls stay server-side.

- Reason: The Google API key must never be exposed in the frontend.
- Evidence classification: VERIFIED and HISTORICAL CONTEXT.
- Current relevance: Critical security boundary.

Decision: Supabase uses server-side service-role client.

- Reason: The current app is a private operational tool and route handlers perform database reads/writes server-side.
- Evidence classification: VERIFIED.
- Current relevance: Keep client components away from service-role access; add auth before wider production use.

Decision: Save only no-website leads.

- Reason: The business value is finding businesses without websites.
- Evidence classification: VERIFIED and HISTORICAL CONTEXT.
- Current relevance: Do not change lead filtering casually.

Decision: Deduplicate by `place_id` first, then by `name + phone`.

- Reason: Place ID is strongest; name plus normalized phone catches cases where place IDs differ or are missing.
- Evidence classification: VERIFIED and HISTORICAL CONTEXT.
- Current relevance: High regression risk in `lib/run-search.ts`.

Decision: Search region defaults to South Africa but is selectable.

- Reason: User wanted South Africa as default but did not want the app limited to only ZA leads.
- Evidence classification: VERIFIED and HISTORICAL CONTEXT.
- Current relevance: Region dropdown and term+region uniqueness should be preserved.

Decision: Generator datasets live in Supabase, not frontend arrays.

- Reason: User explicitly rejected a hardcoded generator and wanted a 50k+ database-driven system.
- Evidence classification: VERIFIED and HISTORICAL CONTEXT.
- Current relevance: Do not reintroduce hardcoded business niche/city/pattern arrays in React/TypeScript.

Decision: One final call record per lead.

- Reason: User clarified they did not want multiple call attempts/history; they wanted a final outcome per lead.
- Evidence classification: VERIFIED and HISTORICAL CONTEXT.
- Current relevance: CRM fields are stored on `leads`, not in a separate call history table.

Decision: Call analytics belong on Call Tracker, not Dashboard.

- Reason: User disliked the dashboard becoming cramped and wanted call charts kept to Call Tracker.
- Evidence classification: VERIFIED and HISTORICAL CONTEXT.
- Current relevance: Avoid moving heavy CRM analytics back onto the Dashboard without user approval.

Decision: Weekends are excluded from call activity charts.

- Reason: User stated no calls happen on Saturday and Sunday.
- Evidence classification: VERIFIED and HISTORICAL CONTEXT.
- Current relevance: `getRecentBusinessDays` in `lib/data.ts` should preserve this business rule.

Decision: Mobile nav uses burger menu.

- Reason: The horizontal mobile nav strip took too much space; user asked for sidebar terms in a burger icon.
- Evidence classification: VERIFIED and HISTORICAL CONTEXT.
- Current relevance: Preserve mobile menu behaviour unless user asks otherwise.

## 19. User Requirements / Preferences

HISTORICAL CONTEXT supported by conversation:

- Use dark charcoal/black UI.
- Use HFE gold accents.
- Use white text.
- Do not use blue.
- Keep the app premium SaaS-like, but avoid broad restyles that change the feel too much.
- Make incremental UI changes and be ready to revert.
- User often evaluates by screenshots and plain visual feel.
- Avoid making the sidebar logo stand out too much.
- Dashboard should not be overloaded with call analytics.
- Call Tracker is the right place for sales/call charts.
- Mobile experience matters because the app is used on phone.
- User wants simple Git/Vercel deployment: one command through `deploy.ps1`.
- User dislikes manual Git complexity, branch confusion, and PR overhead for ordinary updates.
- User wants exact deploy commands after changes.

## 20. Requirements Evolution

Original: Lead generation app focused on South Africa with Google Places `region=za`.

- Changed to: region dropdown with default `za`.
- Reason: User wanted leads outside South Africa too.
- Final/current requirement: default South Africa but allow supported region selection.

Original: Search term generator with hardcoded sample arrays.

- Changed to: database-backed 50k+ generator.
- Reason: User rejected hardcoded categories/areas/patterns.
- Final/current requirement: categories, locations, and patterns come from Supabase; seed examples may be SQL only.

Original: Leads CRM was primarily a list/export surface.

- Changed to: one-final-outcome sales tracker.
- Reason: User wanted call lead option, outcome tracking, charts, and performance visibility.
- Final/current requirement: one final CRM/call record per lead, stored on `leads`.

Original: Dashboard included call/sales analytics.

- Changed to: call analytics live on Call Tracker.
- Reason: User disliked dashboard crampedness.
- Final/current requirement: Dashboard stays lighter; Call Tracker carries performance chart/outcome breakdown.

Original: Lead editor was a side profile panel.

- Changed to: modal popup.
- Reason: User wanted the lead profile to pop over the page rather than take a permanent side column.
- Final/current requirement: `Manage` opens modal popup.

Original: Mobile chart showed all business-day cards at once, then one card at a time.

- Changed to: two chart cards visible at a time on mobile.
- Reason: User wanted a better fit after seeing one-card and squeezed variants.
- Final/current requirement: mobile Call Tracker chart shows two day cards at a time.

## 21. Previous Problems / Bugs / Regressions

Problem: App crashed when `.env` was missing.

- Cause: required env access threw during dashboard data loading.
- Fix: data loaders can return empty/setup states when core env is missing.
- Current status: VERIFIED in `lib/env.ts` and `lib/data.ts`.
- Regression risk: adding new server loaders that call `getSupabaseAdmin()` without checking env may reintroduce crashes.

Problem: User edited `.env.example` instead of `.env`.

- Cause: Next.js does not load `.env.example`.
- Fix: User was told to create real `.env`; README documents this.
- Current status: HISTORICAL CONTEXT.
- Regression risk: future docs/UI should keep this distinction clear.

Problem: Google Places API (New) disabled.

- Cause: Google Cloud project did not have Places API (New) enabled or propagated.
- Fix: User enabled the API and billing/key restrictions as needed.
- Current status: HISTORICAL CONTEXT; user reported it worked.
- Regression risk: new deployments/projects can hit the same Google error.

Problem: Supabase schema rerun failed dropping `search_terms_term_key` as an index.

- Cause: old uniqueness existed as a constraint, not only an index.
- Fix: `sql/schema.sql` now drops the constraint before dropping old indexes and creating term+region uniqueness.
- Current status: VERIFIED.
- Regression risk: altering uniqueness around search terms should be done carefully.

Problem: Generator page crashed when generator tables did not exist.

- Cause: data loader threw Supabase table/schema cache error.
- Fix: `getGeneratorDataset()` returns setup-required state for missing generator tables.
- Current status: VERIFIED.
- Regression risk: new generator queries should preserve setup fallback behaviour.

Problem: Sidebar active item could stick to the previous page.

- Cause: active state was based on custom server-passed `x-pathname` header that could lag.
- Fix: `components/app-shell.tsx` now uses `usePathname()`.
- Current status: VERIFIED.
- Regression risk: avoid returning to header-based active navigation state.

Problem: Mobile lead `Open`/`Manage` felt broken.

- Cause: selection changed but editor was elsewhere/lower on page.
- Fix: lead editor became a modal.
- Current status: VERIFIED.
- Regression risk: avoid hidden below-page editors on mobile.

Problem: Call Tracker chart displayed weekends.

- Cause: rolling 7-day window included Saturday/Sunday.
- Fix: `getRecentBusinessDays(5)` skips weekends.
- Current status: VERIFIED.
- Regression risk: any activity date logic should preserve business-day-only rule.

## 22. Failed / Rejected Approaches

REJECTED / ABANDONED:

- Hardcoded Search Term Generator arrays in frontend/TypeScript. User explicitly asked to remove it and build database-driven generator properly.
- Broad modern premium SaaS restyle across UI. User asked to revert back after disliking the visual direction.
- Heavy/framed sidebar logo treatment. User said it looked worse and it was simplified.
- Keeping call/sales analytics on Dashboard. User disliked the cramped dashboard and asked for charts to live in Call Tracker.
- Lead profile as a permanent side panel. User wanted a popup.
- Modal that only covered main content on desktop and full screen on mobile. User asked to revert.
- Removing the inner `Lead Profile` label while keeping the top modal shell text. User clarified the opposite: remove top shell text, keep inner label.
- Moving `Save Update` to the bottom of the popup. User asked to revert.
- Centering the modal buttons initially. User asked to revert, then later asked to make the two buttons equal size.
- Removing `Call Notes`. User later asked to restore it.
- One-day-only mobile chart. User then asked for two chart cards instead.

## 23. Current Work In Progress

VERIFIED before migration docs:

- Git working tree was clean.
- Current branch was `main`.
- Local `main` tracked `origin/main`.
- No uncommitted app code changes were present before this documentation task.

CURRENT WIP created by this migration task:

- `AGENTS.md`
- `CODEX_HANDOVER.md`

UNKNOWN / NEEDS VERIFICATION:

- Whether the live Vercel deployment has all latest local/GitHub commits deployed.
- Whether production Supabase schema has every latest column/constraint from `sql/schema.sql`.
- Whether `.env.example` in the remote repository contains only placeholders. Do not inspect or print secret values without a security-specific task.

## 24. Production / Stable / WIP Boundary

VERIFIED:

- `main` and `origin/main` point to `2e65a98`.
- Local repo was clean before this migration task.
- Application code is committed at snapshot.

HISTORICAL CONTEXT:

- Production Vercel URL exists at `https://leads-hfe-media.vercel.app`.
- User deploys by pushing to GitHub, often via `deploy.ps1`.

UNKNOWN / NEEDS VERIFICATION:

- Whether the deployed Vercel instance currently serves commit `2e65a98`.
- Whether Vercel environment variables include `NEXT_PUBLIC_APP_URL`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and `GOOGLE_PLACES_API_KEY`.
- Whether Google Cloud API key restrictions are production-ready.

## 25. Known Issues

VERIFIED / EVIDENCE-BASED:

- No automated test suite exists.
- No lint script exists.
- No auth system is implemented.
- Next.js version is `14.2.30`; earlier historical build output warned that this version was outdated with a security advisory.
- `tsconfig.tsbuildinfo` is tracked in Git. This is not a functional blocker, but it is usually build metadata and could be ignored in future.

HISTORICAL CONTEXT:

- User is still visually tuning UI details. Expect further small UI adjustment requests.

UNKNOWN / NEEDS VERIFICATION:

- Whether `.env.example` contains real secrets in the remote repository. Historical screenshots suggested env values may have been placed there at one point. This should be audited before making the repo public or sharing broadly.

## 26. High-Risk Areas

- `lib/run-search.ts`: mutates queue and leads, uses Google API, controls dedupe, and may generate API costs.
- `lib/google-places.ts`: key handling, field masks, external API behaviour, billing/rate constraints.
- `app/api/run-search/step/route.ts`: entry point for costly search batches.
- `app/api/generator/*`: high-volume writes, CSV imports, batch generation, queue pushing.
- `app/api/leads/[id]/route.ts`: CRM mutation route using service-role access.
- `sql/schema.sql`: database shape and constraints.
- `components/leads-table.tsx`: heavily iterated UI with user-specific preferences; avoid sweeping changes.
- `components/app-shell.tsx`: mobile navigation and active route state.
- `deploy.ps1`: creates commits and pushes, likely triggering Vercel.

## 27. Important Files Reference

- `AGENTS.md`: durable operating instructions for future Codex.
- `CODEX_HANDOVER.md`: this migration and historical context document.
- `README.md`: user-facing setup instructions.
- `package.json`: scripts and dependencies.
- `sql/schema.sql`: Supabase schema and idempotent alterations.
- `sql/generator-seed.sql`: starter pattern rows.
- `lib/env.ts`: required env vars and setup detection.
- `lib/supabase.ts`: service-role Supabase client.
- `lib/google-places.ts`: Google Places API calls.
- `lib/run-search.ts`: search execution and lead save logic.
- `lib/data.ts`: server data loading and metrics aggregation.
- `lib/search-term-generator.ts`: generator normalization, batch splitting, CSV parsing.
- `lib/crm.ts`: lead status and call outcome constants.
- `lib/regions.ts`: supported regions and default region.
- `components/app-shell.tsx`: desktop/mobile navigation.
- `components/leads-table.tsx`: Leads CRM and Call Tracker shared UI.
- `components/search-term-generator.tsx`: generator UI.
- `components/run-search-panel.tsx`: batch execution UI.
- `deploy.ps1`: one-command commit/push helper.

## 28. Important Identifiers / Terminology

- Search term: A phrase queued for Google Places Text Search.
- Region: Google Places region code stored on `search_terms`; default is `za`.
- No-website lead: A Google Place where Place Details returns no `websiteUri`.
- Generated term: A term created from category/location/pattern combinations before entering the main queue.
- Call Tracker: Dedicated page for final lead outcome tracking and sales analytics.
- Lead status: Current pipeline state stored on `leads.lead_status`.
- Call outcome: Final call result stored on `leads.call_outcome`.
- Follow-up: `leads.follow_up_at`; due items appear in tracker/dashboard contexts.
- Service-role key: Supabase secret used server-side only.

## 29. Current Outstanding Work

REQUIRED:

- None known for migration itself after `AGENTS.md` and `CODEX_HANDOVER.md` are created.

RECOMMENDED:

- Add authentication/authorization before broader production use.
- Audit `.env.example` and Git history for accidental secrets before making the repo public or transferring broadly.
- Add a lint script and basic automated tests.
- Upgrade Next.js from `14.2.30` after checking compatibility.
- Consider ignoring/removing `tsconfig.tsbuildinfo` from version control in a future dedicated change.
- Verify production Supabase schema matches `sql/schema.sql`.
- Verify Vercel environment variables in the new work account if ownership/deployment moves.

OPTIONAL / FUTURE:

- Improve charts with a charting library if analytics become more important.
- Add filters by source term, city, province, and lead value.
- Add authentication and agent-level reporting if multiple users use the app.
- Add audit logs for lead changes if accountability becomes important.
- Add clearer CSV templates for generator imports.

## 30. Ideas / Future Roadmap

PLANNED / PROPOSED, not verified implemented:

- More complete CRM reporting by source term, location, and outcome.
- Team/agent performance tracking if multiple people use the app.
- Follow-up reminders and overdue queue improvements.
- Production-grade auth and private access controls.
- Better import validation and CSV templates for generator datasets.
- More mobile polish on data-heavy screens.

## 31. What Must Not Be Lost

The most important context for a future Codex:

- This is HFE Media's lead engine, not a generic demo dashboard.
- The brand direction is dark black/charcoal with HFE gold and white text, with no blue.
- Google Places and Supabase service-role keys must stay server-side.
- Leads are saved only when the business has no website.
- Duplicate prevention is core business logic.
- Search regions are selectable; South Africa remains the default.
- The generator must be database-driven, not hardcoded.
- The user explicitly wants one final call/outcome per lead.
- Call analytics belong in Call Tracker, not the main Dashboard.
- Saturdays and Sundays should not appear as call activity days.
- The user values fast, small, reversible UI iterations.
- Do not commit, push, or deploy unless explicitly asked.

## 32. New Codex Startup Procedure

When a new Codex account opens this repository:

1. Read `AGENTS.md` completely.
2. Read `CODEX_HANDOVER.md` completely.
3. Run `git status --short --branch`.
4. Confirm current branch and HEAD.
5. Compare current state against the migration snapshot.
6. Inspect recent Git history if HEAD changed.
7. Understand the user's latest requested task.
8. Inspect affected implementation before editing.
9. Preserve unrelated user work.
10. Make the smallest safe change.
11. Run appropriate verification, usually `npx tsc --noEmit`.
12. Report files changed and verification performed.
13. Give the user a deploy command when they want Vercel/GitHub updated.
14. Never deploy, push, merge, or change database/cloud services unless explicitly instructed.

## 33. Migration Verification Appendix

Commands/evidence used for this handover:

- `git status --short --branch`
- `git branch --all --verbose`
- `git log --oneline --decorate --graph -20`
- `git log --oneline --decorate --all --max-count=50`
- `git rev-parse HEAD`
- `git remote -v`
- `rg --files`
- `Get-ChildItem -Force`
- `Get-ChildItem -Recurse -Force -Filter AGENTS.md`
- `Get-ChildItem -Recurse -Force -Filter CODEX_HANDOVER.md`
- `Get-Content README.md`
- `Get-Content package.json`
- `Get-Content .gitignore`
- `Get-Content deploy.ps1`
- `Get-Content sql/schema.sql`
- `Get-Content sql/generator-seed.sql`
- `Get-Content lib/env.ts`
- `Get-Content lib/supabase.ts`
- `Get-Content lib/google-places.ts`
- `Get-Content lib/run-search.ts`
- `Get-Content lib/search-term-generator.ts`
- `Get-Content lib/crm.ts`
- `Get-Content lib/regions.ts`
- `Get-Content lib/utils.ts`
- `Get-Content app/layout.tsx`
- `Get-Content app/call-tracker/page.tsx`
- `Get-Content app/search-terms/page.tsx`
- `Get-Content app/search-terms/generator/page.tsx`
- `Get-Content app/leads/page.tsx`
- `Get-Content app/run-search/page.tsx`
- `Get-Content app/api/search-terms/route.ts`
- `Get-Content app/api/run-search/step/route.ts`
- `Get-Content -LiteralPath app/api/leads/[id]/route.ts`
- `Get-Content app/api/generator/import/route.ts`
- `Get-Content app/api/generator/generated-terms/save-batch/route.ts`
- `Get-Content app/api/generator/push-to-queue-batch/route.ts`
- `Get-Content app/api/generator/toggle/route.ts`

Secret safety:

- This handover intentionally documents environment variable names only.
- It does not include API keys, tokens, passwords, JWTs, connection strings with credentials, cookies, or private key values.
