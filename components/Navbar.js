"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const { data: session, status } = useSession();

  return (
    <nav style={navStyle}>
      <Link href="/" style={logoStyle}>
        <svg width="26" height="26" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <circle cx="9" cy="37" r="1.75" fill="#3fb950" opacity="0.2" />
          <circle cx="15.5" cy="30" r="2.75" fill="#3fb950" opacity="0.35" />
          <circle cx="22" cy="23" r="4" fill="#3fb950" opacity="0.55" />
          <circle cx="28.5" cy="16.5" r="5.25" fill="#3fb950" opacity="0.8" />
          <circle cx="35" cy="11" r="7" fill="#e6edf3" />
        </svg>
        Fairway<span style={{ color: "#3fb950" }}>Edge</span>
      </Link>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {status === "loading" ? null : session ? (
          <>
            <Link href="/dashboard" style={linkStyle}>Dashboard</Link>
            <button onClick={() => signOut({ callbackUrl: "/" })} style={buttonStyle}>
              Log out
            </button>
          </>
        ) : (
          <>
            <Link href="/login" style={linkStyle}>Log in</Link>
            <Link href="/register" style={buttonStyle}>Sign up</Link>
          </>
        )}
      </div>
    </nav>
  );
}

const navStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "14px 24px",
  borderBottom: "1px solid #30363d",
  background: "#0d1117",
};
const logoStyle = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  fontSize: 18,
  fontWeight: 700,
  color: "#fff",
  textDecoration: "none",
};
const linkStyle = { color: "#c9d1d9", textDecoration: "none", fontSize: 14 };
const buttonStyle = {
  padding: "8px 14px",
  borderRadius: 6,
  border: "1px solid #30363d",
  background: "#ff4b4b",
  color: "#fff",
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
  textDecoration: "none",
};
