import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function GET() {
  const session = await auth();
  return NextResponse.json({
    hasSession: !!session,
    hasUser: !!session?.user,
    email: session?.user?.email ?? null,
    hasAccessToken: !!session?.accessToken,
    accessTokenPreview: session?.accessToken
      ? session.accessToken.slice(0, 20) + "…"
      : null,
  });
}
