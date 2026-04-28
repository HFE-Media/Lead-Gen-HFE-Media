import { LeadsTable } from "@/components/leads-table";
import { getDashboardMetrics, getLeads } from "@/lib/data";

export default async function CallTrackerPage() {
  const metrics = await getDashboardMetrics();
  const leads = await getLeads();
  const maxActivity = Math.max(1, ...metrics.activitySeries.map((item) => Math.max(item.contacted, item.interested, item.won)));
  const maxOutcome = Math.max(1, ...metrics.outcomeBreakdown.map((item) => item.value));

  return (
    <div className="space-y-6">
      <section className="panel p-6 lg:p-8">
        <p className="text-xs uppercase tracking-[0.28em] text-muted">Call Tracker</p>
        <h1 className="mt-4 max-w-4xl font-display text-3xl text-white sm:text-4xl">Track final outcomes, follow-ups, and closing performance.</h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-muted">
          This is now the dedicated sales workspace for HFE Media. Log calls, monitor follow-ups, and watch performance move from contacted to interested to won.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Contacted" value={metrics.contactedLeads} footnote="Leads with a final call logged or closed outcome." />
        <MetricCard label="Interested" value={metrics.interestedLeads} footnote="Leads that showed buying intent or asked for pricing." />
        <MetricCard label="Won" value={metrics.wonLeads} footnote="Closed business recorded in the CRM." />
        <MetricCard label="Follow-ups Due" value={metrics.followUpsDue.length} footnote="Leads that still need a callback or next action." />
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_360px]">
        <div className="panel overflow-hidden">
          <div className="border-b border-border px-6 py-5">
            <p className="text-xs uppercase tracking-[0.28em] text-muted">Sales Activity</p>
            <h2 className="mt-2 font-display text-2xl text-white">Performance over the last 5 business days</h2>
          </div>
          <div className="border-b border-border/80 px-6 py-4">
            <div className="flex flex-wrap gap-4 text-xs uppercase tracking-[0.18em] text-muted">
              <LegendPill label="Contacted" tone="bg-gold" />
              <LegendPill label="Interested" tone="bg-lightGold" />
              <LegendPill label="Won" tone="bg-white" />
            </div>
          </div>
          <div className="px-4 py-6 sm:px-6">
            <div className="grid min-h-[360px] grid-cols-5 gap-3 sm:gap-4">
              {metrics.activitySeries.map((item) => (
                <div
                  key={item.date}
                  className="flex min-w-0 flex-col justify-end rounded-3xl border border-border/80 bg-background/70 p-3 sm:p-4"
                >
                  <div className="flex flex-1 items-end justify-center gap-2 sm:gap-3">
                    <VerticalBar label="Contacted" value={item.contacted} max={maxActivity} tone="bg-gold" />
                    <VerticalBar label="Interested" value={item.interested} max={maxActivity} tone="bg-lightGold" />
                    <VerticalBar label="Won" value={item.won} max={maxActivity} tone="bg-white" />
                  </div>
                  <div className="mt-4 border-t border-border/80 pt-3 text-center">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted">{item.date.slice(5)}</p>
                    <p className="mt-1 text-sm text-white">{formatDayLabel(item.date)}</p>
                  </div>
                </div>
              ))}
            </div>
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
      </section>

      <LeadsTable leads={leads} mode="tracker" />
    </div>
  );
}

function MetricCard({ label, value, footnote }: { label: string; value: string | number; footnote: string }) {
  return (
    <div className="panel p-5 lg:p-6">
      <p className="text-xs uppercase tracking-[0.28em] text-muted">{label}</p>
      <p className="mt-3 font-display text-3xl text-white lg:text-[2.2rem]">{value}</p>
      <p className="mt-2 text-sm leading-6 text-muted">{footnote}</p>
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

function VerticalBar({
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
    <div className="flex flex-1 flex-col items-center justify-end gap-2">
      <span className="text-[11px] text-muted">{value}</span>
      <div className="flex h-56 w-full max-w-10 items-end rounded-full bg-card/70 p-1 sm:max-w-12">
        <div
          className={`w-full rounded-full ${tone}`}
          style={{ height: `${value === 0 ? 8 : Math.max(10, Math.round((value / max) * 100))}%` }}
          aria-label={`${label}: ${value}`}
          title={`${label}: ${value}`}
        />
      </div>
      <span className="text-[10px] uppercase tracking-[0.16em] text-muted">{label.slice(0, 3)}</span>
    </div>
  );
}

function formatDayLabel(value: string) {
  const date = new Date(`${value}T00:00:00`);
  return date.toLocaleDateString("en-ZA", { weekday: "short" });
}
