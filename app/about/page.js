export const metadata = {
  title: "About - Fairway Edge",
};

export default function AboutPage() {
  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: "40px 16px", lineHeight: 1.7 }}>
      <h1 style={{ fontSize: 30, marginBottom: 24 }}>About Fairway Edge</h1>

      <p>
        Fairway Edge predicts which players are most likely to finish in the top 10 at each
        PGA Tour event. Predictions update at three points during a tournament: before play
        begins, and again after each completed round, so the picks reflect how the field is
        actually performing that week.
      </p>

      <h2 style={sectionHeading}>How the predictions work</h2>
      <p>
        The model is trained on player-level strokes-gained data going back to 2004,
        covering career form, course history, and recent performance trends. Once a round
        finishes, that round&rsquo;s live results are folded in as additional features, so
        later-round predictions account for how players are actually scoring that week, not
        just their history coming in.
      </p>

      <h2 style={sectionHeading}>What&rsquo;s free vs. subscriber-only</h2>
      <p>
        Pre-tournament predictions are free for any signed-in user. Round-by-round
        predictions, updated live as each round completes, are available with a
        subscription.
      </p>

      <h2 style={sectionHeading}>News</h2>
      <p>
        The homepage also aggregates recent PGA Tour news headlines from third-party news
        sources, for convenience alongside the predictions.
      </p>

      <h2 style={sectionHeading}>Disclaimer</h2>
      <p style={{ color: "#8b949e", fontSize: 14 }}>
        Predictions are statistical estimates based on historical and current-week data.
        They are not guaranteed outcomes and should not be treated as financial or betting
        advice.
      </p>
    </main>
  );
}

const sectionHeading = { fontSize: 20, marginTop: 28, marginBottom: 8 };