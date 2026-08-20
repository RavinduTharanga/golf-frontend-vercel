"use client";

import { useEffect, useState } from "react";

const SLIDE_DURATION_MS = 6000;

export default function NewsSlider({ articles }) {
  const [index, setIndex] = useState(0);

  // Only feature articles that actually have an image -- a slider with
  // no photo behind it doesn't read as a "featured story."
  const slides = (articles || []).filter((a) => a.image).slice(0, 6);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, SLIDE_DURATION_MS);
    return () => clearInterval(timer);
  }, [slides.length]);

  if (slides.length === 0) return null;

  const current = slides[index];

  return (
    <div style={sliderStyle}>
      <a href={current.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={current.image} alt={current.title} style={imgStyle} />
        <div style={overlayStyle}>
          <div style={{ fontSize: 12, color: "#ffd166", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>
            {current.source}
          </div>
          <h2 style={{ fontSize: 22, color: "#fff", margin: 0, lineHeight: 1.3 }}>{current.title}</h2>
        </div>
      </a>

      <div style={dotsStyle}>
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            aria-label={`Go to slide ${i + 1}`}
            style={{
              ...dotStyle,
              background: i === index ? "#ff4b4b" : "rgba(255,255,255,0.4)",
            }}
          />
        ))}
      </div>
    </div>
  );
}

const sliderStyle = {
  position: "relative",
  borderRadius: 10,
  overflow: "hidden",
  marginBottom: 32,
  background: "#161b22",
};
const imgStyle = {
  width: "100%",
  height: 360,
  objectFit: "cover",
  display: "block",
};
const overlayStyle = {
  position: "absolute",
  bottom: 0,
  left: 0,
  right: 0,
  padding: "40px 24px 20px",
  background: "linear-gradient(to top, rgba(0,0,0,0.85), rgba(0,0,0,0))",
};
const dotsStyle = {
  position: "absolute",
  bottom: 14,
  right: 20,
  display: "flex",
  gap: 6,
};
const dotStyle = {
  width: 8,
  height: 8,
  borderRadius: "50%",
  border: "none",
  cursor: "pointer",
  padding: 0,
};