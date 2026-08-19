export { default } from "next-auth/middleware";

// Protects everything EXCEPT: the login/register/confirm pages
// themselves, the NextAuth/register/confirm/debug-login API routes
// (needed before the user is logged in), and Next.js internal/static
// assets. Everything else -- including the dashboard page -- requires
// a logged-in session.
export const config = {
  matcher: [
    "/((?!api/auth|api/register|api/confirm|api/debug-login|login|register|confirm|_next/static|_next/image|favicon.ico).*)",
  ],
};