import Link from "next/link";
import type { Lead } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export function LeadsTable({ leads }: { leads: Lead[] }) {
  return (
    <section className="panel overflow-hidden">
      <div className="flex flex-col gap-4 border-b border-border px-6 py-5 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-muted">Leads CRM</p>
          <h1 className="mt-2 font-display text-3xl text-white">{leads.length} no-website leads saved</h1>
        </div>
        <Link
          href="/api/leads/export"
          className="inline-flex h-12 items-center justify-center rounded-2xl border border-gold/30 bg-gold px-5 font-medium text-background transition hover:bg-lightGold"
        >
          Export CSV
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="data-table min-w-full">
          <thead>
            <tr>
              <th>Business</th>
              <th>Address</th>
              <th>Phone</th>
              <th>Rating</th>
              <th>Source Term</th>
              <th>Captured</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead.id}>
                <td>
                  <div>
                    <p className="font-medium text-white">{lead.name}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.18em] text-muted">{lead.place_id ?? "No place id"}</p>
                  </div>
                </td>
                <td>{lead.formatted_address ?? "Unknown"}</td>
                <td>{lead.formatted_phone_number ?? "Unknown"}</td>
                <td>{lead.rating ?? "-"}</td>
                <td>{lead.source_term ?? "-"}</td>
                <td>{formatDate(lead.created_at)}</td>
              </tr>
            ))}
            {leads.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-sm text-muted">
                  No leads yet. Run a search to populate the CRM.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}
