"use client";

import { useEffect } from "react";

/**
 * Google AdSense ad unit.
 *
 * BEFORE THIS WORKS, you need:
 * 1. An approved Google AdSense account (adsense.google.com) -- ads
 *    won't actually show until Google reviews and approves your site.
 * 2. Your Publisher ID (looks like "ca-pub-1234567890123456") --
 *    replace NEXT_PUBLIC_ADSENSE_CLIENT_ID below.
 * 3. An ad unit created in your AdSense dashboard, giving you a
 *    "data-ad-slot" ID -- pass it as the `slot` prop.
 *
 * Until then, this renders nothing (or you can swap in a placeholder
 * box for layout testing -- see the commented fallback below).
 */
export default function AdUnit({ slot, style }) {
  const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

  useEffect(() => {
    if (!clientId) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      // AdSense script may not have loaded yet on first render -- safe to ignore.
    }
  }, [clientId]);

  if (!clientId) {
    // Layout placeholder so you can see where the ad will sit before
    // AdSense is approved. Remove this block once real ads are live.
    return (
      <div
        style={{
          ...style,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#161b22",
          border: "1px dashed #30363d",
          color: "#8b949e",
          fontSize: 13,
          minHeight: 100,
        }}
      >
        Ad placeholder (set NEXT_PUBLIC_ADSENSE_CLIENT_ID once AdSense is approved)
      </div>
    );
  }

  return (
    <ins
      className="adsbygoogle"
      style={{ display: "block", ...style }}
      data-ad-client={clientId}
      data-ad-slot={slot}
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  );
}