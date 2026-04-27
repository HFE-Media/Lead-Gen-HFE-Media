import { NextResponse } from "next/server";
import { runSearchBatch } from "@/lib/run-search";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { batchSize?: number; delayMs?: number };
    const batchSize = Math.min(Math.max(body.batchSize ?? 5, 1), 20);
    const delayMs = Math.max(body.delayMs ?? 1000, 0);
    const result = await runSearchBatch(batchSize, delayMs);

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to run search batch." },
      { status: 500 }
    );
  }
}
