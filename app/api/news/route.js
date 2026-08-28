import { NextResponse } from "next/server";

export const runtime = "nodejs";

// Cache for 1 hour -- NewsAPI's free tier caps you at 100 requests/day,
// so this keeps you well under that even with real traffic, since every
// visitor within the same hour shares one cached response.
export const revalidate = 3600;

export async function GET() {
  const apiKey = process.env.NEWSAPI_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Missing NEWSAPI_KEY environment variable." }, { status: 500 });
  }

  // NewsAPI's free tier blocks direct browser calls (CORS) and requires
  // requests to come from a server -- this route is that server.
  const url = `https://newsapi.org/v2/everything?q=%22PGA%20Tour%22&language=en&sortBy=publishedAt&pageSize=9&apiKey=${apiKey}`;

  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));  
      return NextResponse.json(
        { error: body.message || `NewsAPI returned ${res.status}` },
        { status: res.status }
      );
    }
    const data = await res.json();

    const articles = (data.articles || [])
      .filter((a) => a.title && a.title !== "[Removed]")
      .map((a) => ({
        title: a.title,
        description: a.description,
        url: a.url,
        image: a.urlToImage,
        source: a.source?.name || "",
        publishedAt: a.publishedAt,
      }));

    return NextResponse.json({ articles });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}