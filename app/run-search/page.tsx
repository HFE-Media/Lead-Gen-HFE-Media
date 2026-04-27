import { RunSearchPanel } from "@/components/run-search-panel";
import { getAppSettings, getSearchTerms } from "@/lib/data";

export default async function RunSearchPage() {
  const [pending, searched, settings] = await Promise.all([
    getSearchTerms("pending"),
    getSearchTerms("searched"),
    getAppSettings()
  ]);

  return (
    <RunSearchPanel
      pendingCount={pending.length}
      searchedCount={searched.length}
      defaultBatchSize={settings.default_batch_size}
      defaultDelayMs={settings.default_delay_ms}
    />
  );
}
