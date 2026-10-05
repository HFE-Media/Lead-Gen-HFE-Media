# HFE Media Lead Engine - Codex Instructions

## Project Purpose

This repository is a lead generation and sales tracking SaaS app for HFE Media. It uses Google Places to find businesses, stores no-website leads in Supabase, and provides queue management, generated search terms, a leads CRM, and a call tracker.

## Start Here

Future Codex instances should:

1. Read this `AGENTS.md`.
2. Read `CODEX_HANDOVER.md`.
3. Check `git status --short --branch`.
4. Check the current branch and `HEAD`.
5. Verify the handover against the current repository before substantial work.
6. Inspect affected files before editing.

## Repository Overview

- `app/`: Next.js App Router pages and route handlers.
- `app/api/`: Server-only API routes for search terms, Google Places execution, generator operations, settings, leads updates, and CSV exports.
- `components/`: Reusable UI components and client-side workflow components.
- `lib/`: Server/data utilities, Supabase client creation, Google Places integration, generator logic, CRM constants, types, and formatting helpers.
- `sql/`: Supabase schema and optional seed SQL.
- `deploy.ps1`: Local helper script that stages, commits, and pushes changes when the user explicitly chooses to deploy through GitHub/Vercel.
- `logo.png` and `Frontend.png`: Project visual assets. `logo.png` is used for the HFE brand identity.

## Architecture

- This is a Next.js App Router app using TypeScript.
- Supabase is accessed from server-side code with the service role key.
- Google Places API calls must remain server-side.
- Browser/client components must call local Next.js API routes rather than directly calling Supabase service-role operations or Google Places.
- The main search queue is `search_terms`.
- Google Places results are saved to `leads` only when a place has no website.
- The generator uses database-backed datasets and writes to `generated_search_terms` before pushing selected batches into `search_terms`.
- Lead call tracking is stored on the `leads` table as a single current/final call record per lead, not as a many-call history table.

## Development Rules

- Preserve the established dark HFE visual direction: black/charcoal background, gold accents, white text, muted gray supporting text.
- Do not introduce blue UI elements unless the user explicitly changes the brand direction.
- Keep server secrets out of React components and browser-executed code.
- Keep changes scoped. The user often requests small visual adjustments and expects only that exact area to change.
- Use `apply_patch` for manual edits.
- Use `rg` / `rg --files` for searching when possible.
- Run `npx tsc --noEmit` after TypeScript or UI component changes.
- Do not create new abstractions unless they clearly simplify a real repeated pattern.

## Existing Behaviour Preservation

Do not casually change these behaviours:

- Google Places key is never exposed to the frontend.
- Search terms default to South Africa region code `za`, but the user can choose other supported regions.
- Search terms are unique by normalized `term + region`, not by term alone.
- Leads are deduplicated by `place_id` first, then by `name + normalized phone`.
- Only leads without a website are saved.
- Search terms are marked `searched` after processing.
- Batch size and delay controls are user-adjustable.
- Generator categories, locations, and patterns come from Supabase tables, not hardcoded React/TypeScript arrays.
- Call tracker analytics should live in the Call Tracker page, not clutter the main Dashboard.
- One final call/outcome record is stored per lead.

## Git Safety

- Inspect `git status --short --branch` before significant work.
- Preserve unrelated user changes.
- Do not reset, discard, rebase, merge, switch branches, commit, push, or deploy unless the user explicitly asks.
- The expected production branch is `main`.
- The GitHub remote currently points to `https://github.com/HFE-Media/Lead-Gen-HFE-Media.git`.
- Use `deploy.ps1` only when the user wants local changes committed and pushed.

## Database Safety

- Supabase schema lives in `sql/schema.sql`.
- Optional pattern seed data lives in `sql/generator-seed.sql`.
- Do not run database migrations or alter Supabase without explicit user instruction.
- Re-running `sql/schema.sql` is intended to be mostly idempotent, using `create table if not exists`, `add column if not exists`, and index/constraint guards, but it still changes database structure and must be user-approved.
- Never delete production data unless explicitly requested and confirmed.
- Treat service-role access as high risk.

## Authentication / Security

- The current app evidence shows no user authentication system.
- Supabase is used through a server-side service-role client.
- Because service-role access is powerful, route handlers are security-sensitive.
- Do not move service-role operations into client components.
- Do not document or expose secret values.

## Environment & Secrets

Document names only, never values:

- `NEXT_PUBLIC_APP_URL`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GOOGLE_PLACES_API_KEY`

Important:

- `.env` and `.env.local` are ignored by Git.
- `.env.example` is tracked. Before making a repo public or sharing it, verify that `.env.example` contains placeholders only.
- Do not paste secrets into docs, issues, commit messages, screenshots, or chat responses.

## Testing & Verification

Verified available commands:

- `npm run dev`
- `npm run build`
- `npm start`
- `npx tsc --noEmit`

There is no `test` or `lint` script in `package.json` at the migration snapshot. Prefer `npx tsc --noEmit` for quick TypeScript verification and `npm run build` for production validation when appropriate.

## Deployment Safety

- The app has been deployed historically to Vercel at `https://leads-hfe-media.vercel.app`.
- Vercel production deployments are expected to follow pushes to `main`.
- Do not deploy merely because implementation is complete.
- Do not run `deploy.ps1`, `git push`, or Vercel commands unless the user explicitly asks.
- Vercel environment variables must be configured in Vercel separately from local `.env`.

## High-Risk Areas

- `lib/google-places.ts`: external API usage, field masks, billing-sensitive calls, and key secrecy.
- `lib/run-search.ts`: lead saving, duplicate prevention, queue mutation, and Google API rate behavior.
- `app/api/*`: server-side mutation and service-role access.
- `sql/schema.sql`: data model, constraints, idempotent migration behaviour.
- `components/leads-table.tsx`: lead editing modal, mobile behaviour, and one-final-outcome workflow.
- `components/search-term-generator.tsx`: high-volume generation and batch save/push UI.
- `deploy.ps1`: commits and pushes to GitHub, which can trigger Vercel.

## Documentation Expectations

Update `README.md`, `AGENTS.md`, or `CODEX_HANDOVER.md` when architecture, deployment flow, environment variables, database shape, or durable user preferences materially change.

## Handover

Future Codex instances must read `CODEX_HANDOVER.md` before substantial project work. It contains historical context from the previous account that is not otherwise recoverable from the repository alone.
