"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function ConfirmForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [code, setCode] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Something went wrong.");
      return;
    }

    setSuccess(true);
    setTimeout(() => router.push("/login"), 1500);
  }

  return (
    <main style={pageStyle}>
      <form onSubmit={handleSubmit} style={cardStyle}>
        <h1 style={{ fontSize: 22, marginBottom: 12 }}>⛳ Confirm your email</h1>
        <p style={{ fontSize: 14, color: "#8b949e", marginBottom: 16 }}>
          Enter the confirmation code we emailed to you.
        </p>

        {success ? (
          <div style={{ color: "#3fb950" }}>Confirmed — redirecting to login...</div>
        ) : (
          <>
            <label style={labelStyle}>Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
            />

            <label style={labelStyle}>Confirmation code</label>
            <input
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              style={inputStyle}
            />

            {error && <div style={errorStyle}>{error}</div>}

            <button type="submit" disabled={loading} style={buttonStyle}>
              {loading ? "Confirming..." : "Confirm"}
            </button>
          </>
        )}
      </form>
    </main>
  );
}

export default function ConfirmPage() {
  return (
    <Suspense fallback={null}>
      <ConfirmForm />
    </Suspense>
  );
}

const pageStyle = { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, fontFamily: "system-ui, sans-serif", background: "#0e1117", color: "#fafafa" };
const cardStyle = { width: 360, background: "#161b22", border: "1px solid #30363d", borderRadius: 8, padding: 28 };
const labelStyle = { display: "block", fontSize: 13, color: "#8b949e", marginTop: 14, marginBottom: 4 };
const inputStyle = { width: "100%", padding: "8px 10px", borderRadius: 6, border: "1px solid #30363d", background: "#0d1117", color: "#fff", boxSizing: "border-box" };
const buttonStyle = { width: "100%", marginTop: 20, padding: "10px", borderRadius: 6, border: "none", background: "#ff4b4b", color: "#fff", fontWeight: 600, cursor: "pointer" };
const errorStyle = { color: "#f85149", fontSize: 13, marginTop: 12 };