// // import NextAuth from "next-auth";
// // import CredentialsProvider from "next-auth/providers/credentials";
// // import bcrypt from "bcryptjs";
// // import { getUserByEmail } from "@/lib/dynamodb";

// // export const authOptions = {
// //   providers: [
// //     CredentialsProvider({
// //       name: "Email and password",
// //       credentials: {
// //         email: { label: "Email", type: "email" },
// //         password: { label: "Password", type: "password" },
// //       },
// //       async authorize(credentials) {
// //         if (!credentials?.email || !credentials?.password) return null;

// //         const user = await getUserByEmail(credentials.email);
// //         if (!user) return null;

// //         const valid = await bcrypt.compare(credentials.password, user.passwordHash);
// //         if (!valid) return null;

// //         // Only ever return non-sensitive fields -- this becomes the
// //         // session's user object, never expose passwordHash here.
// //         return { id: user.email, email: user.email };
// //       },
// //     }),
// //   ],
// //   session: {
// //     strategy: "jwt",
// //   },
// //   pages: {
// //     signIn: "/login",
// //   },
// //   secret: process.env.NEXTAUTH_SECRET,
// // };

// // const handler = NextAuth(authOptions);
// // export { handler as GET, handler as POST };
// import NextAuth from "next-auth";
// import CredentialsProvider from "next-auth/providers/credentials";
// import { login } from "@/lib/cognito";

// export const authOptions = {
//   providers: [
//     CredentialsProvider({
//       name: "Email and password",
//       credentials: {
//         email: { label: "Email", type: "email" },
//         password: { label: "Password", type: "password" },
//       },
//       async authorize(credentials) {
//         if (!credentials?.email || !credentials?.password) return null;

//         try {
//           const tokens = await login(credentials.email, credentials.password);
//           if (!tokens) return null;
//           // Only ever return non-sensitive fields as the session's user object.
//           return { id: credentials.email, email: credentials.email };
//         } catch (err) {
//           // NotAuthorizedException (wrong password), UserNotConfirmedException
//           // (hasn't entered their confirmation code yet), UserNotFoundException,
//           // etc. -- any of these just means "can't log in," so return null
//           // and let NextAuth show the generic invalid-credentials error.
//           return null;
//         }
//       },
//     }),
//   ],
//   session: {
//     strategy: "jwt",
//   },
//   pages: {
//     signIn: "/login",
//   },
//   secret: process.env.NEXTAUTH_SECRET,
// };

// const handler = NextAuth(authOptions);
// export { handler as GET, handler as POST };

import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { login } from "@/lib/cognito";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Email and password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log(
          "authorize() called. email present:", !!credentials?.email,
          "password present:", !!credentials?.password,
          "COGNITO_CLIENT_ID set:", !!process.env.COGNITO_CLIENT_ID,
          "COGNITO_CLIENT_SECRET set:", !!process.env.COGNITO_CLIENT_SECRET
        );

        if (!credentials?.email || !credentials?.password) {
          console.log("Missing email or password -- returning null early.");
          return null;
        }

        try {
          const tokens = await login(credentials.email, credentials.password);
          if (!tokens) {
            console.log("login() returned no tokens.");
            return null;
          }
          return { id: credentials.email, email: credentials.email };
        } catch (err) {
          console.error("Cognito login failed:", err?.name, err?.message);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };