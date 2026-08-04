// "use client";

// import { useEffect, useMemo, useState } from "react";
// import { signOut } from "next-auth/react";

// const CHECKPOINTS = ["Pre-Tournament", "After Round 1", "After Round 2", "After Round 3"];

// function normalizeName(n) {
//   if (!n) return "";
//   if (n.includes(",")) {
//     const [last, first] = n.split(",", 2);
//     return `${(first || "").trim()} ${(last || "").trim()}`.toLowerCase();
//   }
//   return n.toLowerCase();
// }

// function isTournamentLiveET() {
//   const now = new Date();
//   const et = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }));
//   const day = et.getDay(); // 0=Sun ... 4=Thu, 5=Fri, 6=Sat
//   const hour = et.getHours();
//   const isTournamentDay = [4, 5, 6, 0].includes(day); // Thu-Sun
//   const isPlayingHours = hour >= 8 && hour < 20;
//   return isTournamentDay && isPlayingHours;
// }

// function adjustProbability(baseP, sgTotal, thru) {
//   if (sgTotal == null || thru == null || thru === 0) return baseP;
//   const holesWeight = Math.min(thru / 18, 1.0);
//   const ADJUSTMENT_FACTOR = 0.03;
//   const adjustment = sgTotal * ADJUSTMENT_FACTOR * holesWeight;
//   const adjusted = baseP * (1 + adjustment);
//   return Math.round(Math.min(Math.max(adjusted, 0), 1) * 10000) / 10000;
// }

// export default function Home() {
//   const [checkpoint, setCheckpoint] = useState("Pre-Tournament");
//   const [preds, setPreds] = useState(null);
//   const [liveRows, setLiveRows] = useState([]);
//   const [liveEventName, setLiveEventName] = useState("");
//   const [liveOk, setLiveOk] = useState(false);
//   const [oddsRows, setOddsRows] = useState([]);
//   const [oddsEventName, setOddsEventName] = useState("");
//   const [oddsOk, setOddsOk] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [nowEt, setNowEt] = useState("");
//   const liveNow = useMemo(() => isTournamentLiveET(), []);

//   useEffect(() => {
//     setNowEt(
//       new Date().toLocaleTimeString("en-US", { timeZone: "America/New_York", hour12: false })
//     );
//     const t = setInterval(() => {
//       setNowEt(new Date().toLocaleTimeString("en-US", { timeZone: "America/New_York", hour12: false }));
//     }, 1000);
//     return () => clearInterval(t);
//   }, []);

//   useEffect(() => {
//     let cancelled = false;
//     setLoading(true);
//     setError(null);

//     async function load() {
//       try {
//         const [predsRes, liveRes, oddsRes] = await Promise.all([
//           fetch(`/api/predictions?checkpoint=${encodeURIComponent(checkpoint)}`).then((r) => r.json()),
//           fetch("/api/live-stats").then((r) => r.json()),
//           fetch("/api/odds").then((r) => r.json()),
//         ]);
//         if (cancelled) return;

//         if (predsRes.error) throw new Error(predsRes.error);
//         setPreds(predsRes.rows);

//         setLiveRows(liveRes.rows || []);
//         setLiveEventName(liveRes.event_name || "");

//         setOddsRows(oddsRes.rows || []);
//         setOddsEventName(oddsRes.event_name || "");
//       } catch (e) {
//         if (!cancelled) setError(String(e.message || e));
//       } finally {
//         if (!cancelled) setLoading(false);
//       }
//     }

//     load();
//     return () => {
//       cancelled = true;
//     };
//   }, [checkpoint]);

//   // Determine tournament name/year, same fallback logic as Streamlit version
//   const { tournament, year } = useMemo(() => {
//     if (preds && preds.length > 0 && preds[0].tournament) {
//       return { tournament: preds[0].tournament, year: preds[0].year };
//     }
//     return { tournament: liveEventName || "Current Tournament", year: new Date().getFullYear() };
//   }, [preds, liveEventName]);

//   const liveMatches = liveEventName && liveEventName === tournament;
//   const oddsMatches = oddsEventName && oddsEventName === tournament;

//   // Merge predictions with live stats + odds by normalized player name
//   const tableRows = useMemo(() => {
//     if (!preds) return [];

//     const liveByName = {};
//     if (liveMatches) {
//       for (const r of liveRows) liveByName[normalizeName(r.player_name)] = r;
//     }
//     const oddsByName = {};
//     if (oddsMatches) {
//       for (const r of oddsRows) oddsByName[normalizeName(r.player_name)] = r;
//     }

//     const merged = preds.map((row) => {
//       const key = normalizeName(row.player_name);
//       const live = liveByName[key];
//       const odds = oddsByName[key];

//       const sgTotal = live ? live.sg_total : null;
//       const thru = live ? live.thru : null;
//       const adjustedP = adjustProbability(row.p, sgTotal, thru);

//       const modelPct = Math.round(row.p * 1000) / 10;
//       const adjustedPct = Math.round(adjustedP * 1000) / 10;
//       const bookPct = odds && odds.avg_book_prob != null ? Math.round(odds.avg_book_prob * 1000) / 10 : null;
//       const edge = bookPct != null ? Math.round((adjustedPct - bookPct) * 10) / 10 : null;

//       return {
//         rank: row.rank,
//         player: row.player_name,
//         modelPct,
//         adjustedPct,
//         bookPct,
//         edge,
//         position: live ? live.position : null,
//         sgTotal: live ? live.sg_total : null,
//         thru: live ? live.thru : null,
//         cumSgTotal: row.cum_sg_total,
//         cumStrokesBack: row.cum_strokes_back,
//         p: row.p,
//       };
//     });

//     return merged.sort((a, b) => b.p - a.p);
//   }, [preds, liveRows, oddsRows, liveMatches, oddsMatches]);

//   function edgeSignal(edge) {
//     if (edge == null) return { text: "—", color: "#888" };
//     if (edge > 5) return { text: `+${edge.toFixed(1)}%`, color: "#3fb950" };
//     if (edge > 0) return { text: `+${edge.toFixed(1)}%`, color: "#d29922" };
//     return { text: `${edge.toFixed(1)}%`, color: "#f85149" };
//   }

//   return (
//     <main style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 16px" }}>
//       <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
//         <h1 style={{ fontSize: 28 }}>⛳ Fairway Edge Predictions</h1>
//         <button
//           onClick={() => signOut({ callbackUrl: "/login" })}
//           style={{ padding: "8px 14px", borderRadius: 6, border: "1px solid #30363d", background: "#21262d", color: "#fff", cursor: "pointer" }}
//         >
//           Log out
//         </button>
//       </div>

//       <div style={{ display: "flex", gap: 8, margin: "16px 0" }}>
//         {CHECKPOINTS.map((label) => (
//           <button
//             key={label}
//             onClick={() => setCheckpoint(label)}
//             style={{
//               flex: 1,
//               padding: "10px 12px",
//               borderRadius: 6,
//               border: "1px solid #333",
//               background: checkpoint === label ? "#ff4b4b" : "#262730",
//               color: "#fff",
//               cursor: "pointer",
//               fontWeight: checkpoint === label ? 600 : 400,
//             }}
//           >
//             {label}
//           </button>
//         ))}
//       </div>

//       <div style={{ color: liveNow ? "#3fb950" : "#888", marginBottom: 8 }}>
//         {liveNow ? "🟢 Live" : "🔴 No active round"} | {nowEt} ET
//       </div>

//       {error && <div style={{ color: "#f85149", marginBottom: 16 }}>Error: {error}</div>}
//       {loading && <div style={{ color: "#888" }}>Loading...</div>}

//       {!loading && !error && preds === null && (
//         <div style={{ color: "#f85149" }}>No &lsquo;{checkpoint}&rsquo; predictions found in S3.</div>
//       )}

//       {!loading && !error && preds !== null && (
//         <>
//           <h2 style={{ fontSize: 20, marginTop: 24 }}>
//             {tournament} {year} — {checkpoint}
//           </h2>

