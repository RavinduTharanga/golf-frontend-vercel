// export { default } from "next-auth/middleware";

// // Protects everything EXCEPT: the login/register/confirm pages
// // themselves, the NextAuth/register/confirm/debug-login API routes
// // (needed before the user is logged in), and Next.js internal/static
// // assets. Everything else -- including the dashboard page -- requires
// // a logged-in session.
// export const config = {
//   matcher: [
//     "/((?!api/auth|api/register|api/confirm|api/debug-login|login|register|confirm|_next/static|_next/image|favicon.ico).*)",
//   ],
// };


export { default } from "next-auth/middleware";

// Previously this protected "everything except a list of public pages."
// Now that the home page is public by design (news + ads, no login
// needed to view it), it's simpler and safer to flip the logic: only
// protect the specific routes that actually need a login, and leave
// everything else public by default.
export const config = {
  matcher: ["/dashboard/:path*"],
};

