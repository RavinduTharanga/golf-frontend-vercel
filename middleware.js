export { default } from "next-auth/middleware";

// Protects everything EXCEPT: the login/register pages themselves, the
// NextAuth API routes (needed for login to actually work), and Next.js
// internal/static assets. Everything else -- including the dashboard
// page and its data API routes -- requires a logged-in session.
export const config = {
  matcher: [
    "/((?!api/auth|api/register|login|register|_next/static|_next/image|favicon.ico).*)",
  ],
};
