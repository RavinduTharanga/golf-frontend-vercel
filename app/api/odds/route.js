import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  const key = process.env.DATAGOLF_KEY;
  const url = `https://feeds.datagolf.com/betting-tools/outrights?tour=pga&market=top_10&odds_format=percent&file_format=json&key=${key}`;

  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      return NextResponse.json({ error: `DataGolf returned ${res.status}` }, { status: 502 });
    }
    const data = await res.json();
    const books = data.books_offering || [];

    const rows = (data.odds || []).map((p) => {
      const probs = books
        .map((b) => p[b])
        .filter((v) => v !== null && v !== undefined)
        .map(Number)
        .filter((v) => !Number.isNaN(v));
      const avg = probs.length ? probs.reduce((a, b) => a + b, 0) / probs.length : null;
      return { player_name: p.player_name || "", avg_book_prob: avg };
    });

    return NextResponse.json({ rows, event_name: data.event_name || "" });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
