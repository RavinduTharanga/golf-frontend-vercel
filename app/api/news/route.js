import { NextResponse } from "next/server";

export const runtime = "nodejs";

// ESPN's site API is undocumented and unauthenticated -- no key needed,
// but it's also unversioned, so cache modestly to avoid hammering it
// and to stay resilient if it briefly changes shape.
export const revalidate = 300;

const ESPN_NEWS_URL = "https://site.web.api.espn.com/apis/site/v2/sports/golf/pga/news";

export async function GET() {
  try {
    const res = await fetch(ESPN_NEWS_URL, {
      headers: { "User-Agent": "Mozilla/5.0" },
      next: { revalidate: 300 },
    });
    if (!res.ok) {
      return NextResponse.json({ error: `ESPN API returned ${res.status}` }, { status: res.status });
    }
    const data = await res.json();

    const articles = (data.articles || [])
      .filter((a) => a.headline)
      .map((a) => ({
        title: a.headline,
        description: a.description,
        url: a.links?.web?.href,
        image: a.images?.[0]?.url,
        source: a.byline || "ESPN",
        publishedAt: a.published,
      }));

    return NextResponse.json({ articles });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
