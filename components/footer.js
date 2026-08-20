import Link from "next/link";

export default function Footer() {
  return (
    <footer style={footerStyle}>
      <div style={linksStyle}>
        <Link href="/about" style={linkStyle}>About</Link>
        <Link href="/privacy" style={linkStyle}>Privacy</Link>
      </div>
      <div style={copyStyle}>© {new Date().getFullYear()} Fairway Edge</div>
    </footer>
  );
}

const footerStyle = {
  marginTop: 48,
  padding: "24px 16px",
  textAlign: "center",
  background: "#0d1117",
};
const linksStyle = {
  display: "flex",
  justifyContent: "center",
  gap: 20,
  marginBottom: 10,
};
const linkStyle = { color: "#c9d1d9", textDecoration: "none", fontSize: 14 };
const copyStyle = { color: "#6e7681", fontSize: 12 };