import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { DEFAULT_REGION, isSupportedRegion } from "@/lib/regions";
import { getSupabaseAdmin } from "@/lib/supabase";

function splitTerms(value: string) {
  return value
    .split(/[\n,]+/)
    .map((term) => term.trim())
    .filter(Boolean);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { term?: string; bulk?: string; region?: string };
    const rawTerms = [body.term ?? "", body.bulk ?? ""].filter(Boolean).flatMap(splitTerms);
    const region = (body.region ?? DEFAULT_REGION).trim().toLowerCase();

    if (rawTerms.length === 0) {
      return NextResponse.json({ error: "Please provide at least one search term." }, { status: 400 });
    }

    if (!isSupportedRegion(region)) {
      return NextResponse.json({ error: "Please choose a supported region." }, { status: 400 });
    }

    const uniqueTerms = [...new Set(rawTerms.map((term) => term.toLowerCase()))];
    const supabase = getSupabaseAdmin();

    const { data: existingTerms } = await supabase.from("search_terms").select("term, region");
    const existing = new Set(
      (existingTerms ?? []).map((item) => `${String(item.term).toLowerCase()}::${String(item.region).toLowerCase()}`)
    );
    const payload = uniqueTerms
      .filter((term) => !existing.has(`${term}::${region}`))
      .map((term) => ({
        term,
        region,
        status: "pending"
      }));

    if (payload.length === 0) {
      return NextResponse.json({ message: "All provided terms already exist for that region." });
    }

    const { error } = await supabase.from("search_terms").insert(payload);

    if (error) {
      if (error.message.includes("search_terms_term_key")) {
        throw new Error("Database schema still uses term-only uniqueness. Re-run sql/schema.sql so the same term can be used in multiple regions.");
      }

      throw new Error(error.message);
    }

    revalidatePath("/");
    revalidatePath("/search-terms");
    revalidatePath("/run-search");

    return NextResponse.json({ message: `${payload.length} search terms added for ${region.toUpperCase()}.` });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to save search terms." },
      { status: 500 }
    );
  }
}
