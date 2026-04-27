import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSupabaseAdmin } from "@/lib/supabase";
import { parseBoolean, parseCsvText } from "@/lib/search-term-generator";

type ImportKind = "categories" | "locations" | "patterns";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { kind?: ImportKind; csv?: string };
    const kind = body.kind;
    const csv = body.csv ?? "";

    if (!kind || !["categories", "locations", "patterns"].includes(kind)) {
      return NextResponse.json({ error: "Invalid import type." }, { status: 400 });
    }

    const rows = parseCsvText(csv);

    if (rows.length === 0) {
      return NextResponse.json({ error: "CSV file is empty." }, { status: 400 });
    }

    const [header, ...dataRows] = rows;
    const normalizedHeader = header.map((cell) => cell.toLowerCase());
    const hasHeader = normalizedHeader.some((cell) =>
      ["name", "group_name", "priority", "province", "country", "location_type", "pattern", "active"].includes(cell)
    );
    const effectiveRows = hasHeader ? dataRows : rows;
    const supabase = getSupabaseAdmin();

    if (kind === "categories") {
      const payload = effectiveRows
        .map((row) => ({
          name: row[0]?.trim(),
          group_name: row[1]?.trim() || null,
          priority: Number(row[2] ?? 1) || 1,
          active: parseBoolean(row[3], true)
        }))
        .filter((row) => row.name);

      const { data: existing } = await supabase.from("business_categories").select("name, group_name");
      const existingKeys = new Set(
        (existing ?? []).map((row) => `${String(row.name).toLowerCase()}::${String(row.group_name ?? "").toLowerCase()}`)
      );
      const inserts = payload.filter((row) => !existingKeys.has(`${row.name!.toLowerCase()}::${String(row.group_name ?? "").toLowerCase()}`));

      if (inserts.length > 0) {
        const { error } = await supabase.from("business_categories").insert(inserts);
        if (error) {
          throw new Error(error.message);
        }
      }

      revalidatePath("/search-terms/generator");
      return NextResponse.json({ message: `${inserts.length} categories imported.` });
    }

    if (kind === "locations") {
      const payload = effectiveRows
        .map((row) => ({
          name: row[0]?.trim(),
          province: row[1]?.trim() || null,
          country: row[2]?.trim() || "South Africa",
          location_type: row[3]?.trim() || null,
          active: parseBoolean(row[4], true)
        }))
        .filter((row) => row.name);

      const { data: existing } = await supabase.from("locations").select("name, province, country");
      const existingKeys = new Set(
        (existing ?? []).map(
          (row) =>
            `${String(row.name).toLowerCase()}::${String(row.province ?? "").toLowerCase()}::${String(row.country ?? "").toLowerCase()}`
        )
      );
      const inserts = payload.filter(
        (row) =>
          !existingKeys.has(
            `${row.name!.toLowerCase()}::${String(row.province ?? "").toLowerCase()}::${row.country.toLowerCase()}`
          )
      );

      if (inserts.length > 0) {
        const { error } = await supabase.from("locations").insert(inserts);
        if (error) {
          throw new Error(error.message);
        }
      }

      revalidatePath("/search-terms/generator");
      return NextResponse.json({ message: `${inserts.length} locations imported.` });
    }

    const payload = effectiveRows
      .map((row) => ({
        pattern: row[0]?.trim(),
        active: parseBoolean(row[1], true)
      }))
      .filter((row) => row.pattern);

    const { data: existing } = await supabase.from("term_patterns").select("pattern");
    const existingKeys = new Set((existing ?? []).map((row) => String(row.pattern).toLowerCase()));
    const inserts = payload.filter((row) => !existingKeys.has(row.pattern!.toLowerCase()));

    if (inserts.length > 0) {
      const { error } = await supabase.from("term_patterns").insert(inserts);
      if (error) {
        throw new Error(error.message);
      }
    }

    revalidatePath("/search-terms/generator");
    return NextResponse.json({ message: `${inserts.length} patterns imported.` });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to import CSV." },
      { status: 500 }
    );
  }
}
