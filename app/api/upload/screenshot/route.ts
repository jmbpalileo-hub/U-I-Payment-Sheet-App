import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { processUploadedFile } from "@/lib/compress";
import { resolveUploadFolder, uploadFileToDrive } from "@/lib/drive";
import { buildScreenshotFilename } from "@/lib/formatters";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const fileNo = formData.get("fileNo") as string;
    const paymentDate = formData.get("paymentDate") as string;
    const surname = formData.get("surname") as string;
    const firstName = formData.get("firstName") as string;

    if (!file || !fileNo || !paymentDate || !surname || !firstName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const inputBuffer = Buffer.from(arrayBuffer);

    const { buffer, mimeType, ext } = await processUploadedFile(inputBuffer, file.type);

    const { folderId, folderName, usedFallback, fallbackMessage } =
      await resolveUploadFolder(session.accessToken, fileNo, surname, true);

    const fileName = buildScreenshotFilename(paymentDate, surname, firstName, ext);

    const result = await uploadFileToDrive(
      session.accessToken,
      buffer,
      fileName,
      mimeType,
      folderId
    );

    return NextResponse.json({
      ...result,
      folderName,
      usedFallback,
      fallbackMessage,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Screenshot upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
