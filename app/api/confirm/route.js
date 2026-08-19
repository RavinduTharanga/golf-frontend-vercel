import { NextResponse } from "next/server";
import { confirmSignUp } from "@/lib/cognito";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const { email, code } = await request.json();
    if (!email || !code) {
      return NextResponse.json({ error: "Email and confirmation code are required." }, { status: 400 });
    }

    await confirmSignUp(email, code);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const name = err?.name || "";
    if (name === "CodeMismatchException") {
      return NextResponse.json({ error: "Incorrect confirmation code." }, { status: 400 });
    }
    if (name === "ExpiredCodeException") {
      return NextResponse.json({ error: "That code has expired. Please register again." }, { status: 400 });
    }
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}