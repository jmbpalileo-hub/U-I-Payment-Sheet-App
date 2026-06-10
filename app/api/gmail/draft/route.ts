import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { createPaymentDraft } from "@/lib/gmail";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { fullName, paymentDate, paymentType } = await req.json();

    if (!fullName || !paymentDate || !paymentType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const result = await createPaymentDraft(
      session.accessToken,
      fullName,
      paymentDate,
      paymentType
    );

    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Draft creation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
