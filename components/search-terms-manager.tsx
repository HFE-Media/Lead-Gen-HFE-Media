"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { StatusPill } from "@/components/status-pill";
import { DEFAULT_REGION, getRegionLabel, REGION_OPTIONS } from "@/lib/regions";
import type { SearchTerm } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export function SearchTermsManager({ terms }: { terms: SearchTerm[] }) {
  const router = useRouter();
  const [singleTerm, setSingleTerm] = useState("");
  const [bulkTerms, setBulkTerms] = useState("");
  const [region, setRegion] = useState(DEFAULT_REGION);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const submit = async (payload: { term?: string; bulk?: string; region: string }) => {
    setMessage(null);

    const response = await fetch("/api/search-terms", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = (await response.json()) as { message?: string; error?: string };

    if (!response.ok) {
      setMessage(data.error ?? "Unable to save search terms.");
      return;
    }

    setSingleTerm("");
    setBulkTerms("");
    setMessage(data.message ?? "Search terms saved.");
    startTransition(() => router.refresh());
  };

  const removeTerm = async (id: string) => {
    const response = await fetch(`/api/search-terms/${id}`, {
      method: "DELETE"
    });

    if (response.ok) {
      startTransition(() => router.refresh());
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <section className="panel p-6">
          <p className="text-xs uppercase tracking-[0.28em] text-muted">Add one term</p>
          <h2 className="mt-3 font-display text-3xl text-white">Manual keyword entry</h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted">
            Add market-by-market search phrases like "plumber in Durban" or "law firm Johannesburg" and choose the
            region you want to search in.
          </p>
          <div className="mt-6 grid gap-3 md:grid-cols-[minmax(0,1.45fr)_180px_auto]">
            <input
              value={singleTerm}
              onChange={(event) => setSingleTerm(event.target.value)}
              placeholder="digital agency in cape town"
              className="h-12 rounded-2xl border border-border bg-background px-4 text-white outline-none transition focus:border-gold"
            />
            <select
              value={region}
              onChange={(event) => setRegion(event.target.value)}
              className="h-12 rounded-2xl border border-border bg-background px-4 text-white outline-none transition focus:border-gold"
            >
              {REGION_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => submit({ term: singleTerm, region })}
              disabled={pending || singleTerm.trim().length === 0}
              className="h-12 rounded-2xl border border-gold/30 bg-gold px-5 font-medium text-background transition hover:bg-lightGold disabled:opacity-50"
            >
              Add term
            </button>
          </div>
        </section>

        <section className="panel p-6">
          <p className="text-xs uppercase tracking-[0.28em] text-muted">Bulk import</p>
          <h2 className="mt-3 font-display text-3xl text-white">Paste a full list</h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted">
            One term per line, or comma separated. Duplicate term-region pairs are ignored automatically.
          </p>
          <div className="mt-6">
            <label className="mb-2 block text-xs uppercase tracking-[0.24em] text-muted">Region</label>
            <select
              value={region}
              onChange={(event) => setRegion(event.target.value)}
              className="h-12 w-full rounded-2xl border border-border bg-background px-4 text-white outline-none transition focus:border-gold"
            >
              {REGION_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <textarea
            value={bulkTerms}
            onChange={(event) => setBulkTerms(event.target.value)}
            placeholder={"accountant pretoria\nrestaurant bloemfontein\nattorney in sandton"}
            className="mt-4 min-h-44 w-full rounded-3xl border border-border bg-background px-4 py-4 text-white outline-none transition focus:border-gold"
          />
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={() => submit({ bulk: bulkTerms, region })}
              disabled={pending || bulkTerms.trim().length === 0}
              className="h-12 rounded-2xl border border-gold/30 bg-gold px-5 font-medium text-background transition hover:bg-lightGold disabled:opacity-50"
            >
              Import terms
            </button>
          </div>
        </section>
      </div>

      {message ? (
        <div className="rounded-2xl border border-gold/20 bg-gold/10 px-4 py-3 text-sm text-lightGold">{message}</div>
      ) : null}

      <section className="panel overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-6 py-5">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-muted">Queue</p>
            <h2 className="mt-2 font-display text-2xl text-white">{terms.length} search terms loaded</h2>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table min-w-full">
            <thead>
              <tr>
                <th>Term</th>
                <th>Region</th>
                <th>Status</th>
                <th>Results</th>
                <th>Searched At</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {terms.map((term) => (
                <tr key={term.id}>
                  <td className="font-medium">{term.term}</td>
                  <td>{getRegionLabel(term.region)}</td>
                  <td>
                    <StatusPill status={term.status} />
                  </td>
                  <td>{term.result_count}</td>
                  <td>{formatDate(term.searched_at)}</td>
                  <td className="text-right">
                    <button
                      type="button"
                      onClick={() => removeTerm(term.id)}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-border bg-background text-muted transition hover:border-gold hover:text-white"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {terms.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-muted">
                    No search terms yet. Add your first niche and location combination above.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
