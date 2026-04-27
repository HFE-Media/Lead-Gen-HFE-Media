# HFE Media Lead Engine

Premium lead generation SaaS dashboard for HFE Media. The app uses Next.js App Router, TypeScript, Tailwind CSS, Supabase, and the Google Places API to find South African businesses that do not have a website.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase
- Google Places API

## Features

- Add single or bulk search terms with a selectable region
- Generate 1k to 50k+ search terms from database-driven categories, locations, and patterns
- Import categories, locations, and patterns from CSV
- Export generated terms to CSV and push them into the main search queue
- Run Google Places Text Search with each term's saved region, defaulting to `za`
- Fetch Place Details for each place result
- Save only leads where `website` is empty
- Prevent duplicates by `place_id`, then `name + phone`
- Mark search terms as searched
- Show live progress while running batches
- Export leads to CSV
- Configure default batch size and delay

## Environment variables

Create a `.env` file in the project root:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
GOOGLE_PLACES_API_KEY=your_google_places_api_key
```

Notes:

- Keep all keys in `.env` only.
- The Google Places API key is never used in the frontend.
- Supabase is accessed server-side via the service role key.

## Supabase setup

1. Create a new Supabase project.
2. Open the SQL editor.
3. Run the schema from [sql/schema.sql](/C:/dev/Lead%20HFE/sql/schema.sql).
4. Copy your project URL and service role key into `.env`.
5. Optionally run [sql/generator-seed.sql](/C:/dev/Lead%20HFE/sql/generator-seed.sql) to preload starter pattern rows into `term_patterns`.

If you created the database before region selection was added, re-run the schema so `search_terms` becomes unique by `term + region` instead of `term` only.

## Google Places setup

1. Create or open a Google Cloud project.
2. Enable the Places API.
3. Create an API key with Places API access.
4. Add the key to `.env` as `GOOGLE_PLACES_API_KEY`.

## Local development

1. Install dependencies:

```bash
npm install
```

2. Start the app:

```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000).

## Production build

```bash
npm run build
```

## Pages

- `/` Dashboard
- `/search-terms` Search Terms
- `/search-terms/generator` Search Term Generator
- `/run-search` Run Search
- `/leads` Leads CRM
- `/already-searched` Already Searched
- `/settings` Settings

## Branding note

The UI follows the supplied HFE Media visual direction with the uploaded brand asset as reference, while keeping the product palette locked to black, charcoal, gold, light gold, white, and muted gray only.
