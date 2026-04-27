"use client";

import { useMemo, useState } from "react";
import type { RunSearchResponse } from "@/lib/types";

type RunSearchPanelProps = {
  pendingCount: number;
  searchedCount: number;
  defaultBatchSize: number;
  defaultDelayMs: number;
};

export function RunSearchPanel({
  pendingCount,
  searchedCount,
  defaultBatchSize,
  defaultDelayMs
}: RunSearchPanelProps) {
  const [batchSize, setBatchSize] = useState(defaultBatchSize);
  const [delayMs, setDelayMs] = useState(defaultDelayMs);
  const [running, setRunning] = useState(false);
  const [log, setLog] = useState<RunSearchResponse["termSummaries"]>([]);
  const [stats, setStats] = useState({
    processedTerms: 0,
    leadsAdded: 0,
    leadsSkipped: 0,
    placeDetailsChecked: 0,
    remainingTerms: pendingCount,
    totalPendingBeforeRun: pendingCount
  });
  const [error, setError] = useState<string | null>(null);

  const progress = useMemo(() => {
    if (stats.totalPendingBeforeRun === 0) {
      return 0;
    }

    return Math.round((stats.processedTerms / stats.totalPendingBeforeRun) * 100);
  }, [stats.processedTerms, stats.totalPendingBeforeRun]);

  const handleRun = async () => {
    setRunning(true);
    setError(null);
    setLog([]);
    setStats({
      processedTerms: 0,
      leadsAdded: 0,
      leadsSkipped: 0,
      placeDetailsChecked: 0,
      remainingTerms: pendingCount,
      totalPendingBeforeRun: pendingCount
    });

    try {
      let done = false;

      while (!done) {
        const response = await fetch("/api/run-search/step", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ batchSize, delayMs })
        });

        const data = (await response.json()) as RunSearchResponse & { error?: string };

        if (!response.ok) {
          throw new Error(data.error ?? "Search run failed.");
        }

        setLog((current) => [...current, ...data.termSummaries]);
        setStats((current) => ({
          processedTerms: current.processedTerms + data.processedTerms,
          leadsAdded: current.leadsAdded + data.leadsAdded,
          leadsSkipped: current.leadsSkipped + data.leadsSkipped,
          placeDetailsChecked: current.placeDetailsChecked + data.placeDetailsChecked,
          remainingTerms: data.remainingTerms,
          totalPendingBeforeRun: data.totalPendingBeforeRun
        }));

        done = data.done;
      }
    } catch (runError) {
      setError(runError instanceof Error ? runError.message : "Search failed.");
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="panel p-5 sm:p-6">
          <p className="text-xs uppercase tracking-[0.28em] text-muted">Execution controls</p>
          <h1 className="mt-3 font-display text-4xl text-white">Run lead extraction</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-muted">
            Searches use Google Places Text Search with <span className="text-lightGold">region=za</span>, then fetch
            Place Details server-side before saving only businesses with no website.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <label className="rounded-3xl border border-border bg-background p-4">
              <span className="text-xs uppercase tracking-[0.24em] text-muted">Batch size</span>
              <input
                type="number"
                min={1}
                max={20}
                value={batchSize}
                onChange={(event) => setBatchSize(Number(event.target.value))}
                className="mt-3 h-11 w-full rounded-2xl border border-border bg-card px-4 text-white outline-none focus:border-gold"
              />
            </label>
            <label className="rounded-3xl border border-border bg-background p-4">
              <span className="text-xs uppercase tracking-[0.24em] text-muted">Delay per term (ms)</span>
              <input
                type="number"
                min={0}
                step={250}
                value={delayMs}
                onChange={(event) => setDelayMs(Number(event.target.value))}
                className="mt-3 h-11 w-full rounded-2xl border border-border bg-card px-4 text-white outline-none focus:border-gold"
              />
            </label>
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <button
              type="button"
              onClick={handleRun}
              disabled={running || pendingCount === 0}
              className="h-12 rounded-2xl border border-gold/30 bg-gold px-5 font-medium text-background transition hover:bg-lightGold disabled:opacity-50"
            >
              {running ? "Running search..." : "Start search"}
            </button>
            <div className="rounded-2xl border border-border bg-white/[0.03] px-4 py-3 text-sm text-muted">
              {pendingCount} pending
            </div>
            <div className="rounded-2xl border border-border bg-white/[0.03] px-4 py-3 text-sm text-muted">
              {searchedCount} already searched
            </div>
          </div>
          {error ? (
            <div className="mt-4 rounded-2xl border border-gold/20 bg-gold/10 px-4 py-3 text-sm text-lightGold">
              {error}
            </div>
          ) : null}
        </section>

        <section className="panel p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-muted">Progress</p>
              <h2 className="mt-2 font-display text-3xl text-white">{progress}% complete</h2>
            </div>
            <div className="rounded-3xl border border-gold/20 bg-gold/10 px-4 py-3 text-sm text-lightGold">
              {stats.processedTerms} / {stats.totalPendingBeforeRun || pendingCount} terms processed
            </div>
          </div>
          <div className="mt-6 h-4 overflow-hidden rounded-full bg-background">
            <div
              className="h-full rounded-full bg-gradient-to-r from-gold to-lightGold transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-6 grid gap-4 grid-cols-2 xl:grid-cols-4">
            <MetricCard label="Leads Added" value={stats.leadsAdded} />
            <MetricCard label="Duplicates / Skips" value={stats.leadsSkipped} />
            <MetricCard label="Details Checked" value={stats.placeDetailsChecked} />
            <MetricCard label="Remaining" value={stats.remainingTerms} />
          </div>
        </section>
      </div>

      <section className="panel p-5 sm:p-6">
        <p className="text-xs uppercase tracking-[0.28em] text-muted">Run log</p>
        <h2 className="mt-2 font-display text-2xl text-white">Term-by-term progress</h2>
        <div className="mt-6 space-y-3">
          {log.map((item, index) => (
            <div
              key={`${item.term}-${index}`}
              className="flex flex-col justify-between gap-3 rounded-3xl border border-border bg-background px-4 py-4 md:flex-row md:items-center"
            >
              <div>
                <p className="text-sm font-medium text-white">{item.term}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.2em] text-muted">
                  {item.placesFound} place matches checked
                </p>
              </div>
              <div className="rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-lightGold">
                {item.saved} leads saved
              </div>
            </div>
          ))}
          {log.length === 0 ? <p className="text-sm text-muted">No batches processed yet.</p> : null}
        </div>
      </section>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-3xl border border-border bg-background p-4">
      <p className="text-xs uppercase tracking-[0.24em] text-muted">{label}</p>
      <p className="mt-3 font-display text-3xl text-white">{value}</p>
    </div>
  );
}
