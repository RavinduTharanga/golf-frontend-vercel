// import { NextResponse } from "next/server";
// import bcrypt from "bcryptjs";
// import { getUserByEmail, createUser } from "@/lib/dynamodb";

// export const runtime = "nodejs";

// function isValidEmail(email) {
//   return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
// }

// export async function POST(request) {
//   try {
//     const { email, password } = await request.json();

//     if (!email || !isValidEmail(email)) {
//       return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
//     }
//     if (!password || password.length < 8) {
//       return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
//     }

//     const existing = await getUserByEmail(email);
//     if (existing) {
//       return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
//     }

//     const passwordHash = await bcrypt.hash(password, 12);
//     await createUser(email, passwordHash);

//     return NextResponse.json({ ok: true });
//   } catch (err) {
//     // ConditionalCheckFailedException means a simultaneous signup won the race
//     if (String(err).includes("ConditionalCheckFailedException")) {
//       return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
//     }
//     return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
//   }
// }
import { NextResponse } from "next/server";
import { signUp } from "@/lib/cognito";

export const runtime = "nodejs";

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    }
    if (!password || password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    }

    await signUp(email, password);

    // Cognito emails the user a confirmation code at this point --
    // account isn't usable until they confirm it.
    return NextResponse.json({ ok: true, needsConfirmation: true });
  } catch (err) {
    const name = err?.name || "";
    if (name === "UsernameExistsException") {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }
    if (name === "InvalidPasswordException") {
      return NextResponse.json({ error: "Password doesn't meet requirements." }, { status: 400 });
    }
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}