import Link from "next/link";
import { StatCard } from "@/components/stat-card";
import { getDashboardMetrics } from "@/lib/data";
import { getMissingEnv } from "@/lib/env";
import { formatDate } from "@/lib/utils";

export default async function DashboardPage() {
  const metrics = await getDashboardMetrics();
  const missingEnv = getMissingEnv();
  const needsSetup = missingEnv.length > 0;
  const maxActivity = Math.max(1, ...metrics.activitySeries.map((item) => Math.max(item.contacted, item.interested, item.won)));
  const maxOutcome = Math.max(1, ...metrics.outcomeBreakdown.map((item) => item.value));

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

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Total Leads" value={metrics.totalLeads} footnote="All no-website leads captured so far." />
        <StatCard label="No Website Leads" value={metrics.noWebsiteLeads} footnote="Qualified raw opportunities in the CRM." />
        <StatCard label="Contacted" value={metrics.contactedLeads} footnote="Leads that have been called or closed out." />
        <StatCard label="Interested" value={metrics.interestedLeads} footnote="Leads that showed buying intent or requested a quote." />
        <StatCard label="Won" value={metrics.wonLeads} footnote="Leads converted into closed business." />
      </section>

      <section className="grid gap-6 2xl:grid-cols-[minmax(0,1.2fr)_360px]">
        <div className="space-y-6">
          <div className="panel overflow-hidden">
            <div className="border-b border-border px-6 py-5">
              <p className="text-xs uppercase tracking-[0.28em] text-muted">Sales Activity</p>
              <h2 className="mt-2 font-display text-2xl text-white">Lead performance over the last 7 days</h2>
            </div>
            <div className="border-b border-border/80 px-6 py-4">
              <div className="flex flex-wrap gap-4 text-xs uppercase tracking-[0.18em] text-muted">
                <LegendPill label="Contacted" tone="bg-gold" />
                <LegendPill label="Interested" tone="bg-lightGold" />
                <LegendPill label="Won" tone="bg-white" />
              </div>
            </div>
            <div className="space-y-3 px-6 py-6">
              {metrics.activitySeries.map((item) => (
                <div
                  key={item.date}
                  className="grid gap-4 rounded-3xl border border-border/80 bg-background/70 p-4 transition hover:border-gold/30 sm:grid-cols-[92px_minmax(0,1fr)] sm:items-center"
                >
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-muted">{item.date.slice(5)}</p>
                    <p className="mt-1 text-sm text-white">{formatDayLabel(item.date)}</p>
                  </div>
                  <div className="space-y-3">
                    <MetricBar label="Contacted" value={item.contacted} max={maxActivity} tone="bg-gold" />
                    <MetricBar label="Interested" value={item.interested} max={maxActivity} tone="bg-lightGold" />
                    <MetricBar label="Won" value={item.won} max={maxActivity} tone="bg-white" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <div className="panel overflow-hidden">
              <div className="border-b border-border px-6 py-5">
                <p className="text-xs uppercase tracking-[0.28em] text-muted">Recent Leads</p>
                <h2 className="mt-2 font-display text-2xl text-white">Latest opportunities</h2>
              </div>
              <div className="divide-y divide-border">
                {metrics.latestLeads.map((lead) => (
                  <div key={lead.id} className="px-6 py-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-medium text-white">{lead.name}</p>
                        <p className="mt-1 text-sm text-muted">{lead.formatted_address ?? "Unknown address"}</p>
                        <p className="mt-2 text-xs uppercase tracking-[0.2em] text-lightGold">{lead.lead_status}</p>
                      </div>
                      <div className="rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-lightGold">
                        {lead.rating ?? "-"} rating
                      </div>
                    </div>
                  </div>
                ))}
                {metrics.latestLeads.length === 0 ? <p className="px-6 py-10 text-sm text-muted">No leads captured yet.</p> : null}
              </div>
            </div>

            <div className="panel overflow-hidden">
              <div className="border-b border-border px-6 py-5">
                <p className="text-xs uppercase tracking-[0.28em] text-muted">Outcome Breakdown</p>
                <h2 className="mt-2 font-display text-2xl text-white">How calls are resolving</h2>
              </div>
              <div className="space-y-4 px-6 py-6">
                {metrics.outcomeBreakdown.length > 0 ? (
                  metrics.outcomeBreakdown.map((item) => (
                    <div key={item.label}>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-white">{item.label}</span>
                        <span className="text-muted">{item.value}</span>
                      </div>
                      <div className="mt-2 h-3 overflow-hidden rounded-full bg-background">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-gold to-lightGold"
                          style={{ width: `${Math.max(8, Math.round((item.value / maxOutcome) * 100))}%` }}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted">No call outcomes have been logged yet.</p>
                )}
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
            <div className="border-t border-border px-6 py-5">
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
          </div>
        </div>
      </section>
    </div>
  );
}

function LegendPill({ label, tone }: { label: string; tone: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className={`h-2.5 w-2.5 rounded-full ${tone}`} />
      <span>{label}</span>
    </span>
  );
}

function MetricBar({
  label,
  value,
  max,
  tone
}: {
  label: string;
  value: number;
  max: number;
  tone: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.16em] text-muted">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-card">
        <div className={`h-full rounded-full ${tone}`} style={{ width: `${Math.max(6, Math.round((value / max) * 100))}%` }} />
      </div>
    </div>
  );
}

function formatDayLabel(value: string) {
  const date = new Date(`${value}T00:00:00`);
  return date.toLocaleDateString("en-ZA", { weekday: "short" });
}
