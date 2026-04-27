import { getSupabaseAdmin } from "@/lib/supabase";
import { toCsvRow } from "@/lib/utils";

export async function GET() {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("generated_search_terms")
    .select("term,status,created_at,category_id,location_id,pattern_id")
    .order("created_at", { ascending: false });

  if (error) {
    return new Response(error.message, { status: 500 });
  }

  const csv = [
    toCsvRow(["term", "status", "created_at", "category_id", "location_id", "pattern_id"]),
    ...(data ?? []).map((row) =>
      toCsvRow([row.term, row.status, row.created_at, row.category_id, row.location_id, row.pattern_id])
    )
  ].join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="generated-search-terms.csv"'
    }
  });
}
