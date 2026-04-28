"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { Phone, Save, X } from "lucide-react";
import { CALL_OUTCOMES, CALL_OUTCOME_LABELS, LEAD_STATUSES, LEAD_STATUS_LABELS } from "@/lib/crm";
import type { Lead } from "@/lib/types";
import { formatDate } from "@/lib/utils";

type LeadsTableProps = {
  leads: Lead[];
  mode?: "crm" | "tracker";
  hideHeader?: boolean;
};

export function LeadsTable({ leads, mode = "crm", hideHeader = false }: LeadsTableProps) {
  const [items, setItems] = useState(leads);
  const [selectedId, setSelectedId] = useState<string | null>(leads[0]?.id ?? null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [saving, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const filteredLeads = useMemo(() => {
    return items.filter((lead) => {
      if (mode === "tracker" && lead.lead_status === "new" && !lead.follow_up_at && !lead.last_call_at) {
        return false;
      }

      if (statusFilter !== "all" && lead.lead_status !== statusFilter) {
        return false;
      }

      if (search.trim()) {
        const query = search.trim().toLowerCase();
        const haystack = [
          lead.name,
          lead.formatted_phone_number ?? "",
          lead.formatted_address ?? "",
          lead.source_term ?? ""
        ]
          .join(" ")
          .toLowerCase();

        if (!haystack.includes(query)) {
          return false;
        }
      }

      return true;
    });
  }, [items, mode, search, statusFilter]);

  const selectedLead = filteredLeads.find((lead) => lead.id === selectedId) ?? filteredLeads[0] ?? null;

  const summary = useMemo(() => {
    const contacted = items.filter((lead) => ["contacted", "interested", "quoted", "won", "lost"].includes(lead.lead_status)).length;
    const interested = items.filter((lead) => ["interested", "quoted", "won"].includes(lead.lead_status)).length;
    const won = items.filter((lead) => lead.lead_status === "won").length;
    const followUps = items.filter((lead) => Boolean(lead.follow_up_at)).length;

    return { contacted, interested, won, followUps };
  }, [items]);

  const saveLead = async (lead: Lead) => {
    setMessage(null);

    const response = await fetch(`/api/leads/${lead.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        lead_status: lead.lead_status,
        call_outcome: lead.call_outcome,
        last_call_at: lead.last_call_at,
        lead_notes: lead.lead_notes,
        follow_up_at: lead.follow_up_at,
        quoted_amount: lead.quoted_amount,
        won_value: lead.won_value,
        assigned_agent: lead.assigned_agent
      })
    });

    const data = (await response.json()) as { lead?: Lead; error?: string };

    if (!response.ok || !data.lead) {
      setMessage(data.error ?? "Unable to save lead.");
      return;
    }

    setItems((current) => current.map((item) => (item.id === data.lead!.id ? (data.lead as Lead) : item)));
    setMessage(`Saved ${data.lead.name}.`);
  };

  const updateLead = (id: string, field: keyof Lead, value: string | number | null) => {
    setItems((current) =>
      current.map((lead) => {
        if (lead.id !== id) {
          return lead;
        }

        return {
          ...lead,
          [field]: value
        };
      })
    );
  };

  const headerTitle = mode === "tracker" ? "Call Tracker" : "Leads CRM";
  const headerSubtitle =
    mode === "tracker"
      ? "Track final outcomes, follow-ups, and value for every lead."
      : `${items.length} no-website leads saved`;

  useEffect(() => {
    if (!editorOpen || typeof document === "undefined") {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [editorOpen]);

  const openLead = (id: string) => {
    setSelectedId(id);
    setEditorOpen(true);
  };

  return (
    <div className="space-y-6">
      {!hideHeader ? (
        <section className="panel p-5 sm:p-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-muted">{headerTitle}</p>
              <h1 className="mt-2 font-display text-3xl text-white">{headerSubtitle}</h1>
            </div>
            <div className="flex flex-wrap gap-3">
              <SummaryChip label="Contacted" value={summary.contacted} />
              <SummaryChip label="Interested" value={summary.interested} />
              <SummaryChip label="Won" value={summary.won} />
              <SummaryChip label="Follow-ups" value={summary.followUps} />
              <Link
                href="/api/leads/export"
                className="inline-flex h-11 items-center justify-center rounded-2xl border border-gold/30 bg-gold px-5 font-medium text-background transition hover:bg-lightGold"
              >
                Export CSV
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      {message ? (
        <div className="rounded-2xl border border-gold/20 bg-gold/10 px-4 py-3 text-sm text-lightGold">{message}</div>
      ) : null}

      <section>
        <div className="panel overflow-hidden">
          <div className="border-b border-border px-5 py-5 sm:px-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search name, phone, address, source term"
                className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-white outline-none transition focus:border-gold md:max-w-md"
              />
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="h-11 rounded-2xl border border-border bg-background px-4 text-white outline-none transition focus:border-gold"
              >
                <option value="all">All statuses</option>
                {LEAD_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {LEAD_STATUS_LABELS[status]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="hidden overflow-x-auto lg:block">
            <table className="data-table min-w-full">
              <thead>
                <tr>
                  <th>Business</th>
                  <th>Status</th>
                  <th>Outcome</th>
                  <th>Phone</th>
                  <th>Follow-up</th>
                  <th>Value</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className={selectedLead?.id === lead.id ? "bg-white/[0.03]" : ""}>
                    <td>
                      <div>
                        <p className="font-medium text-white">{lead.name}</p>
                        <p className="mt-1 text-xs uppercase tracking-[0.18em] text-muted">{lead.source_term ?? "No source term"}</p>
                      </div>
                    </td>
                    <td>
                      <StatusChip label={LEAD_STATUS_LABELS[lead.lead_status]} tone={lead.lead_status} />
                    </td>
                    <td>{lead.call_outcome ? CALL_OUTCOME_LABELS[lead.call_outcome] : "Not logged"}</td>
                    <td>{lead.formatted_phone_number ?? "Unknown"}</td>
                    <td>{formatDate(lead.follow_up_at)}</td>
                    <td>{formatMoney(lead.won_value ?? lead.quoted_amount)}</td>
                    <td className="text-right">
                      <button
                        type="button"
                        onClick={() => openLead(lead.id)}
                        className="rounded-2xl border border-border bg-background px-4 py-2 text-sm text-white transition hover:border-gold"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-sm text-muted">
                      No leads match the current filters.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>

          <div className="space-y-3 p-4 lg:hidden">
            {filteredLeads.map((lead) => (
              <div key={lead.id} className="rounded-3xl border border-border bg-background p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-white">{lead.name}</p>
                    <p className="mt-1 text-sm text-muted">{lead.formatted_phone_number ?? "Unknown number"}</p>
                    <p className="mt-1 text-sm text-muted">{lead.source_term ?? "No source term"}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => openLead(lead.id)}
                    className="rounded-2xl border border-border bg-background px-3 py-2 text-sm text-white transition hover:border-gold"
                  >
                    Open
                  </button>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <StatusChip label={LEAD_STATUS_LABELS[lead.lead_status]} tone={lead.lead_status} />
                  {lead.call_outcome ? <StatusChip label={CALL_OUTCOME_LABELS[lead.call_outcome]} tone="neutral" /> : null}
                </div>
                <p className="mt-3 text-sm text-muted">Follow-up: {formatDate(lead.follow_up_at)}</p>
              </div>
            ))}
          </div>
        </div>

      </section>

      {editorOpen && selectedLead ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 p-3 backdrop-blur-sm sm:p-6">
          <div className="max-h-[92vh] w-full max-w-[62rem] overflow-hidden rounded-[28px] border border-border bg-card shadow-glow">
            <div className="max-h-[92vh] overflow-y-auto p-5 sm:p-7">
              <LeadEditor
                lead={selectedLead}
                saving={saving}
                onChange={updateLead}
                onClose={() => setEditorOpen(false)}
                onSave={() =>
                  startTransition(async () => {
                    const leadToSave = items.find((item) => item.id === selectedLead.id);
                    if (leadToSave) {
                      await saveLead(leadToSave);
                    }
                  })
                }
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function LeadEditor({
  lead,
  saving,
  onChange,
  onClose,
  onSave
}: {
  lead: Lead;
  saving: boolean;
  onChange: (id: string, field: keyof Lead, value: string | number | null) => void;
  onClose: () => void;
  onSave: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 border-b border-border/80 pb-5">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted">Lead Profile</p>
          <h2 className="mt-2 text-2xl font-semibold leading-tight text-white sm:text-[2rem]">{lead.name}</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted">{lead.formatted_address ?? "Unknown address"}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-border bg-background text-white transition hover:border-gold"
          aria-label="Close lead profile"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="space-y-4">
        <div className="flex flex-wrap gap-3">
          <a
            href={lead.formatted_phone_number ? `tel:${lead.formatted_phone_number}` : undefined}
            className="inline-flex h-11 items-center gap-2 rounded-2xl border border-gold/30 bg-gold px-4 text-sm font-medium text-background transition hover:bg-lightGold"
          >
            <Phone className="h-4 w-4" />
            Call Lead
          </a>
          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="inline-flex h-11 items-center gap-2 rounded-2xl border border-border bg-background px-4 text-sm font-medium text-white transition hover:border-gold disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : "Save Update"}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Lead status">
            <select
              value={lead.lead_status}
              onChange={(event) => onChange(lead.id, "lead_status", event.target.value)}
              className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-white outline-none transition focus:border-gold"
            >
              {LEAD_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {LEAD_STATUS_LABELS[status]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Final call outcome">
            <select
              value={lead.call_outcome ?? ""}
              onChange={(event) => onChange(lead.id, "call_outcome", event.target.value || null)}
              className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-white outline-none transition focus:border-gold"
            >
              <option value="">Not logged</option>
              {CALL_OUTCOMES.map((outcome) => (
                <option key={outcome} value={outcome}>
                  {CALL_OUTCOME_LABELS[outcome]}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Call date">
            <input
              type="datetime-local"
              value={toDateTimeLocal(lead.last_call_at)}
              onChange={(event) => onChange(lead.id, "last_call_at", event.target.value ? new Date(event.target.value).toISOString() : null)}
              className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-white outline-none transition focus:border-gold"
            />
          </Field>
          <Field label="Follow-up date">
            <input
              type="datetime-local"
              value={toDateTimeLocal(lead.follow_up_at)}
              onChange={(event) => onChange(lead.id, "follow_up_at", event.target.value ? new Date(event.target.value).toISOString() : null)}
              className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-white outline-none transition focus:border-gold"
            />
          </Field>
        </div>

        <Field label="Assigned agent">
          <input
            type="text"
            value={lead.assigned_agent ?? ""}
            onChange={(event) => onChange(lead.id, "assigned_agent", event.target.value || null)}
            placeholder="HFE Media"
            className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-white outline-none transition focus:border-gold"
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Quoted amount">
            <input
              type="number"
              min={0}
              step="50"
              value={lead.quoted_amount ?? ""}
              onChange={(event) => onChange(lead.id, "quoted_amount", event.target.value ? Number(event.target.value) : null)}
              className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-white outline-none transition focus:border-gold"
            />
          </Field>
          <Field label="Won value">
            <input
              type="number"
              min={0}
              step="50"
              value={lead.won_value ?? ""}
              onChange={(event) => onChange(lead.id, "won_value", event.target.value ? Number(event.target.value) : null)}
              className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-white outline-none transition focus:border-gold"
            />
          </Field>
        </div>

        <Field label="Call notes">
          <textarea
            value={lead.lead_notes ?? ""}
            onChange={(event) => onChange(lead.id, "lead_notes", event.target.value || null)}
            rows={4}
            placeholder="Summarise the call, objections, next step, and any quote details."
            className="w-full rounded-3xl border border-border bg-background px-4 py-4 text-white outline-none transition focus:border-gold"
          />
        </Field>
      </div>

    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[11px] font-medium uppercase tracking-[0.2em] text-muted">{label}</span>
      {children}
    </label>
  );
}

function SummaryChip({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-border bg-white/[0.03] px-4 py-2 text-sm text-muted">
      {label}: <span className="text-white">{value}</span>
    </div>
  );
}

function StatusChip({
  label,
  tone
}: {
  label: string;
  tone: Lead["lead_status"] | "neutral";
}) {
  const className =
    tone === "won"
      ? "border-gold/40 bg-gold/10 text-lightGold"
      : tone === "interested" || tone === "quoted"
        ? "border-white/10 bg-white/[0.04] text-white"
        : tone === "lost"
          ? "border-border bg-background text-muted"
          : "border-border bg-white/[0.03] text-muted";

  return <span className={`rounded-full border px-3 py-1 text-xs uppercase tracking-[0.2em] ${className}`}>{label}</span>;
}

function formatMoney(value: number | null) {
  if (!value) {
    return "-";
  }

  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    maximumFractionDigits: 0
  }).format(value);
}

function toDateTimeLocal(value: string | null) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  const offsetMs = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}
