import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { DEFAULT_REGION } from "@/lib/regions";
import { getSupabaseAdmin } from "@/lib/supabase";

const PUSH_BATCH_SIZE = 500;

export async function POST() {
  try {
    const supabase = getSupabaseAdmin();
    const { data: generatedTerms, error } = await supabase
      .from("generated_search_terms")
      .select("id,term")
      .eq("status", "pending")
      .order("created_at", { ascending: true })
      .limit(PUSH_BATCH_SIZE);

    if (error) {
      throw new Error(error.message);
    }

    const batch = generatedTerms ?? [];

    if (batch.length === 0) {
      return NextResponse.json({
        processed: 0,
        inserted: 0,
        skipped: 0,
        remaining: 0,
        done: true
      });
    }

    const terms = batch.map((item) => item.term);
    const { data: existingQueue, error: existingError } = await supabase.from("search_terms").select("term").in("term", terms);

    if (existingError) {
      throw new Error(existingError.message);
    }

    const existing = new Set((existingQueue ?? []).map((row) => String(row.term).toLowerCase()));
    const toInsert = batch
      .filter((item) => !existing.has(item.term.toLowerCase()))
      .map((item) => ({
        term: item.term,
        region: DEFAULT_REGION,
        status: "pending" as const
      }));

    if (toInsert.length > 0) {
      const { error: insertError } = await supabase.from("search_terms").insert(toInsert);
      if (insertError) {
        throw new Error(insertError.message);
      }
    }

    const insertedTerms = new Set(toInsert.map((item) => item.term.toLowerCase()));
    const queuedIds = batch.filter((item) => insertedTerms.has(item.term.toLowerCase())).map((item) => item.id);
    const skippedIds = batch.filter((item) => !insertedTerms.has(item.term.toLowerCase())).map((item) => item.id);

    if (queuedIds.length > 0) {
      const { error: queuedError } = await supabase.from("generated_search_terms").update({ status: "queued" }).in("id", queuedIds);
      if (queuedError) {
        throw new Error(queuedError.message);
      }
    }

    if (skippedIds.length > 0) {
      const { error: skippedError } = await supabase.from("generated_search_terms").update({ status: "skipped" }).in("id", skippedIds);
      if (skippedError) {
        throw new Error(skippedError.message);
      }
    }

    const remainingResult = await supabase
      .from("generated_search_terms")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending");

    revalidatePath("/search-terms/generator");
    revalidatePath("/search-terms");
    revalidatePath("/run-search");

    return NextResponse.json({
      processed: batch.length,
      inserted: toInsert.length,
      skipped: batch.length - toInsert.length,
      remaining: remainingResult.count ?? 0,
      done: (remainingResult.count ?? 0) === 0
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to push generated terms to the queue." },
      { status: 500 }
    );
  }
}
