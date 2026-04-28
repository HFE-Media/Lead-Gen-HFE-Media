import { unstable_noStore as noStore } from "next/cache";
import { CALL_OUTCOME_LABELS } from "@/lib/crm";
import { hasCoreEnv } from "@/lib/env";
import { getSupabaseAdmin } from "@/lib/supabase";
import type {
  AppSettings,
  BusinessCategory,
  DashboardMetrics,
  GeneratedSearchTerm,
  GeneratorDataset,
  Lead,
  LocationRecord,
  SearchTerm,
  TermPattern
} from "@/lib/types";

function isWeekend(date: Date) {
  const day = date.getDay();
  return day === 0 || day === 6;
}

function getRecentBusinessDays(count: number) {
  const days: Date[] = [];
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  while (days.length < count) {
    if (!isWeekend(cursor)) {
      days.unshift(new Date(cursor));
    }

    cursor.setDate(cursor.getDate() - 1);
  }

  return days;
}

function emptyDashboardMetrics(): DashboardMetrics {
  return {
    totalLeads: 0,
    noWebsiteLeads: 0,
    contactedLeads: 0,
    interestedLeads: 0,
    wonLeads: 0,
    pendingTerms: 0,
    searchedTerms: 0,
    latestLeads: [],
    latestSearches: [],
    followUpsDue: [],
    activitySeries: [],
    outcomeBreakdown: []
  };
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  noStore();

  if (!hasCoreEnv()) {
    return emptyDashboardMetrics();
  }

  const supabase = getSupabaseAdmin();
  const today = new Date();
  const endDate = new Date(today);
  endDate.setHours(23, 59, 59, 999);
  const businessDays = getRecentBusinessDays(5);
  const startDate = new Date(businessDays[0]);
  startDate.setHours(0, 0, 0, 0);

  const [
    { count: totalLeads },
    { count: pendingTerms },
    { count: searchedTerms },
    { count: contactedLeads },
    { count: interestedLeads },
    { count: wonLeads },
    leadsResult,
    searchResult,
    followUpsResult,
    activityResult
  ] = await Promise.all([
    supabase.from("leads").select("*", { count: "exact", head: true }),
    supabase.from("search_terms").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("search_terms").select("*", { count: "exact", head: true }).eq("status", "searched"),
    supabase.from("leads").select("*", { count: "exact", head: true }).in("lead_status", ["contacted", "interested", "quoted", "won", "lost"]),
    supabase.from("leads").select("*", { count: "exact", head: true }).in("lead_status", ["interested", "quoted", "won"]),
    supabase.from("leads").select("*", { count: "exact", head: true }).eq("lead_status", "won"),
    supabase.from("leads").select("*").order("created_at", { ascending: false }).limit(8),
    supabase.from("search_terms").select("*").order("created_at", { ascending: false }).limit(8),
    supabase
      .from("leads")
      .select("*")
      .not("follow_up_at", "is", null)
      .lte("follow_up_at", endDate.toISOString())
      .order("follow_up_at", { ascending: true })
      .limit(6),
    supabase
      .from("leads")
      .select("lead_status,call_outcome,last_call_at")
      .not("last_call_at", "is", null)
      .gte("last_call_at", startDate.toISOString())
      .order("last_call_at", { ascending: true })
  ]);

  for (const result of [leadsResult, searchResult, followUpsResult, activityResult]) {
    if (result.error) {
      throw new Error(result.error.message);
    }
  }

  const activityRows = (activityResult.data ?? []) as Array<{
    lead_status: Lead["lead_status"];
    call_outcome: Lead["call_outcome"];
    last_call_at: string | null;
  }>;

  const dateMap = new Map<string, { date: string; contacted: number; interested: number; won: number }>();
  for (const date of businessDays) {
    const key = date.toISOString().slice(0, 10);
    dateMap.set(key, { date: key, contacted: 0, interested: 0, won: 0 });
  }

  const outcomeMap = new Map<string, number>();

  for (const row of activityRows) {
    if (row.last_call_at) {
      const key = row.last_call_at.slice(0, 10);
      const bucket = dateMap.get(key);

      if (bucket) {
        if (["contacted", "interested", "quoted", "won", "lost"].includes(row.lead_status)) {
          bucket.contacted += 1;
        }

        if (["interested", "quoted", "won"].includes(row.lead_status)) {
          bucket.interested += 1;
        }

        if (row.lead_status === "won") {
          bucket.won += 1;
        }
      }
    }

    if (row.call_outcome) {
      outcomeMap.set(row.call_outcome, (outcomeMap.get(row.call_outcome) ?? 0) + 1);
    }
  }

  return {
    totalLeads: totalLeads ?? 0,
    noWebsiteLeads: totalLeads ?? 0,
    contactedLeads: contactedLeads ?? 0,
    interestedLeads: interestedLeads ?? 0,
    wonLeads: wonLeads ?? 0,
    pendingTerms: pendingTerms ?? 0,
    searchedTerms: searchedTerms ?? 0,
    latestLeads: (leadsResult.data as Lead[] | null) ?? [],
    latestSearches: (searchResult.data as SearchTerm[] | null) ?? [],
    followUpsDue: (followUpsResult.data as Lead[] | null) ?? [],
    activitySeries: Array.from(dateMap.values()),
    outcomeBreakdown: Array.from(outcomeMap.entries()).map(([key, value]) => ({
      label: CALL_OUTCOME_LABELS[key as keyof typeof CALL_OUTCOME_LABELS] ?? key,
      value
    }))
  };
}

