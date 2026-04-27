import { getLeads } from "@/lib/data";
import { toCsvRow } from "@/lib/utils";

export async function GET() {
  const leads = await getLeads();
  const header = toCsvRow([
    "name",
    "formatted_address",
    "formatted_phone_number",
    "website",
    "rating",
    "place_id",
    "source_term",
    "created_at"
  ]);

  const rows = leads.map((lead) =>
    toCsvRow([
      lead.name,
      lead.formatted_address,
      lead.formatted_phone_number,
      lead.website,
      lead.rating,
      lead.place_id,
      lead.source_term,
      lead.created_at
    ])
  );

  const csv = [header, ...rows].join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="hfe-media-leads.csv"`
    }
  });
}
