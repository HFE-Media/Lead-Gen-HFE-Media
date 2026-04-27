import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSupabaseAdmin } from "@/lib/supabase";

type ToggleKind = "categories" | "locations" | "patterns";

const tableMap = {
  categories: "business_categories",
  locations: "locations",
  patterns: "term_patterns"
} as const;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { kind?: ToggleKind; id?: string; active?: boolean };
    const kind = body.kind;
    const id = body.id;

    if (!kind || !id || !(kind in tableMap)) {
      return NextResponse.json({ error: "Invalid toggle request." }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from(tableMap[kind]).update({ active: Boolean(body.active) }).eq("id", id);

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath("/search-terms/generator");
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update active state." },
      { status: 500 }
    );
  }
}
