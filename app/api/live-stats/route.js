import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  const key = process.env.DATAGOLF_KEY;
  const url = `https://feeds.datagolf.com/preds/live-tournament-stats?stats=sg_total,sg_app,sg_ott,sg_putt&round=event_cumulative&display=value&file_format=json&key=${key}`;

  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      return NextResponse.json({ error: `DataGolf returned ${res.status}` }, { status: 502 });
    }
    const data = await res.json();

    const rows = (data.live_stats || []).map((p) => ({
      player_name: p.player_name || "",
      position: p.position ?? "-",
      total: p.total ?? null,
      thru: p.thru ?? 0,
      sg_total: p.sg_total ?? null,
      sg_app: p.sg_app ?? null,
      sg_ott: p.sg_ott ?? null,
      sg_putt: p.sg_putt ?? null,
    }));

    return NextResponse.json({ rows, event_name: data.event_name || "" });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