//           {!oddsMatches && oddsEventName && oddsEventName !== tournament && (
//             <div style={infoBoxStyle}>
//               Odds board is still showing &lsquo;{oddsEventName}&rsquo; — not open yet for {tournament}.
//             </div>
//           )}
//           {!liveMatches && (
//             <div style={infoBoxStyle}>
//               {liveEventName && liveEventName !== tournament
//                 ? `Live stats are for '${liveEventName}' — ${tournament} hasn't teed off yet.`
//                 : `${tournament} hasn't started yet — live position/SG will appear once round 1 tees off.`}
//             </div>
//           )}

//           <h3 style={{ marginTop: 24 }}>Top 10 model picks — {checkpoint}</h3>
//           <div style={{ overflowX: "auto" }}>
//             <table style={tableStyle}>
//               <thead>
//                 <tr>
//                   {["Rank", "Player", "Model %", "Live adj %", "Book %", "Edge", "Pos", "SG", "Thru", "R1 SG", "Back"].map((h) => (
//                     <th key={h} style={thStyle}>{h}</th>
//                   ))}
//                 </tr>
//               </thead>
//               <tbody>
//                 {tableRows.map((row, i) => {
//                   const sig = edgeSignal(row.edge);
//                   return (
//                     <tr key={i}>
//                       <td style={tdStyle}>{row.rank}</td>
//                       <td style={tdStyle}>{row.player}</td>
//                       <td style={tdStyle}>{row.modelPct}%</td>
//                       <td style={tdStyle}>{liveMatches ? `${row.adjustedPct}%` : "—"}</td>
//                       <td style={tdStyle}>{row.bookPct != null ? `${row.bookPct.toFixed(1)}%` : "—"}</td>
//                       <td style={{ ...tdStyle, color: sig.color, fontWeight: 600 }}>{sig.text}</td>
//                       <td style={tdStyle}>{liveMatches ? (row.position || "—") : "—"}</td>
//                       <td style={tdStyle}>{liveMatches && row.sgTotal != null ? row.sgTotal.toFixed(2) : "—"}</td>
//                       <td style={tdStyle}>{liveMatches && row.thru ? row.thru : "—"}</td>
//                       <td style={tdStyle}>{row.cumSgTotal != null ? Number(row.cumSgTotal).toFixed(2) : "—"}</td>
//                       <td style={tdStyle}>{row.cumStrokesBack != null ? Number(row.cumStrokesBack).toFixed(1) : "—"}</td>
//                     </tr>
//                   );
//                 })}
//               </tbody>
//             </table>
//           </div>

