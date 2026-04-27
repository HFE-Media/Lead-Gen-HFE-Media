"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Download, RefreshCw, Upload } from "lucide-react";
import type {
  BusinessCategory,
  GeneratedSearchTerm,
  GeneratorDataset,
  LocationRecord,
  TermPattern
} from "@/lib/types";
import {
  BATCH_SIZE,
  buildGeneratedDrafts,
  GENERATION_LIMIT_OPTIONS,
  splitIntoBatches,
  type GeneratedTermDraft
} from "@/lib/search-term-generator";
import { formatDate } from "@/lib/utils";

type TabKey = "generate" | "categories" | "locations" | "patterns" | "generated";

const tabs: Array<{ id: TabKey; label: string }> = [
  { id: "generate", label: "Generate" },
  { id: "categories", label: "Categories" },
  { id: "locations", label: "Locations" },
  { id: "patterns", label: "Patterns" },
  { id: "generated", label: "Generated Terms" }
];

export function SearchTermGenerator({ dataset }: { dataset: GeneratorDataset }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>("generate");
  const [categories, setCategories] = useState(dataset.categories);
  const [locations, setLocations] = useState(dataset.locations);
  const [patterns, setPatterns] = useState(dataset.patterns);
  const [generatedTermsDb, setGeneratedTermsDb] = useState(dataset.generatedTerms);
  const [generatedCounts, setGeneratedCounts] = useState(dataset.generatedCounts);
  const [selectedGroupFilters, setSelectedGroupFilters] = useState<string[]>([]);
  const [selectedProvinceFilters, setSelectedProvinceFilters] = useState<string[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(dataset.categories.filter((item) => item.active).map((item) => item.id));
  const [selectedLocationIds, setSelectedLocationIds] = useState<string[]>(dataset.locations.filter((item) => item.active).map((item) => item.id));
  const [selectedPatternIds, setSelectedPatternIds] = useState<string[]>(dataset.patterns.filter((item) => item.active).map((item) => item.id));
  const [generationLimit, setGenerationLimit] = useState<number>(5000);
  const [previewDrafts, setPreviewDrafts] = useState<GeneratedTermDraft[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [saveProgress, setSaveProgress] = useState({ active: false, processed: 0, total: 0, inserted: 0, skipped: 0 });
  const [queueProgress, setQueueProgress] = useState({ active: false, processed: 0, total: dataset.generatedCounts.pending, inserted: 0, skipped: 0 });
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setCategories(dataset.categories);
    setLocations(dataset.locations);
    setPatterns(dataset.patterns);
    setGeneratedTermsDb(dataset.generatedTerms);
    setGeneratedCounts(dataset.generatedCounts);
    setSelectedCategoryIds((current) => (current.length > 0 ? current : dataset.categories.filter((item) => item.active).map((item) => item.id)));
    setSelectedLocationIds((current) => (current.length > 0 ? current : dataset.locations.filter((item) => item.active).map((item) => item.id)));
    setSelectedPatternIds((current) => (current.length > 0 ? current : dataset.patterns.filter((item) => item.active).map((item) => item.id)));
  }, [dataset]);

  const groupOptions = useMemo(
    () => Array.from(new Set(categories.map((item) => item.group_name).filter((item): item is string => Boolean(item)))).sort(),
    [categories]
  );
  const provinceOptions = useMemo(
    () => Array.from(new Set(locations.map((item) => item.province).filter((item): item is string => Boolean(item)))).sort(),
    [locations]
  );

  const filteredCategories = useMemo(() => {
    return categories.filter((category) => {
      if (!category.active) {
        return false;
      }

      if (selectedGroupFilters.length > 0 && !selectedGroupFilters.includes(category.group_name ?? "")) {
        return false;
      }

      return true;
    });
  }, [categories, selectedGroupFilters]);

  const filteredLocations = useMemo(() => {
    return locations.filter((location) => {
      if (!location.active) {
        return false;
      }

      if (selectedProvinceFilters.length > 0 && !selectedProvinceFilters.includes(location.province ?? "")) {
        return false;
      }

      return true;
    });
  }, [locations, selectedProvinceFilters]);

  const activePatterns = useMemo(
    () => patterns.filter((pattern) => pattern.active && selectedPatternIds.includes(pattern.id)),
    [patterns, selectedPatternIds]
  );

  const selectedCategories = useMemo(
    () => filteredCategories.filter((item) => selectedCategoryIds.includes(item.id)),
    [filteredCategories, selectedCategoryIds]
  );
  const selectedLocations = useMemo(
    () => filteredLocations.filter((item) => selectedLocationIds.includes(item.id)),
    [filteredLocations, selectedLocationIds]
  );

  const rawCombinationCount = selectedCategories.length * selectedLocations.length * activePatterns.length;
  const previewRows = previewDrafts.slice(0, 250);

  const toggleFilter = (value: string, current: string[], setter: (value: string[]) => void) => {
    setter(current.includes(value) ? current.filter((item) => item !== value) : [...current, value]);
  };

  const toggleIdSelection = (id: string, current: string[], setter: (value: string[]) => void) => {
    setter(current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  };

  const handleCsvImport = async (kind: "categories" | "locations" | "patterns", file: File | null) => {
    if (!file) {
      return;
    }

    const csv = await file.text();
    setMessage(null);

    const response = await fetch("/api/generator/import", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ kind, csv })
    });

    const data = (await response.json()) as { message?: string; error?: string };

    if (!response.ok) {
      setMessage(data.error ?? "Unable to import CSV.");
      return;
    }

    setMessage(data.message ?? "Import complete.");
    startTransition(() => router.refresh());
  };

  const toggleDatasetActive = async (kind: "categories" | "locations" | "patterns", id: string, active: boolean) => {
    const response = await fetch("/api/generator/toggle", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ kind, id, active })
    });

    const data = (await response.json()) as { error?: string };

    if (!response.ok) {
      setMessage(data.error ?? "Unable to update active state.");
      return;
    }

    if (kind === "categories") {
      setCategories((current) => current.map((item) => (item.id === id ? { ...item, active } : item)));
    } else if (kind === "locations") {
      setLocations((current) => current.map((item) => (item.id === id ? { ...item, active } : item)));
    } else {
      setPatterns((current) => current.map((item) => (item.id === id ? { ...item, active } : item)));
    }
  };

  const generatePreview = () => {
    const drafts = buildGeneratedDrafts(selectedCategories, selectedLocations, activePatterns, generationLimit);
    setPreviewDrafts(drafts);
    setMessage(`${drafts.length} terms generated for preview.`);
  };

  const saveGeneratedTerms = async () => {
    if (previewDrafts.length === 0) {
      setMessage("Generate a preview first.");
      return;
    }

    const batches = splitIntoBatches(previewDrafts, BATCH_SIZE);
    setSaveProgress({ active: true, processed: 0, total: previewDrafts.length, inserted: 0, skipped: 0 });
    setMessage(null);

    let inserted = 0;
    let skipped = 0;
    let processed = 0;

    try {
      for (const batch of batches) {
        const response = await fetch("/api/generator/generated-terms/save-batch", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ items: batch })
        });

        const data = (await response.json()) as { inserted?: number; skipped?: number; error?: string };

        if (!response.ok) {
          throw new Error(data.error ?? "Unable to save generated terms.");
        }

        inserted += data.inserted ?? 0;
        skipped += data.skipped ?? 0;
        processed += batch.length;
        setSaveProgress({ active: true, processed, total: previewDrafts.length, inserted, skipped });
      }

      setMessage(`${inserted} generated terms saved. ${skipped} duplicates skipped.`);
      startTransition(() => router.refresh());
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save generated terms.");
    } finally {
      setSaveProgress((current) => ({ ...current, active: false }));
    }
  };

  const pushGeneratedToQueue = async () => {
    if (generatedCounts.pending === 0) {
      setMessage("No pending generated terms to push.");
      return;
    }

    setQueueProgress({ active: true, processed: 0, total: generatedCounts.pending, inserted: 0, skipped: 0 });
    setMessage(null);

    let done = false;
    let processed = 0;
    let inserted = 0;
    let skipped = 0;

    try {
      while (!done) {
        const response = await fetch("/api/generator/push-to-queue-batch", {
          method: "POST"
        });

        const data = (await response.json()) as {
          processed?: number;
          inserted?: number;
          skipped?: number;
          remaining?: number;
          done?: boolean;
          error?: string;
        };

        if (!response.ok) {
          throw new Error(data.error ?? "Unable to push generated terms.");
        }

        processed += data.processed ?? 0;
        inserted += data.inserted ?? 0;
        skipped += data.skipped ?? 0;
        done = Boolean(data.done);

        setQueueProgress({
          active: true,
          processed,
          total: generatedCounts.pending,
          inserted,
          skipped
        });
      }

      setMessage(`${inserted} generated terms pushed into the main queue. ${skipped} skipped as existing terms.`);
      startTransition(() => router.refresh());
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to push generated terms.");
    } finally {
      setQueueProgress((current) => ({ ...current, active: false }));
    }
  };

  return (
    <div className="space-y-6">
      <header className="panel p-5 sm:p-6">
        <p className="text-xs uppercase tracking-[0.28em] text-muted">Search Term Generator</p>
        <h1 className="mt-3 font-display text-3xl leading-tight text-white sm:text-4xl">
          Build 50k+ database-driven search combinations.
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">
          Import categories, locations, and patterns from CSV, generate dynamic Google Places search terms from
          Supabase data, preview the output, export it, and push only new terms into the main queue.
        </p>
      </header>

      {dataset.setupRequired ? (
        <section className="panel border-gold/30 bg-gold/10 p-6">
          <p className="text-xs uppercase tracking-[0.28em] text-lightGold">Generator setup required</p>
          <h2 className="mt-3 font-display text-3xl text-white">Run the updated Supabase schema first.</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">
            {dataset.setupMessage}
          </p>
          <div className="mt-5 space-y-2 text-sm text-muted">
            <p>
              1. Run <code className="rounded bg-background px-2 py-1 text-white">sql/schema.sql</code>
            </p>
            <p>
              2. Optionally run <code className="rounded bg-background px-2 py-1 text-white">sql/generator-seed.sql</code>
            </p>
            <p>3. Refresh this page</p>
          </div>
        </section>
      ) : null}

      {!dataset.setupRequired ? (
        <>
          <div className="-mx-1 overflow-x-auto pb-1">
            <div className="flex min-w-max gap-3 px-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={
                  activeTab === tab.id
                    ? "rounded-2xl border border-gold/30 bg-gold/10 px-4 py-2 text-sm text-white"
                    : "rounded-2xl border border-border bg-card px-4 py-2 text-sm text-muted transition hover:border-gold hover:text-white"
                }
              >
                {tab.label}
              </button>
            ))}
            </div>
          </div>

          {message ? (
            <div className="rounded-2xl border border-gold/20 bg-gold/10 px-4 py-3 text-sm text-lightGold">{message}</div>
          ) : null}

          {activeTab === "generate" ? (
            <section className="grid gap-6 2xl:grid-cols-[minmax(0,1.18fr)_minmax(420px,0.82fr)]">
              <div className="min-w-0 space-y-6">
                <div className="panel p-5 sm:p-6">
                  <div className="grid gap-6 lg:grid-cols-2">
                    <div>
                      <p className="text-xs uppercase tracking-[0.24em] text-muted">Category Groups</p>
                      {groupOptions.length > 0 ? (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {groupOptions.map((group) => (
                            <button
                              key={group}
                              type="button"
                              onClick={() => toggleFilter(group, selectedGroupFilters, setSelectedGroupFilters)}
                              className={
                                selectedGroupFilters.includes(group)
                                  ? "rounded-full border border-gold/30 bg-gold/10 px-3 py-2 text-sm text-lightGold"
                                  : "rounded-full border border-border bg-background px-3 py-2 text-sm text-muted"
                              }
                            >
                              {group}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <p className="mt-3 text-sm text-muted">No category groups yet. Import categories to filter by group.</p>
                      )}
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.24em] text-muted">Provinces</p>
                      {provinceOptions.length > 0 ? (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {provinceOptions.map((province) => (
                            <button
                              key={province}
                              type="button"
                              onClick={() => toggleFilter(province, selectedProvinceFilters, setSelectedProvinceFilters)}
                              className={
                                selectedProvinceFilters.includes(province)
                                  ? "rounded-full border border-gold/30 bg-gold/10 px-3 py-2 text-sm text-lightGold"
                                  : "rounded-full border border-border bg-background px-3 py-2 text-sm text-muted"
                              }
                            >
                              {province}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <p className="mt-3 text-sm text-muted">No provinces yet. Import locations to filter by province.</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid gap-6 xl:grid-cols-2">
                  <SelectionCard
                    title="Categories"
                    count={selectedCategories.length}
                    total={filteredCategories.length}
                    items={filteredCategories}
                    selectedIds={selectedCategoryIds}
                    labelFor={(item) => item.name}
                    subtitleFor={(item) => item.group_name ?? "No group"}
                    onToggle={(id) => toggleIdSelection(id, selectedCategoryIds, setSelectedCategoryIds)}
                    onSelectAll={() => setSelectedCategoryIds(filteredCategories.map((item) => item.id))}
                    onClear={() => setSelectedCategoryIds([])}
                  />
                  <SelectionCard
                    title="Locations"
                    count={selectedLocations.length}
                    total={filteredLocations.length}
                    items={filteredLocations}
                    selectedIds={selectedLocationIds}
                    labelFor={(item) => item.name}
                    subtitleFor={(item) => item.province ?? item.country}
                    onToggle={(id) => toggleIdSelection(id, selectedLocationIds, setSelectedLocationIds)}
                    onSelectAll={() => setSelectedLocationIds(filteredLocations.map((item) => item.id))}
                    onClear={() => setSelectedLocationIds([])}
                  />
                </div>

                <SelectionCard
                  title="Patterns"
                  count={activePatterns.length}
                  total={patterns.filter((item) => item.active).length}
                  items={patterns.filter((item) => item.active)}
                  selectedIds={selectedPatternIds}
                  labelFor={(item) => item.pattern}
                  subtitleFor={() => "Pattern"}
                  onToggle={(id) => toggleIdSelection(id, selectedPatternIds, setSelectedPatternIds)}
                  onSelectAll={() => setSelectedPatternIds(patterns.filter((item) => item.active).map((item) => item.id))}
                  onClear={() => setSelectedPatternIds([])}
                />
              </div>

              <div className="panel min-w-0 p-5 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-muted">Preview Builder</p>
                    <h2 className="mt-2 font-display text-3xl text-white">Generate combinations</h2>
                  </div>
                  <select
                    value={generationLimit}
                    onChange={(event) => setGenerationLimit(Number(event.target.value))}
                    className="h-11 min-w-[148px] rounded-2xl border border-border bg-background px-4 text-white outline-none transition focus:border-gold"
                  >
                    {GENERATION_LIMIT_OPTIONS.map((value) => (
                      <option key={value} value={value}>
                        {value.toLocaleString()} terms
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mt-6 grid gap-4 grid-cols-2">
                  <MetricBox label="Selected Categories" value={selectedCategories.length} />
                  <MetricBox label="Selected Locations" value={selectedLocations.length} />
                  <MetricBox label="Active Patterns" value={activePatterns.length} />
                  <MetricBox label="Raw Combinations" value={rawCombinationCount.toLocaleString()} />
                </div>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <button
                    type="button"
                    onClick={generatePreview}
                    className="h-12 rounded-2xl border border-gold/30 bg-gold px-5 font-medium text-background transition hover:bg-lightGold"
                  >
                    Generate Preview
                  </button>
                  <button
                    type="button"
                    onClick={saveGeneratedTerms}
                    disabled={previewDrafts.length === 0 || saveProgress.active}
                    className="h-12 rounded-2xl border border-border bg-background px-5 font-medium text-white transition hover:border-gold disabled:opacity-50"
                  >
                    Save Generated Terms
                  </button>
                </div>

                {(saveProgress.active || saveProgress.total > 0) ? (
                  <ProgressPanel
                    className="mt-6"
                    label="Save Progress"
                    processed={saveProgress.processed}
                    total={saveProgress.total}
                    detail={`${saveProgress.inserted} inserted, ${saveProgress.skipped} skipped`}
                  />
                ) : null}

                <div className="mt-6 overflow-hidden rounded-3xl border border-border bg-background/60">
                  <div className="border-b border-border px-5 py-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-muted">Preview</p>
                    <p className="mt-1 text-sm text-muted">
                      {previewDrafts.length.toLocaleString()} terms ready. Showing the first {Math.min(previewRows.length, 250)} rows.
                    </p>
                  </div>
                  <div className="max-h-[420px] overflow-auto sm:max-h-[520px]">
                    <table className="data-table min-w-full">
                      <thead>
                        <tr>
                          <th>Term</th>
                        </tr>
                      </thead>
                      <tbody>
                        {previewRows.map((item) => (
                          <tr key={`${item.category_id}-${item.location_id}-${item.pattern_id}-${item.term}`}>
                            <td className="font-medium">{item.term}</td>
                          </tr>
                        ))}
                        {previewRows.length === 0 ? (
                          <tr>
                            <td className="px-4 py-10 text-center text-sm text-muted">
                              Select active datasets and generate a preview to inspect the combinations before saving.
                            </td>
                          </tr>
                        ) : null}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </section>
          ) : null}

          {activeTab === "categories" ? (
        <DatasetTab
          title="Business Categories"
          description="Import category CSV data and activate or deactivate business niches for generation."
          importHint="CSV columns: name, group_name, priority, active"
          onImport={(file) => handleCsvImport("categories", file)}
          rows={categories}
          renderColumns={(row) => (
            <>
              <td className="font-medium">{row.name}</td>
              <td>{row.group_name ?? "-"}</td>
              <td>{row.priority}</td>
              <td>
                <ToggleButton active={row.active} onClick={() => toggleDatasetActive("categories", row.id, !row.active)} />
              </td>
            </>
          )}
          headers={["Name", "Group", "Priority", "Active"]}
        />
          ) : null}

          {activeTab === "locations" ? (
        <DatasetTab
          title="Locations"
          description="Import city and area CSV data, then control which locations are active for generation."
          importHint="CSV columns: name, province, country, location_type, active"
          onImport={(file) => handleCsvImport("locations", file)}
          rows={locations}
          renderColumns={(row) => (
            <>
              <td className="font-medium">{row.name}</td>
              <td>{row.province ?? "-"}</td>
              <td>{row.country}</td>
              <td>{row.location_type ?? "-"}</td>
              <td>
                <ToggleButton active={row.active} onClick={() => toggleDatasetActive("locations", row.id, !row.active)} />
              </td>
            </>
          )}
          headers={["Name", "Province", "Country", "Type", "Active"]}
        />
          ) : null}

          {activeTab === "patterns" ? (
        <DatasetTab
          title="Patterns"
          description="Import pattern CSV data and decide which pattern formats are active in generation."
          importHint="CSV columns: pattern, active"
          onImport={(file) => handleCsvImport("patterns", file)}
          rows={patterns}
          renderColumns={(row) => (
            <>
              <td className="font-medium">{row.pattern}</td>
              <td>
                <ToggleButton active={row.active} onClick={() => toggleDatasetActive("patterns", row.id, !row.active)} />
              </td>
            </>
          )}
          headers={["Pattern", "Active"]}
        />
          ) : null}

          {activeTab === "generated" ? (
        <section className="space-y-6">
          <div className="grid gap-6 grid-cols-2 md:grid-cols-4">
            <MetricBox label="Total Generated" value={generatedCounts.total.toLocaleString()} />
            <MetricBox label="Pending" value={generatedCounts.pending.toLocaleString()} />
            <MetricBox label="Queued" value={generatedCounts.queued.toLocaleString()} />
            <MetricBox label="Skipped" value={generatedCounts.skipped.toLocaleString()} />
          </div>

          <div className="panel p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-muted">Generated Terms</p>
                <h2 className="mt-2 font-display text-3xl text-white">Manage staged generator output</h2>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <a
                  href="/api/generator/generated-terms/export"
                  className="inline-flex h-12 items-center gap-2 rounded-2xl border border-border bg-background px-5 font-medium text-white transition hover:border-gold"
                >
                  <Download className="h-4 w-4" />
                  Export CSV
                </a>
                <button
                  type="button"
                  onClick={pushGeneratedToQueue}
                  disabled={generatedCounts.pending === 0 || queueProgress.active}
                  className="inline-flex h-12 items-center gap-2 rounded-2xl border border-gold/30 bg-gold px-5 font-medium text-background transition hover:bg-lightGold disabled:opacity-50"
                >
                  <RefreshCw className="h-4 w-4" />
                  Push to Main Queue
                </button>
              </div>
            </div>

            {(queueProgress.active || queueProgress.total > 0) ? (
              <ProgressPanel
                className="mt-6"
                label="Queue Push Progress"
                processed={queueProgress.processed}
                total={queueProgress.total}
                detail={`${queueProgress.inserted} inserted, ${queueProgress.skipped} skipped`}
              />
            ) : null}

            <div className="mt-6 overflow-x-auto">
              <table className="data-table min-w-full">
                <thead>
                  <tr>
                    <th>Term</th>
                    <th>Status</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {generatedTermsDb.map((row) => (
                    <tr key={row.id}>
                      <td className="font-medium">{row.term}</td>
                      <td>{row.status}</td>
                      <td>{formatDate(row.created_at)}</td>
                    </tr>
                  ))}
                  {generatedTermsDb.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-4 py-10 text-center text-sm text-muted">
                        No generated terms saved yet.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>
        </section>
          ) : null}
        </>
      ) : null}
    </div>
  );
}

function MetricBox({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="panel p-4 sm:p-5">
      <p className="text-xs uppercase tracking-[0.24em] text-muted">{label}</p>
      <p className="mt-3 font-display text-2xl text-white sm:text-3xl">{value}</p>
    </div>
  );
}

function ProgressPanel({
  label,
  processed,
  total,
  detail,
  className
}: {
  label: string;
  processed: number;
  total: number;
  detail: string;
  className?: string;
}) {
  const progress = total > 0 ? Math.min(100, Math.round((processed / total) * 100)) : 0;

  return (
    <div className={className}>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-medium text-white">{label}</p>
        <p className="text-sm text-muted">
          {processed.toLocaleString()} / {total.toLocaleString()}
        </p>
      </div>
      <div className="mt-3 h-3 overflow-hidden rounded-full bg-background">
        <div className="h-full rounded-full bg-gradient-to-r from-gold to-lightGold" style={{ width: `${progress}%` }} />
      </div>
      <p className="mt-2 text-sm text-muted">{detail}</p>
    </div>
  );
}

function SelectionCard<T extends { id: string }>({
  title,
  count,
  total,
  items,
  selectedIds,
  labelFor,
  subtitleFor,
  onToggle,
  onSelectAll,
  onClear
}: {
  title: string;
  count: number;
  total: number;
  items: T[];
  selectedIds: string[];
  labelFor: (item: T) => string;
  subtitleFor: (item: T) => string;
  onToggle: (id: string) => void;
  onSelectAll: () => void;
  onClear: () => void;
}) {
  return (
    <div className="panel min-w-0 overflow-hidden">
      <div className="border-b border-border px-4 py-4 sm:px-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-muted">{title}</p>
            <p className="mt-1 text-sm text-muted">
              {count} selected of {total}
            </p>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={onSelectAll} className="rounded-xl border border-border px-3 py-2 text-xs text-white">
              All
            </button>
            <button type="button" onClick={onClear} className="rounded-xl border border-border px-3 py-2 text-xs text-muted">
              Clear
            </button>
          </div>
        </div>
      </div>
      <div className="max-h-[320px] overflow-auto divide-y divide-border sm:max-h-[360px]">
        {items.map((item) => {
          const active = selectedIds.includes(item.id);
          return (
            <label key={item.id} className="flex items-start gap-3 px-4 py-3 sm:px-5">
              <input type="checkbox" checked={active} onChange={() => onToggle(item.id)} className="mt-1 h-4 w-4 accent-[#C99A32]" />
              <div className="min-w-0">
                <p className="break-words text-sm font-medium text-white">{labelFor(item)}</p>
                <p className="mt-1 text-xs text-muted">{subtitleFor(item)}</p>
              </div>
            </label>
          );
        })}
        {items.length === 0 ? <p className="px-5 py-8 text-sm text-muted">No active records for this filter.</p> : null}
      </div>
    </div>
  );
}

function ToggleButton({ active, onClick }: { active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? "rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-lightGold"
          : "rounded-full border border-border bg-background px-3 py-1 text-xs uppercase tracking-[0.2em] text-muted"
      }
    >
      {active ? "Active" : "Inactive"}
    </button>
  );
}

function DatasetTab<T extends { id: string }>({
  title,
  description,
  importHint,
  onImport,
  rows,
  headers,
  renderColumns
}: {
  title: string;
  description: string;
  importHint: string;
  onImport: (file: File | null) => void;
  rows: T[];
  headers: string[];
  renderColumns: (row: T) => ReactNode;
}) {
  return (
    <section className="panel overflow-hidden">
      <div className="border-b border-border px-5 py-5 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-muted">{title}</p>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">{description}</p>
            <p className="mt-2 text-xs text-muted">{importHint}</p>
          </div>
          <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-gold/30 bg-gold px-4 py-3 text-sm font-medium text-background">
            <Upload className="h-4 w-4" />
            Import CSV
            <input type="file" accept=".csv,text/csv" className="hidden" onChange={(event) => onImport(event.target.files?.[0] ?? null)} />
          </label>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="data-table min-w-full">
          <thead>
            <tr>
              {headers.map((header) => (
                <th key={header}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>{renderColumns(row)}</tr>
            ))}
            {rows.length === 0 ? (
              <tr>
                <td colSpan={headers.length} className="px-4 py-10 text-center text-sm text-muted">
                  No records loaded yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}
