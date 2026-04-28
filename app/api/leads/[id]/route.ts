import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isCallOutcome, isLeadStatus } from "@/lib/crm";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = (await request.json()) as {
      lead_status?: string;
      call_outcome?: string | null;
      last_call_at?: string | null;
      lead_notes?: string | null;
      follow_up_at?: string | null;
      quoted_amount?: number | null;
      won_value?: number | null;
      assigned_agent?: string | null;
    };

    const updates: Record<string, string | number | null> = {};

    if (typeof body.lead_status === "string") {
      if (!isLeadStatus(body.lead_status)) {
        return NextResponse.json({ error: "Invalid lead status." }, { status: 400 });
      }
      updates.lead_status = body.lead_status;
    }

    if (body.call_outcome !== undefined) {
      if (body.call_outcome !== null && !isCallOutcome(body.call_outcome)) {
        return NextResponse.json({ error: "Invalid call outcome." }, { status: 400 });
      }
      updates.call_outcome = body.call_outcome;
    }

    if (body.last_call_at !== undefined) {
      updates.last_call_at = body.last_call_at;
    }

    if (body.lead_notes !== undefined) {
      updates.lead_notes = body.lead_notes;
    }

    if (body.follow_up_at !== undefined) {
      updates.follow_up_at = body.follow_up_at;
    }

    if (body.quoted_amount !== undefined) {
      updates.quoted_amount = body.quoted_amount;
    }

    if (body.won_value !== undefined) {
      updates.won_value = body.won_value;
    }

    if (body.assigned_agent !== undefined) {
      updates.assigned_agent = body.assigned_agent;
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.from("leads").update(updates).eq("id", params.id).select("*").single();

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath("/");
    revalidatePath("/leads");
    revalidatePath("/call-tracker");

    return NextResponse.json({ lead: data });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update lead." },
      { status: 500 }
    );
  }
}
