"use client";

import { useEffect, useState } from "react";
import AdUnit from "@/components/AdUnit";
import NewsSlider from "@/components/NewsSlider";

export default function HomePage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("/api/news")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setArticles(data.articles || []);
      })
      .catch((e) => setError(String(e.message || e)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 16px" }}>
      <section style={{ textAlign: "center", marginBottom: 32 }}>
        <h1 style={{ fontSize: 32, marginBottom: 8 }}>⛳ Fairway Edge</h1>
        <p style={{ color: "#8b949e", fontSize: 16 }}>
          Data-driven top-10 predictions for every PGA Tour event, updated after each round.
        </p>
      </section>

      {!loading && !error && <NewsSlider articles={articles} />}

      {/* Top ad placement */}
      <AdUnit slot="1111111111" style={{ marginBottom: 32 }} />

      <h2 style={{ fontSize: 22, marginBottom: 16 }}>Latest PGA Tour News</h2>

      {loading && <div style={{ color: "#8b949e" }}>Loading news...</div>}
      {error && <div style={{ color: "#f85149" }}>Couldn&rsquo;t load news: {error}</div>}

      <div style={gridStyle}>
        {articles.map((a, i) => (
          <a key={i} href={a.url} target="_blank" rel="noopener noreferrer" style={cardLinkStyle}>
            <article style={cardStyle}>
              {a.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={a.image} alt={a.title} style={imgStyle} />
              )}
              <div style={{ padding: 14 }}>
                <div style={{ fontSize: 12, color: "#8b949e", marginBottom: 6 }}>
                  {a.source} {a.publishedAt ? `· ${new Date(a.publishedAt).toLocaleDateString()}` : ""}
                </div>
                <h3 style={{ fontSize: 15, margin: 0, lineHeight: 1.3 }}>{a.title}</h3>
              </div>
            </article>
          </a>
        ))}
      </div>

      {/* Bottom ad placement */}
      <AdUnit slot="2222222222" style={{ marginTop: 32 }} />
    </main>
  );
}

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
  gap: 16,
};
const cardLinkStyle = { textDecoration: "none", color: "inherit" };
const cardStyle = {
  background: "#161b22",
  border: "1px solid #30363d",
  borderRadius: 8,
  overflow: "hidden",
  height: "100%",
};
const imgStyle = { width: "100%", height: 150, objectFit: "cover", display: "block" };