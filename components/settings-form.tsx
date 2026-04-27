"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { AppSettings } from "@/lib/types";

export function SettingsForm({ settings }: { settings: AppSettings }) {
  const router = useRouter();
  const [defaultBatchSize, setDefaultBatchSize] = useState(settings.default_batch_size);
  const [defaultDelayMs, setDefaultDelayMs] = useState(settings.default_delay_ms);
  const [message, setMessage] = useState<string | null>(null);

  const save = async () => {
    const response = await fetch("/api/settings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        defaultBatchSize,
        defaultDelayMs
      })
    });

    const data = (await response.json()) as { message?: string; error?: string };

    if (!response.ok) {
      setMessage(data.error ?? "Unable to save settings.");
      return;
    }

    setMessage(data.message ?? "Settings saved.");
    router.refresh();
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <section className="panel p-6">
        <p className="text-xs uppercase tracking-[0.28em] text-muted">Default execution values</p>
        <h1 className="mt-3 font-display text-4xl text-white">Search settings</h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-muted">
          These values prefill the Run Search page so your operators stay inside safe throughput limits.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <label className="rounded-3xl border border-border bg-background p-4">
            <span className="text-xs uppercase tracking-[0.24em] text-muted">Default batch size</span>
            <input
              type="number"
              min={1}
              max={20}
              value={defaultBatchSize}
              onChange={(event) => setDefaultBatchSize(Number(event.target.value))}
              className="mt-3 h-11 w-full rounded-2xl border border-border bg-card px-4 text-white outline-none focus:border-gold"
            />
          </label>
          <label className="rounded-3xl border border-border bg-background p-4">
            <span className="text-xs uppercase tracking-[0.24em] text-muted">Default delay (ms)</span>
            <input
              type="number"
              min={0}
              step={250}
              value={defaultDelayMs}
              onChange={(event) => setDefaultDelayMs(Number(event.target.value))}
              className="mt-3 h-11 w-full rounded-2xl border border-border bg-card px-4 text-white outline-none focus:border-gold"
            />
          </label>
        </div>
        <button
          type="button"
          onClick={save}
          className="mt-8 h-12 rounded-2xl border border-gold/30 bg-gold px-5 font-medium text-background transition hover:bg-lightGold"
        >
          Save defaults
        </button>
        {message ? (
          <div className="mt-4 rounded-2xl border border-gold/20 bg-gold/10 px-4 py-3 text-sm text-lightGold">{message}</div>
        ) : null}
      </section>

      <section className="panel p-6">
        <p className="text-xs uppercase tracking-[0.28em] text-muted">Environment</p>
        <h2 className="mt-3 font-display text-3xl text-white">Secrets stay server-side</h2>
        <div className="mt-6 space-y-4 text-sm leading-6 text-muted">
          <p>Store your Supabase URL, Supabase service role key, and Google Places API key in <code>.env</code> only.</p>
          <p>
            The Google Places key is never sent to the browser. Every Places request is made from Next.js route
            handlers on the server.
          </p>
          <p>
            After updating <code>.env</code>, restart the Next.js process so the server picks up the new values.
          </p>
        </div>
      </section>
    </div>
  );
}