export async function getSearchTerms(status?: "pending" | "searched") {
  noStore();

  if (!hasCoreEnv()) {
    return [];
  }

  const supabase = getSupabaseAdmin();
  let query = supabase.from("search_terms").select("*").order("created_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return (data as SearchTerm[]) ?? [];
}

export async function getLeads() {
  noStore();

  if (!hasCoreEnv()) {
    return [];
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .order("follow_up_at", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data as Lead[]) ?? [];
}

export async function getAppSettings() {
  noStore();

  if (!hasCoreEnv()) {
    return {
      id: 1,
      default_batch_size: 5,
      default_delay_ms: 1000,
      created_at: new Date(0).toISOString(),
      updated_at: new Date(0).toISOString()
    } as AppSettings;
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from("app_settings").select("*").eq("id", 1).single();

  if (error) {
    throw new Error(error.message);
  }

  return data as AppSettings;
}

export async function getGeneratorDataset(): Promise<GeneratorDataset> {
  noStore();

  if (!hasCoreEnv()) {
    return {
      categories: [],
      locations: [],
      patterns: [],
      generatedTerms: [],
      setupRequired: true,
      setupMessage: "Add your environment variables and restart the app before using the generator.",
      generatedCounts: {
        total: 0,
        pending: 0,
        queued: 0,
        skipped: 0
      }
    };
  }

  const supabase = getSupabaseAdmin();
  const [categoriesResult, locationsResult, patternsResult, generatedResult, totalResult, pendingResult, queuedResult, skippedResult] =
    await Promise.all([
      supabase.from("business_categories").select("*").order("priority", { ascending: false }).order("name", { ascending: true }),
      supabase.from("locations").select("*").order("province", { ascending: true }).order("name", { ascending: true }),
      supabase.from("term_patterns").select("*").order("created_at", { ascending: true }),
      supabase.from("generated_search_terms").select("*").order("created_at", { ascending: false }).limit(250),
      supabase.from("generated_search_terms").select("*", { count: "exact", head: true }),
      supabase.from("generated_search_terms").select("*", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("generated_search_terms").select("*", { count: "exact", head: true }).eq("status", "queued"),
      supabase.from("generated_search_terms").select("*", { count: "exact", head: true }).eq("status", "skipped")
    ]);

  for (const result of [categoriesResult, locationsResult, patternsResult, generatedResult]) {
    if (result.error) {
      if (result.error.message.includes("Could not find the table") || result.error.message.includes("schema cache")) {
        return {
          categories: [],
          locations: [],
          patterns: [],
          generatedTerms: [],
          setupRequired: true,
          setupMessage:
            "The generator tables have not been created in Supabase yet. Re-run sql/schema.sql and optionally sql/generator-seed.sql, then refresh this page.",
          generatedCounts: {
            total: 0,
            pending: 0,
            queued: 0,
            skipped: 0
          }
        };
      }

      throw new Error(result.error.message);
    }
  }

  return {
    categories: (categoriesResult.data as BusinessCategory[]) ?? [],
    locations: (locationsResult.data as LocationRecord[]) ?? [],
    patterns: (patternsResult.data as TermPattern[]) ?? [],
    generatedTerms: (generatedResult.data as GeneratedSearchTerm[]) ?? [],
    setupRequired: false,
    setupMessage: null,
    generatedCounts: {
      total: totalResult.count ?? 0,
      pending: pendingResult.count ?? 0,
      queued: queuedResult.count ?? 0,
      skipped: skippedResult.count ?? 0
    }
  };
}
