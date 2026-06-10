import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { renderPaymentSheetHTML } from "@/lib/paymentSheetTemplate";
import { generatePDFFromHTML } from "@/lib/pdf";
import { resolveUploadFolder, uploadFileToDrive } from "@/lib/drive";
import { buildPaymentSheetFilename } from "@/lib/formatters";
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

    const { folderId, folderName, usedFallback, fallbackMessage } =
      await resolveUploadFolder(session.accessToken, params.fileNo, params.surname, false);

    const fileName = buildPaymentSheetFilename(
      params.paymentReceiveDate,
      params.surname,
      params.firstName,
      params.paymentType
    );

    const result = await uploadFileToDrive(
      session.accessToken,
      pdfBuffer,
      fileName,
      "application/pdf",
      folderId
    );

    return NextResponse.json({
      ...result,
      folderName,
      usedFallback,
      fallbackMessage,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
