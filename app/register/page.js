"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Something went wrong.");
      return;
    }

    setSuccess(true);
    setTimeout(() => router.push(`/confirm?email=${encodeURIComponent(email)}`), 1200);
  }

  return (
    <main style={pageStyle}>
      <form onSubmit={handleSubmit} style={cardStyle}>
        <h1 style={{ fontSize: 22, marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
          <svg width="22" height="22" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <circle cx="9" cy="37" r="1.75" fill="#3fb950" opacity="0.2" />
            <circle cx="15.5" cy="30" r="2.75" fill="#3fb950" opacity="0.35" />
            <circle cx="22" cy="23" r="4" fill="#3fb950" opacity="0.55" />
            <circle cx="28.5" cy="16.5" r="5.25" fill="#3fb950" opacity="0.8" />
            <circle cx="35" cy="11" r="7" fill="#e6edf3" />
          </svg>
          Create an account
        </h1>

        {success ? (
          <div style={{ color: "#3fb950" }}>Account created — check your email for a confirmation code...</div>
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

            <label style={labelStyle}>Password (min. 8 characters)</label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={inputStyle}
            />

            <label style={labelStyle}>Confirm password</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={inputStyle}
            />

            {error && <div style={errorStyle}>{error}</div>}

            <button type="submit" disabled={loading} style={buttonStyle}>
              {loading ? "Creating account..." : "Register"}
            </button>

            <p style={{ marginTop: 16, fontSize: 14, color: "#8b949e" }}>
              Already have an account? <Link href="/login" style={{ color: "#58a6ff" }}>Log in</Link>
            </p>
          </>
        )}
      </form>
    </main>
  );
}

const pageStyle = { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 };
const cardStyle = { width: 360, background: "#161b22", border: "1px solid #30363d", borderRadius: 8, padding: 28 };
const labelStyle = { display: "block", fontSize: 13, color: "#8b949e", marginTop: 14, marginBottom: 4 };
const inputStyle = { width: "100%", padding: "8px 10px", borderRadius: 6, border: "1px solid #30363d", background: "#0d1117", color: "#fff", boxSizing: "border-box" };
const buttonStyle = { width: "100%", marginTop: 20, padding: "10px", borderRadius: 6, border: "none", background: "#ff4b4b", color: "#fff", fontWeight: 600, cursor: "pointer" };
const errorStyle = { color: "#f85149", fontSize: 13, marginTop: 12 };