//           {liveMatches && liveRows.length > 0 && (
//             <>
//               <h3 style={{ marginTop: 32 }}>Live leaderboard</h3>
//               <div style={{ overflowX: "auto" }}>
//                 <table style={tableStyle}>
//                   <thead>
//                     <tr>
//                       {["Pos", "Player", "Score", "Thru", "SG Total", "SG App", "SG OTT", "SG Putt"].map((h) => (
//                         <th key={h} style={thStyle}>{h}</th>
//                       ))}
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {liveRows.map((r, i) => (
//                       <tr key={i}>
//                         <td style={tdStyle}>{r.position}</td>
//                         <td style={tdStyle}>{r.player_name}</td>
//                         <td style={tdStyle}>{r.total}</td>
//                         <td style={tdStyle}>{r.thru}</td>
//                         <td style={tdStyle}>{r.sg_total?.toFixed?.(2) ?? "—"}</td>
//                         <td style={tdStyle}>{r.sg_app?.toFixed?.(2) ?? "—"}</td>
//                         <td style={tdStyle}>{r.sg_ott?.toFixed?.(2) ?? "—"}</td>
//                         <td style={tdStyle}>{r.sg_putt?.toFixed?.(2) ?? "—"}</td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </>
//           )}
//         </>
//       )}
//     </main>
//   );
// }

// const infoBoxStyle = {
//   background: "#1c2128",
//   border: "1px solid #30363d",
//   borderRadius: 6,
//   padding: "10px 14px",
//   margin: "8px 0",
//   fontSize: 14,
// };

// const tableStyle = { width: "100%", borderCollapse: "collapse", fontSize: 14 };
// const thStyle = { textAlign: "left", padding: "8px 10px", borderBottom: "2px solid #30363d", color: "#8b949e" };
// const tdStyle = { padding: "8px 10px", borderBottom: "1px solid #21262d" };


"use client";

import { useEffect, useMemo, useState } from "react";
import { signOut } from "next-auth/react";

const CHECKPOINTS = ["Pre-Tournament", "After Round 1", "After Round 2", "After Round 3"];

// Maps the UI labels to the URL slugs your Lambda's API expects.
const CHECKPOINT_SLUGS = {
  "Pre-Tournament": "pretournament",
  "After Round 1": "round1",
  "After Round 2": "round2",
  "After Round 3": "round3",
};

// Base URL for your predictions microservice (Lambda + API Gateway).
// Set NEXT_PUBLIC_PREDICTIONS_API_URL in .env.local / Vercel env vars.
const PREDICTIONS_API_BASE = process.env.NEXT_PUBLIC_PREDICTIONS_API_URL;

function normalizeName(n) {
  if (!n) return "";
  if (n.includes(",")) {
    const [last, first] = n.split(",", 2);
    return `${(first || "").trim()} ${(last || "").trim()}`.toLowerCase();
  }
  return n.toLowerCase();
}

function isTournamentLiveET() {
  const now = new Date();
  const et = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }));
  const day = et.getDay(); // 0=Sun ... 4=Thu, 5=Fri, 6=Sat
  const hour = et.getHours();
  const isTournamentDay = [4, 5, 6, 0].includes(day); // Thu-Sun
  const isPlayingHours = hour >= 8 && hour < 20;
  return isTournamentDay && isPlayingHours;
}

function adjustProbability(baseP, sgTotal, thru) {
  if (sgTotal == null || thru == null || thru === 0) return baseP;
  const holesWeight = Math.min(thru / 18, 1.0);
  const ADJUSTMENT_FACTOR = 0.03;
  const adjustment = sgTotal * ADJUSTMENT_FACTOR * holesWeight;
  const adjusted = baseP * (1 + adjustment);
  return Math.round(Math.min(Math.max(adjusted, 0), 1) * 10000) / 10000;
}

