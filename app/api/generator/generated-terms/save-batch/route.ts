import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSupabaseAdmin } from "@/lib/supabase";
import { normalizeGeneratedTerm } from "@/lib/search-term-generator";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      items?: Array<{
        term: string;
        category_id: string;
        location_id: string;
        pattern_id: string;
      }>;
    };

    const items = (body.items ?? [])
      .map((item) => ({
        term: normalizeGeneratedTerm(item.term),
        category_id: item.category_id,
        location_id: item.location_id,
        pattern_id: item.pattern_id
      }))
      .filter((item) => item.term);

    if (items.length === 0) {
      return NextResponse.json({ inserted: 0, skipped: 0, message: "No terms in this batch." });
    }

    const terms = Array.from(new Set(items.map((item) => item.term)));
    const supabase = getSupabaseAdmin();
    const [existingGenerated, existingQueued] = await Promise.all([
      supabase.from("generated_search_terms").select("term").in("term", terms),
      supabase.from("search_terms").select("term").in("term", terms)
    ]);

    if (existingGenerated.error) {
      throw new Error(existingGenerated.error.message);
    }

    if (existingQueued.error) {
      throw new Error(existingQueued.error.message);
    }

    const existing = new Set([
      ...(existingGenerated.data ?? []).map((row) => String(row.term).toLowerCase()),
      ...(existingQueued.data ?? []).map((row) => String(row.term).toLowerCase())
    ]);

    const payload = items
      .filter((item) => !existing.has(item.term))
      .map((item) => ({
        term: item.term,
        category_id: item.category_id,
        location_id: item.location_id,
        pattern_id: item.pattern_id,
        status: "pending" as const
      }));

    if (payload.length > 0) {
      const { error } = await supabase.from("generated_search_terms").insert(payload);
      if (error) {
        throw new Error(error.message);
      }
    }

    revalidatePath("/search-terms/generator");
    revalidatePath("/search-terms");

    return NextResponse.json({
      inserted: payload.length,
      skipped: items.length - payload.length
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to save generated terms." },
      { status: 500 }
    );
  }
}
