import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { defaultBatchSize?: number; defaultDelayMs?: number };
    const supabase = getSupabaseAdmin();

    const { error } = await supabase.from("app_settings").upsert({
      id: 1,
      default_batch_size: Math.min(Math.max(body.defaultBatchSize ?? 5, 1), 20),
      default_delay_ms: Math.max(body.defaultDelayMs ?? 1000, 0)
    });

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath("/settings");
    revalidatePath("/run-search");

    return NextResponse.json({ message: "Settings updated." });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to save settings." },
      { status: 500 }
    );
  }
}
