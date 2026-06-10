import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { renderPaymentSheetHTML } from "@/lib/paymentSheetTemplate";
import { generatePDFFromHTML } from "@/lib/pdf";
import { PaymentSheetParams } from "@/types";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const params: PaymentSheetParams = await req.json();
    const html = renderPaymentSheetHTML(params);
    const pdfBuffer = await generatePDFFromHTML(html);

    return new NextResponse(pdfBuffer.buffer as ArrayBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="payment-sheet.pdf"`,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "PDF generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
