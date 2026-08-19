"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const { data: session, status } = useSession();

  return (
    <nav style={navStyle}>
      <Link href="/" style={logoStyle}>⛳ Fairway Edge</Link>

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
const logoStyle = { fontSize: 18, fontWeight: 700, color: "#fff", textDecoration: "none" };
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