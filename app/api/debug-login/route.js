import { NextResponse } from "next/server";
import { login } from "@/lib/cognito";

export const runtime = "nodejs";

// TEMPORARY diagnostic endpoint -- delete this file once login is
// working. Returns the exact Cognito error directly in the response so
// you can see it in the browser/devtools Network tab, no need to dig
// through Vercel's logs.
export async function POST(request) {
  const debug = {
    COGNITO_CLIENT_ID_present: !!process.env.COGNITO_CLIENT_ID,
    COGNITO_CLIENT_ID_length: (process.env.COGNITO_CLIENT_ID || "").length,
    COGNITO_CLIENT_SECRET_present: !!process.env.COGNITO_CLIENT_SECRET,
    AWS_REGION: process.env.AWS_REGION || "(not set, defaulting to us-east-1)",
  };

  try {
    const { email, password } = await request.json();
    debug.emailReceived = !!email;
    debug.passwordReceived = !!password;

    const tokens = await login(email, password);
    return NextResponse.json({ success: true, hasTokens: !!tokens, debug });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        errorName: err?.name || null,
        errorMessage: err?.message || String(err),
        debug,
      },
      { status: 200 } // 200 on purpose so you can see the body easily
    );
  }
}