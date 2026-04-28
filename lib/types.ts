import type { CallOutcome, LeadStatus } from "@/lib/crm";

export type SearchTerm = {
  id: string;
  term: string;
  region: string;
  status: "pending" | "searched";
  searched_at: string | null;
  result_count: number;
  created_at: string;
};

export type BusinessCategory = {
  id: string;
  name: string;
  group_name: string | null;
  priority: number;
  active: boolean;
  created_at: string;
};

export type LocationRecord = {
  id: string;
  name: string;
  province: string | null;
  country: string;
  location_type: string | null;
  active: boolean;
  created_at: string;
};

export type TermPattern = {
  id: string;
  pattern: string;
  active: boolean;
  created_at: string;
};

export type GeneratedSearchTerm = {
  id: string;
  term: string;
  category_id: string | null;
  location_id: string | null;
  pattern_id: string | null;
  status: "pending" | "queued" | "skipped";
  created_at: string;
};

export type GeneratorDataset = {
  categories: BusinessCategory[];
  locations: LocationRecord[];
  patterns: TermPattern[];
  generatedTerms: GeneratedSearchTerm[];
  setupRequired: boolean;
  setupMessage: string | null;
  generatedCounts: {
    total: number;
    pending: number;
    queued: number;
    skipped: number;
  };
};

export type Lead = {
  id: string;
  place_id: string | null;
  name: string;
  formatted_address: string | null;
  formatted_phone_number: string | null;
  phone_normalized: string | null;
  website: string | null;
  rating: number | null;
  source_term: string | null;
  lead_status: LeadStatus;
  call_outcome: CallOutcome | null;
  last_call_at: string | null;
  lead_notes: string | null;
  follow_up_at: string | null;
  quoted_amount: number | null;
  won_value: number | null;
  assigned_agent: string | null;
  updated_at: string | null;
  created_at: string;
};

export type AppSettings = {
  id: number;
  default_batch_size: number;
  default_delay_ms: number;
  created_at: string;
  updated_at: string;
};

export type DashboardMetrics = {
  totalLeads: number;
  noWebsiteLeads: number;
  contactedLeads: number;
  interestedLeads: number;
  wonLeads: number;
  pendingTerms: number;
  searchedTerms: number;
  latestLeads: Lead[];
  latestSearches: SearchTerm[];
  followUpsDue: Lead[];
  activitySeries: Array<{
    date: string;
    contacted: number;
    interested: number;
    won: number;
  }>;
  outcomeBreakdown: Array<{
    label: string;
    value: number;
  }>;
};

export type RunSearchResponse = {
  done: boolean;
  processedTerms: number;
  leadsAdded: number;
  leadsSkipped: number;
  placeDetailsChecked: number;
  remainingTerms: number;
  totalPendingBeforeRun: number;
  termSummaries: Array<{
    term: string;
    placesFound: number;
    saved: number;
  }>;
};
