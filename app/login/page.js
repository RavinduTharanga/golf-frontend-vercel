"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Incorrect email or password.");
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <main style={pageStyle}>
      <form onSubmit={handleSubmit} style={cardStyle}>
        <h1 style={{ fontSize: 22, marginBottom: 20 }}>⛳ Log in</h1>

        <label style={labelStyle}>Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
        />

        <label style={labelStyle}>Password</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={inputStyle}
        />

        {error && <div style={errorStyle}>{error}</div>}

        <button type="submit" disabled={loading} style={buttonStyle}>
          {loading ? "Logging in..." : "Log in"}
        </button>

        <p style={{ marginTop: 16, fontSize: 14, color: "#8b949e" }}>
          Don&rsquo;t have an account? <Link href="/register" style={{ color: "#58a6ff" }}>Register</Link>
        </p>
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
