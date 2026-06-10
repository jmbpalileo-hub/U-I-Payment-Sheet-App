import { getDriveClient } from "./google";
import { UploadResult } from "@/types";
import { Readable } from "stream";

const PARENT_ID = process.env.STUDENT_FOLDERS_PARENT_ID!;

export async function findStudentFolder(
  accessToken: string,
  fileNo: string,
  surname: string
): Promise<{ id: string; name: string } | null> {
  const drive = getDriveClient(accessToken);

  // Try by file number first
  let res = await drive.files.list({
    q: `name contains "${fileNo}" and mimeType = "application/vnd.google-apps.folder" and "${PARENT_ID}" in parents and trashed = false`,
    fields: "files(id, name)",
    pageSize: 5,
  });

  if (res.data.files && res.data.files.length > 0) {
    const f = res.data.files[0];
    return { id: f.id!, name: f.name! };
  }

  // Fallback: search by surname
  res = await drive.files.list({
    q: `name contains "${surname}" and mimeType = "application/vnd.google-apps.folder" and "${PARENT_ID}" in parents and trashed = false`,
    fields: "files(id, name)",
    pageSize: 5,
  });

  if (res.data.files && res.data.files.length > 0) {
    const f = res.data.files[0];
    return { id: f.id!, name: f.name! };
  }

  return null;
}

export async function findPaymentSubfolder(
  accessToken: string,
  studentFolderId: string
): Promise<{ id: string; name: string } | null> {
  const drive = getDriveClient(accessToken);

  const res = await drive.files.list({
    q: `name contains "Payment" and mimeType = "application/vnd.google-apps.folder" and "${studentFolderId}" in parents and trashed = false`,
    fields: "files(id, name)",
    pageSize: 5,
  });

  if (res.data.files && res.data.files.length > 0) {
    const f = res.data.files[0];
    return { id: f.id!, name: f.name! };
  }

  return null;
}

export async function uploadFileToDrive(
  accessToken: string,
  buffer: Buffer,
  fileName: string,
  mimeType: string,
  folderId: string
): Promise<UploadResult & { folderName: string }> {
  const drive = getDriveClient(accessToken);

  // Get folder name for display
  const folderMeta = await drive.files.get({
    fileId: folderId,
    fields: "name",
  });

  const stream = Readable.from(buffer);

  const res = await drive.files.create({
    requestBody: {
      name: fileName,
      parents: [folderId],
    },
    media: {
      mimeType,
      body: stream,
    },
    fields: "id, name, webViewLink",
  });

  return {
    fileId: res.data.id!,
    fileName: res.data.name!,
    folderName: folderMeta.data.name!,
    driveUrl: res.data.webViewLink!,
  };
}

export interface DriveUploadContext {
  folderId: string;
  folderName: string;
  usedFallback: boolean;
  fallbackMessage?: string;
}

export async function resolveUploadFolder(
  accessToken: string,
  fileNo: string,
  surname: string,
  wantPaymentSubfolder: boolean
): Promise<DriveUploadContext> {
  const studentFolder = await findStudentFolder(accessToken, fileNo, surname);

  if (!studentFolder) {
    return {
      folderId: PARENT_ID,
      folderName: "Root (student folder not found)",
      usedFallback: true,
      fallbackMessage: `No folder found for ${fileNo} / ${surname}. Uploaded to root.`,
    };
  }

  if (!wantPaymentSubfolder) {
    return {
      folderId: studentFolder.id,
      folderName: studentFolder.name,
      usedFallback: false,
    };
  }

  const paymentFolder = await findPaymentSubfolder(accessToken, studentFolder.id);

  if (!paymentFolder) {
    return {
      folderId: studentFolder.id,
      folderName: studentFolder.name,
      usedFallback: true,
      fallbackMessage: `No "Payment" subfolder found. Uploaded to student folder "${studentFolder.name}".`,
    };
  }

  return {
    folderId: paymentFolder.id,
    folderName: paymentFolder.name,
    usedFallback: false,
  };
}
