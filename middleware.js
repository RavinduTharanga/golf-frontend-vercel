export { default } from "next-auth/middleware";

// Protects everything EXCEPT: the login/register/confirm pages
// themselves, the NextAuth and registration/confirmation API routes
// (needed for the signup flow to actually work before the user is
// logged in), and Next.js internal/static assets. Everything else --
// including the dashboard page -- requires a logged-in session.
export const config = {
  matcher: [
    "/((?!api/auth|api/register|api/confirm|login|register|confirm|_next/static|_next/image|favicon.ico).*)",
  ],
};