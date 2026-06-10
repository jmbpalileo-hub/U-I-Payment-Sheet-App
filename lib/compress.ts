// sharp types don't resolve cleanly under bundler moduleResolution — use any and cast
// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-require-imports
const sharp: any = require("sharp");

const MAX_WIDTH = 1200;
const JPEG_QUALITY = 75;
const MAX_PDF_SIZE = 10 * 1024 * 1024; // 10 MB

export interface CompressResult {
  buffer: Buffer;
  mimeType: string;
  ext: string;
  originalSize: number;
  compressedSize: number;
}

export async function processUploadedFile(
  buffer: Buffer,
  mimeType: string
): Promise<CompressResult> {
  const originalSize = buffer.length;

  if (mimeType === "application/pdf") {
    if (originalSize > MAX_PDF_SIZE) {
      throw new Error(`PDF exceeds 10MB limit (${(originalSize / 1024 / 1024).toFixed(1)}MB)`);
    }
    return { buffer, mimeType: "application/pdf", ext: "pdf", originalSize, compressedSize: originalSize };
  }

  // Image processing via sharp
  const compressed = await sharp(buffer)
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .jpeg({ quality: JPEG_QUALITY })
    .toBuffer();

  return {
    buffer: compressed,
    mimeType: "image/jpeg",
    ext: "jpg",
    originalSize,
    compressedSize: compressed.length,
  };
}
