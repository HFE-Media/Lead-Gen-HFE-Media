import { unstable_noStore as noStore } from "next/cache";
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

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  noStore();

  if (!hasCoreEnv()) {
    return {
      totalLeads: 0,
      pendingTerms: 0,
      searchedTerms: 0,
      latestLeads: [],
      latestSearches: []
    };
  }

  const supabase = getSupabaseAdmin();

  const [{ count: totalLeads }, { count: pendingTerms }, { count: searchedTerms }, leadsResult, searchResult] =
    await Promise.all([
      supabase.from("leads").select("*", { count: "exact", head: true }),
      supabase.from("search_terms").select("*", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("search_terms").select("*", { count: "exact", head: true }).eq("status", "searched"),
      supabase.from("leads").select("*").order("created_at", { ascending: false }).limit(8),
      supabase.from("search_terms").select("*").order("created_at", { ascending: false }).limit(8)
    ]);

  return {
    totalLeads: totalLeads ?? 0,
    pendingTerms: pendingTerms ?? 0,
    searchedTerms: searchedTerms ?? 0,
    latestLeads: (leadsResult.data as Lead[] | null) ?? [],
    latestSearches: (searchResult.data as SearchTerm[] | null) ?? []
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
  const { data, error } = await supabase.from("leads").select("*").order("created_at", { ascending: false });

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
      if (
        result.error.message.includes("Could not find the table") ||
        result.error.message.includes("schema cache")
      ) {
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
