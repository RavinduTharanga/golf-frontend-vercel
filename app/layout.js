export const metadata = {
  title: "Fairway Edge Predictions",
  description: "Golf top-10 prediction dashboard",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: "#0e1117", color: "#fafafa" }}>
        {children}
      </body>
    </html>
  );
}
