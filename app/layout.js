// import Providers from "./providers";

// export const metadata = {
//   title: "Fairway Edge Predictions",
//   description: "Golf top-10 prediction dashboard",
// };

// export default function RootLayout({ children }) {
//   return (
//     <html lang="en">
//       <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: "#0e1117", color: "#fafafa" }}>
//         <Providers>{children}</Providers>
//       </body>
//     </html>
//   );
// }


import Script from "next/script";
import Providers from "./providers";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "Fairway Edge Predictions",
  description: "PGA Tour news, top-10 predictions, and analysis",
};

export default function RootLayout({ children }) {
  const adsenseClientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

  return (
    <html lang="en">
      <head>
        {adsenseClientId && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClientId}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}
      </head>
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: "#f2f3f5", color: "#fafafa" }}>
        <Providers>
          <Navbar />
          {children}
        </Providers>
      </body>
    </html>
  );
}