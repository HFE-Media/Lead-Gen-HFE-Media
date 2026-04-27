import { revalidatePath } from "next/cache";
import { getPlaceDetails, searchPlacesText } from "@/lib/google-places";
import { DEFAULT_REGION } from "@/lib/regions";
import { getSupabaseAdmin } from "@/lib/supabase";
import type { RunSearchResponse, SearchTerm } from "@/lib/types";
import { normalizePhone, sleep } from "@/lib/utils";

async function leadExists(placeId: string, name: string, phone: string | null) {
  const supabase = getSupabaseAdmin();

  const byPlaceId = await supabase.from("leads").select("id").eq("place_id", placeId).maybeSingle();
  if (byPlaceId.data) {
    return true;
  }

  if (phone) {
    const byNamePhone = await supabase
      .from("leads")
      .select("id")
      .ilike("name", name)
      .eq("phone_normalized", phone)
      .maybeSingle();

    if (byNamePhone.data) {
      return true;
    }
  }

  return false;
}

export async function runSearchBatch(batchSize: number, delayMs: number): Promise<RunSearchResponse> {
  const supabase = getSupabaseAdmin();

  const pendingCountResult = await supabase
    .from("search_terms")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending");

  const totalPendingBeforeRun = pendingCountResult.count ?? 0;

  const { data: terms, error } = await supabase
    .from("search_terms")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: true })
    .limit(batchSize);

  if (error) {
    throw new Error(error.message);
  }

  const pendingTerms = (terms as SearchTerm[]) ?? [];

  if (pendingTerms.length === 0) {
    return {
      done: true,
      processedTerms: 0,
      leadsAdded: 0,
      leadsSkipped: 0,
      placeDetailsChecked: 0,
      remainingTerms: 0,
      totalPendingBeforeRun,
      termSummaries: []
    };
  }

  let leadsAdded = 0;
  let leadsSkipped = 0;
  let placeDetailsChecked = 0;
  const termSummaries: RunSearchResponse["termSummaries"] = [];

  for (let index = 0; index < pendingTerms.length; index += 1) {
    const term = pendingTerms[index];
    const places = await searchPlacesText(term.term, term.region || DEFAULT_REGION);
    let savedForTerm = 0;

    for (const place of places) {
      const details = await getPlaceDetails(place.name);
      placeDetailsChecked += 1;

      const website = details.websiteUri?.trim() || null;

      if (website) {
        leadsSkipped += 1;
        continue;
      }

      const phone = details.internationalPhoneNumber ?? details.nationalPhoneNumber ?? null;
      const phoneNormalized = normalizePhone(phone);
      const duplicate = await leadExists(details.id, details.displayName?.text ?? "Unknown", phoneNormalized);

      if (duplicate) {
        leadsSkipped += 1;
        continue;
      }

      const insertResult = await supabase.from("leads").insert({
        place_id: details.id,
        name: details.displayName?.text ?? "Unknown",
        formatted_address: details.formattedAddress ?? null,
        formatted_phone_number: phone,
        phone_normalized: phoneNormalized,
        website,
        rating: details.rating ?? null,
        source_term: term.term
      });

      if (insertResult.error) {
        throw new Error(insertResult.error.message);
      }

      leadsAdded += 1;
      savedForTerm += 1;
    }

    const updateResult = await supabase
      .from("search_terms")
      .update({
        status: "searched",
        searched_at: new Date().toISOString(),
        result_count: places.length
      })
      .eq("id", term.id);

    if (updateResult.error) {
      throw new Error(updateResult.error.message);
    }

    termSummaries.push({
      term: `${term.term} (${(term.region || DEFAULT_REGION).toUpperCase()})`,
      placesFound: places.length,
      saved: savedForTerm
    });

    if (delayMs > 0 && index < pendingTerms.length - 1) {
      await sleep(delayMs);
    }
  }

  const remainingCountResult = await supabase
    .from("search_terms")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending");

  revalidatePath("/");
  revalidatePath("/search-terms");
  revalidatePath("/run-search");
  revalidatePath("/leads");
  revalidatePath("/already-searched");

  return {
    done: (remainingCountResult.count ?? 0) === 0,
    processedTerms: pendingTerms.length,
    leadsAdded,
    leadsSkipped,
    placeDetailsChecked,
    remainingTerms: remainingCountResult.count ?? 0,
    totalPendingBeforeRun,
    termSummaries
  };
}
