import { NextResponse } from "next/server";
import { findLatestKey, fetchCsvAsRows, CHECKPOINT_CONFIG } from "@/lib/s3";

export const runtime = "nodejs";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const checkpoint = searchParams.get("checkpoint") || "Pre-Tournament";

  const config = CHECKPOINT_CONFIG[checkpoint];
  if (!config) {
    return NextResponse.json({ error: `Unknown checkpoint: ${checkpoint}` }, { status: 400 });
  }

  try {
    const key = await findLatestKey(config.prefix, config.matcher);
    if (!key) {
      return NextResponse.json({ rows: null, key: null });
    }

    let rows = await fetchCsvAsRows(key);

    if (rows.length > 0 && "category" in rows[0]) {
      rows = rows.filter((r) => r.category === "Top10");
    }

    // Safety net: enforce top-10-by-probability regardless of how many
    // rows the source file actually has (same fix as the Streamlit app).
    if (rows.length > 0 && "p" in rows[0]) {
      rows = [...rows].sort((a, b) => (b.p ?? 0) - (a.p ?? 0)).slice(0, 10);
    }

    return NextResponse.json({ rows, key });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
