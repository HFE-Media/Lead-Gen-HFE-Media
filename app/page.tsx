import Link from "next/link";
import { getDashboardMetrics } from "@/lib/data";
import { getMissingEnv } from "@/lib/env";
import { formatDate } from "@/lib/utils";

export default async function DashboardPage() {
  const metrics = await getDashboardMetrics();
  const missingEnv = getMissingEnv();
  const needsSetup = missingEnv.length > 0;

  return (
    <div className="space-y-6">
      <section className="panel bg-panel p-6 lg:p-8">
        <p className="text-xs uppercase tracking-[0.28em] text-muted">Dashboard</p>
        <h1 className="mt-4 max-w-5xl font-display text-3xl text-white sm:text-4xl xl:text-[3.35rem] xl:leading-[1.05]">
          Premium South African lead discovery and sales tracking for HFE Media.
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-muted sm:text-[15px]">
          Find no-website businesses, move them through a sales pipeline, and keep every final outcome visible from one dashboard.
        </p>
      </section>

      {needsSetup ? (
        <section className="panel border-gold/30 bg-gold/10 p-6">
          <p className="text-xs uppercase tracking-[0.28em] text-lightGold">Setup required</p>
          <h2 className="mt-3 font-display text-3xl text-white">Add your environment variables to start using live data.</h2>
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
              <span key={item} className="rounded-full border border-gold/30 bg-background px-4 py-2 text-xs uppercase tracking-[0.22em] text-lightGold">
                {item}
              </span>
            ))}
          </div>
        </section>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <DashboardCard label="Total Leads" value={metrics.totalLeads} footnote="All no-website opportunities captured so far." />
        <DashboardCard label="Pending Terms" value={metrics.pendingTerms} footnote="Search phrases still waiting to be processed." />
        <DashboardCard label="Already Searched" value={metrics.searchedTerms} footnote="Terms completed and locked as searched." />
        <DashboardCard label="Follow-ups Due" value={metrics.followUpsDue.length} footnote="Leads that need action in the call tracker." />
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_340px]">
        <div className="space-y-6">
          <div className="panel overflow-hidden">
            <div className="border-b border-border px-6 py-5">
              <p className="text-xs uppercase tracking-[0.28em] text-muted">Recent Leads</p>
              <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="font-display text-2xl text-white">Latest no-website opportunities</h2>
                <Link
                  href="/leads"
                  className="inline-flex h-11 items-center justify-center rounded-2xl border border-gold/30 bg-background px-5 text-sm font-medium text-white transition hover:border-gold hover:text-lightGold"
                >
                  View Leads CRM
                </Link>
              </div>
            </div>
            <div className="divide-y divide-border">
              {metrics.latestLeads.map((lead) => (
                <div key={lead.id} className="px-6 py-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="font-medium text-white">{lead.name}</p>
                      <p className="mt-1 text-sm text-muted">{lead.formatted_address ?? "Unknown address"}</p>
                      <p className="mt-2 text-xs uppercase tracking-[0.2em] text-lightGold">{lead.source_term ?? "No source term"}</p>
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-2">
                      <span className="rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-lightGold">
                        {lead.rating ?? "-"} rating
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {metrics.latestLeads.length === 0 ? <p className="px-6 py-10 text-sm text-muted">No leads captured yet.</p> : null}
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <div className="panel overflow-hidden">
              <div className="border-b border-border px-6 py-5">
                <p className="text-xs uppercase tracking-[0.28em] text-muted">Call Tracker</p>
                <h2 className="mt-2 font-display text-2xl text-white">Sales performance lives here now</h2>
              </div>
              <div className="space-y-4 px-6 py-6">
                <p className="text-sm leading-7 text-muted">
                  Call outcomes, conversion charts, follow-ups, and closing performance have been moved out of the dashboard so this page stays clean and easier to scan.
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <TrackerHint label="Contacted" value={metrics.contactedLeads} />
                  <TrackerHint label="Interested" value={metrics.interestedLeads} />
                  <TrackerHint label="Won" value={metrics.wonLeads} />
                  <TrackerHint label="Follow-ups Due" value={metrics.followUpsDue.length} />
                </div>
                <Link
                  href="/call-tracker"
                  className="inline-flex h-11 items-center justify-center rounded-2xl border border-gold/30 bg-gold px-5 font-medium text-background transition hover:bg-lightGold"
                >
                  Open Call Tracker
                </Link>
              </div>
            </div>

            <div className="panel overflow-hidden">
              <div className="border-b border-border px-6 py-5">
                <p className="text-xs uppercase tracking-[0.28em] text-muted">Search Queue</p>
                <h2 className="mt-2 font-display text-2xl text-white">{metrics.pendingTerms} pending terms</h2>
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
                {metrics.latestSearches.length === 0 ? <p className="px-6 py-10 text-sm text-muted">No search terms in the database yet.</p> : null}
              </div>
              <div className="border-t border-border px-6 py-5">
                <Link
                  href="/search-terms"
                  className="inline-flex h-11 items-center justify-center rounded-2xl border border-border bg-background px-5 text-sm font-medium text-white transition hover:border-gold hover:text-lightGold"
                >
                  Manage Search Terms
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="panel overflow-hidden">
            <div className="border-b border-border px-6 py-5">
              <p className="text-xs uppercase tracking-[0.28em] text-muted">Follow-up Queue</p>
              <h2 className="mt-2 font-display text-2xl text-white">{metrics.followUpsDue.length} due now</h2>
            </div>
            <div className="divide-y divide-border">
              {metrics.followUpsDue.map((lead) => (
                <div key={lead.id} className="px-6 py-5">
                  <p className="font-medium text-white">{lead.name}</p>
                  <p className="mt-1 text-sm text-muted">{lead.formatted_phone_number ?? "Unknown number"}</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.2em] text-lightGold">Follow-up {formatDate(lead.follow_up_at)}</p>
                </div>
              ))}
              {metrics.followUpsDue.length === 0 ? <p className="px-6 py-10 text-sm text-muted">No follow-ups are due right now.</p> : null}
            </div>
          </div>

          <div className="panel overflow-hidden">
            <div className="border-b border-border px-6 py-5">
              <p className="text-xs uppercase tracking-[0.28em] text-muted">Quick Actions</p>
              <h2 className="mt-2 font-display text-2xl text-white">Move faster</h2>
            </div>
            <div className="grid gap-3 px-6 py-6">
              <Link
                href="/run-search"
                className="inline-flex h-11 items-center justify-center rounded-2xl border border-gold/30 bg-gold px-5 font-medium text-background transition hover:bg-lightGold"
              >
                Run Search
              </Link>
              <Link
                href="/search-terms"
                className="inline-flex h-11 items-center justify-center rounded-2xl border border-border bg-background px-5 font-medium text-white transition hover:border-gold hover:text-lightGold"
              >
                Add Search Terms
              </Link>
              <Link
                href="/leads"
                className="inline-flex h-11 items-center justify-center rounded-2xl border border-border bg-background px-5 font-medium text-white transition hover:border-gold hover:text-lightGold"
              >
                View Leads CRM
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function DashboardCard({ label, value, footnote }: { label: string; value: string | number; footnote: string }) {
  return (
    <div className="panel bg-panel p-5 lg:p-6">
      <p className="text-xs uppercase tracking-[0.28em] text-muted">{label}</p>
      <p className="mt-3 font-display text-3xl text-white lg:text-[2.2rem]">{value}</p>
      <p className="mt-2 text-sm leading-6 text-muted">{footnote}</p>
    </div>
  );
}

function TrackerHint({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-border bg-background/70 px-4 py-3">
      <p className="text-xs uppercase tracking-[0.22em] text-muted">{label}</p>
      <p className="mt-2 font-display text-2xl text-white">{value}</p>
    </div>
  );
}