export default function Home() {
  const [checkpoint, setCheckpoint] = useState("Pre-Tournament");
  const [preds, setPreds] = useState(null);
  const [liveRows, setLiveRows] = useState([]);
  const [liveEventName, setLiveEventName] = useState("");
  const [liveOk, setLiveOk] = useState(false);
  const [oddsRows, setOddsRows] = useState([]);
  const [oddsEventName, setOddsEventName] = useState("");
  const [oddsOk, setOddsOk] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [nowEt, setNowEt] = useState("");
  const liveNow = useMemo(() => isTournamentLiveET(), []);

  useEffect(() => {
    setNowEt(
      new Date().toLocaleTimeString("en-US", { timeZone: "America/New_York", hour12: false })
    );
    const t = setInterval(() => {
      setNowEt(new Date().toLocaleTimeString("en-US", { timeZone: "America/New_York", hour12: false }));
    }, 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    async function load() {
      try {
        const [predsRes, liveRes, oddsRes] = await Promise.all([
          fetch(`${PREDICTIONS_API_BASE}/predictions/${CHECKPOINT_SLUGS[checkpoint]}`).then((r) => r.json()),
          fetch("/api/live-stats").then((r) => r.json()),
          fetch("/api/odds").then((r) => r.json()),
        ]);
        if (cancelled) return;

        if (predsRes.error) throw new Error(predsRes.error);
        setPreds(predsRes.rows);

        setLiveRows(liveRes.rows || []);
        setLiveEventName(liveRes.event_name || "");

        setOddsRows(oddsRes.rows || []);
        setOddsEventName(oddsRes.event_name || "");
      } catch (e) {
        if (!cancelled) setError(String(e.message || e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [checkpoint]);

  // Determine tournament name/year, same fallback logic as Streamlit version
  const { tournament, year } = useMemo(() => {
    if (preds && preds.length > 0 && preds[0].tournament) {
      return { tournament: preds[0].tournament, year: preds[0].year };
    }
    return { tournament: liveEventName || "Current Tournament", year: new Date().getFullYear() };
  }, [preds, liveEventName]);

  const liveMatches = liveEventName && liveEventName === tournament;
  const oddsMatches = oddsEventName && oddsEventName === tournament;

  // Merge predictions with live stats + odds by normalized player name
  const tableRows = useMemo(() => {
    if (!preds) return [];

    const liveByName = {};
    if (liveMatches) {
      for (const r of liveRows) liveByName[normalizeName(r.player_name)] = r;
    }
    const oddsByName = {};
    if (oddsMatches) {
      for (const r of oddsRows) oddsByName[normalizeName(r.player_name)] = r;
    }

    const merged = preds.map((row) => {
      const key = normalizeName(row.player_name);
      const live = liveByName[key];
      const odds = oddsByName[key];

      const sgTotal = live ? live.sg_total : null;
      const thru = live ? live.thru : null;
      const adjustedP = adjustProbability(row.p, sgTotal, thru);

      const modelPct = Math.round(row.p * 1000) / 10;
      const adjustedPct = Math.round(adjustedP * 1000) / 10;
      const bookPct = odds && odds.avg_book_prob != null ? Math.round(odds.avg_book_prob * 1000) / 10 : null;
      const edge = bookPct != null ? Math.round((adjustedPct - bookPct) * 10) / 10 : null;

      return {
        rank: row.rank,
        player: row.player_name,
        modelPct,
        adjustedPct,
        bookPct,
        edge,
        position: live ? live.position : null,
        sgTotal: live ? live.sg_total : null,
        thru: live ? live.thru : null,
        cumSgTotal: row.cum_sg_total,
        cumStrokesBack: row.cum_strokes_back,
        p: row.p,
      };
    });

    return merged.sort((a, b) => b.p - a.p);
  }, [preds, liveRows, oddsRows, liveMatches, oddsMatches]);

  function edgeSignal(edge) {
    if (edge == null) return { text: "—", color: "#888" };
    if (edge > 5) return { text: `+${edge.toFixed(1)}%`, color: "#3fb950" };
    if (edge > 0) return { text: `+${edge.toFixed(1)}%`, color: "#d29922" };
    return { text: `${edge.toFixed(1)}%`, color: "#f85149" };
  }

  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ fontSize: 28 }}>⛳ Fairway Edge Predictions</h1>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          style={{ padding: "8px 14px", borderRadius: 6, border: "1px solid #30363d", background: "#21262d", color: "#fff", cursor: "pointer" }}
        >
          Log out
        </button>
      </div>

      <div style={{ display: "flex", gap: 8, margin: "16px 0" }}>
        {CHECKPOINTS.map((label) => (
          <button
            key={label}
            onClick={() => setCheckpoint(label)}
            style={{
              flex: 1,
              padding: "10px 12px",
              borderRadius: 6,
              border: "1px solid #333",
              background: checkpoint === label ? "#ff4b4b" : "#262730",
              color: "#fff",
              cursor: "pointer",
              fontWeight: checkpoint === label ? 600 : 400,
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <div style={{ color: liveNow ? "#3fb950" : "#888", marginBottom: 8 }}>
        {liveNow ? "🟢 Live" : "🔴 No active round"} | {nowEt} ET
      </div>

      {error && <div style={{ color: "#f85149", marginBottom: 16 }}>Error: {error}</div>}
      {loading && <div style={{ color: "#888" }}>Loading...</div>}

      {!loading && !error && preds === null && (
        <div style={{ color: "#f85149" }}>No &lsquo;{checkpoint}&rsquo; predictions found in S3.</div>
      )}

      {!loading && !error && preds !== null && (
        <>
          <h2 style={{ fontSize: 20, marginTop: 24 }}>
            {tournament} {year} — {checkpoint}
          </h2>

          {!oddsMatches && oddsEventName && oddsEventName !== tournament && (
            <div style={infoBoxStyle}>
              Odds board is still showing &lsquo;{oddsEventName}&rsquo; — not open yet for {tournament}.
            </div>
          )}
          {!liveMatches && (
            <div style={infoBoxStyle}>
              {liveEventName && liveEventName !== tournament
                ? `Live stats are for '${tournament}' — ${liveEventName} hasn't teed off yet.`
                : `${tournament} hasn't started yet — live position/SG will appear once round 1 tees off.`}
            </div>
          )}

          <h3 style={{ marginTop: 24 }}>Top 10 model picks — {checkpoint}</h3>
          <div style={{ overflowX: "auto" }}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  {["Rank", "Player", "Model %", "Live adj %", "Book %", "Edge", "Pos", "SG", "Thru", "R1 SG", "Back"].map((h) => (
                    <th key={h} style={thStyle}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableRows.map((row, i) => {
                  const sig = edgeSignal(row.edge);
                  return (
                    <tr key={i}>
                      <td style={tdStyle}>{row.rank}</td>
                      <td style={tdStyle}>{row.player}</td>
                      <td style={tdStyle}>{row.modelPct}%</td>
                      <td style={tdStyle}>{liveMatches ? `${row.adjustedPct}%` : "—"}</td>
                      <td style={tdStyle}>{row.bookPct != null ? `${row.bookPct.toFixed(1)}%` : "—"}</td>
                      <td style={{ ...tdStyle, color: sig.color, fontWeight: 600 }}>{sig.text}</td>
                      <td style={tdStyle}>{liveMatches ? (row.position || "—") : "—"}</td>
                      <td style={tdStyle}>{liveMatches && row.sgTotal != null ? row.sgTotal.toFixed(2) : "—"}</td>
                      <td style={tdStyle}>{liveMatches && row.thru ? row.thru : "—"}</td>
                      <td style={tdStyle}>{row.cumSgTotal != null ? Number(row.cumSgTotal).toFixed(2) : "—"}</td>
                      <td style={tdStyle}>{row.cumStrokesBack != null ? Number(row.cumStrokesBack).toFixed(1) : "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {liveMatches && liveRows.length > 0 && (
            <>
              <h3 style={{ marginTop: 32 }}>Live leaderboard</h3>
              <div style={{ overflowX: "auto" }}>
                <table style={tableStyle}>
                  <thead>
                    <tr>
                      {["Pos", "Player", "Score", "Thru", "SG Total", "SG App", "SG OTT", "SG Putt"].map((h) => (
                        <th key={h} style={thStyle}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {liveRows.map((r, i) => (
                      <tr key={i}>
                        <td style={tdStyle}>{r.position}</td>
                        <td style={tdStyle}>{r.player_name}</td>
                        <td style={tdStyle}>{r.total}</td>
                        <td style={tdStyle}>{r.thru}</td>
                        <td style={tdStyle}>{r.sg_total?.toFixed?.(2) ?? "—"}</td>
                        <td style={tdStyle}>{r.sg_app?.toFixed?.(2) ?? "—"}</td>
                        <td style={tdStyle}>{r.sg_ott?.toFixed?.(2) ?? "—"}</td>
                        <td style={tdStyle}>{r.sg_putt?.toFixed?.(2) ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </>
      )}
    </main>
  );
}

const infoBoxStyle = {
  background: "#1c2128",
  border: "1px solid #30363d",
  borderRadius: 6,
  padding: "10px 14px",
  margin: "8px 0",
  fontSize: 14,
};

const tableStyle = { width: "100%", borderCollapse: "collapse", fontSize: 14 };
const thStyle = { textAlign: "left", padding: "8px 10px", borderBottom: "2px solid #30363d", color: "#8b949e" };
const tdStyle = { padding: "8px 10px", borderBottom: "1px solid #21262d" };
