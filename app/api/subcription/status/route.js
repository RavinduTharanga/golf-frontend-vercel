import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { isSubscriptionActive } from "@/lib/subscriptions";

export const runtime = "nodejs";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ active: false });
  }

  try {
    const active = await isSubscriptionActive(session.user.email);
    return NextResponse.json({ active });
  } catch (err) {
    return NextResponse.json({ active: false, error: String(err) });
  }
}