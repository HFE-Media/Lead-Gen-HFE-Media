import { StatCard } from "@/components/stat-card";
import { getDashboardMetrics } from "@/lib/data";
import { getMissingEnv } from "@/lib/env";
import { formatDate } from "@/lib/utils";

export default async function DashboardPage() {
  const metrics = await getDashboardMetrics();
  const missingEnv = getMissingEnv();
  const needsSetup = missingEnv.length > 0;

  return (
    <div className="space-y-6">
      <section className="panel bg-panel p-8">
        <p className="text-xs uppercase tracking-[0.28em] text-muted">Dashboard</p>
        <h1 className="mt-4 max-w-3xl font-display text-5xl text-white">
          Premium South African lead discovery for HFE Media.
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-muted">
          Find businesses that still have no website, keep the pipeline de-duplicated, and move fresh
          opportunities into a clean exportable CRM.
        </p>
      </section>

      {needsSetup ? (
        <section className="panel border-gold/30 bg-gold/10 p-6">
          <p className="text-xs uppercase tracking-[0.28em] text-lightGold">Setup required</p>
          <h2 className="mt-3 font-display text-3xl text-white">
            Add your environment variables to start using live data.
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">
            The app is loading in setup mode because the server is missing required secrets. Create a
            <code className="mx-1 rounded bg-background px-2 py-1 text-white">.env</code>
            file from
            <code className="mx-1 rounded bg-background px-2 py-1 text-white">.env.example</code>,
            add the values below, run the SQL schema in Supabase, then restart
            <code className="mx-1 rounded bg-background px-2 py-1 text-white">npm run dev</code>.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            {missingEnv.map((item) => (
              <span
                key={item}
                className="rounded-full border border-gold/30 bg-background px-4 py-2 text-xs uppercase tracking-[0.22em] text-lightGold"
              >
                {item}
              </span>
            ))}
          </div>
          <p className="mt-5 text-sm text-muted">
            Apply the schema from
            <code className="mx-1 rounded bg-background px-2 py-1 text-white">sql/schema.sql</code>
            and then reload the app.
          </p>
        </section>
      ) : null}

      <section className="grid gap-6 md:grid-cols-3">
        <StatCard
          label="Leads Captured"
          value={metrics.totalLeads}
          footnote="Businesses with no website found through Google Places."
        />
        <StatCard
          label="Pending Terms"
          value={metrics.pendingTerms}
          footnote="Queued search phrases waiting to be processed."
        />
        <StatCard
          label="Already Searched"
          value={metrics.searchedTerms}
          footnote="Terms completed and locked as searched."
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="panel overflow-hidden">
          <div className="border-b border-border px-6 py-5">
            <p className="text-xs uppercase tracking-[0.28em] text-muted">Recent leads</p>
            <h2 className="mt-2 font-display text-2xl text-white">Latest opportunities</h2>
          </div>
          <div className="divide-y divide-border">
            {metrics.latestLeads.map((lead) => (
              <div key={lead.id} className="px-6 py-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium text-white">{lead.name}</p>
                    <p className="mt-1 text-sm text-muted">{lead.formatted_address ?? "Unknown address"}</p>
                  </div>
                  <div className="rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-lightGold">
                    {lead.rating ?? "-"} rating
                  </div>
                </div>
              </div>
            ))}
            {metrics.latestLeads.length === 0 ? (
              <p className="px-6 py-10 text-sm text-muted">No leads captured yet.</p>
            ) : null}
          </div>
        </div>

        <div className="panel overflow-hidden">
          <div className="border-b border-border px-6 py-5">
            <p className="text-xs uppercase tracking-[0.28em] text-muted">Recent searches</p>
            <h2 className="mt-2 font-display text-2xl text-white">Search queue activity</h2>
          </div>
          <div className="divide-y divide-border">
            {metrics.latestSearches.map((term) => (
              <div key={term.id} className="px-6 py-5">
                <p className="font-medium text-white">{term.term}</p>
                <p className="mt-1 text-sm text-muted">
                  {term.status} - {term.result_count} results - {formatDate(term.searched_at)}
                </p>
              </div>
            ))}
            {metrics.latestSearches.length === 0 ? (
              <p className="px-6 py-10 text-sm text-muted">No search terms in the database yet.</p>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}
