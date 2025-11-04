import {
  v2 as cloudinary,
  type UploadApiOptions,
  type UploadApiResponse,
} from "cloudinary";
import streamifier from "streamifier";

export function uploadBufferToCloudinary(
  buffer: Buffer,
  options: UploadApiOptions = {}
): Promise<UploadApiResponse> {
  return new Promise((resolve, reject) => {
    const upload = cloudinary.uploader.upload_stream(options, (err, result) => {
      if (err) return reject(err);
      if (!result) return reject(new Error("Cloudinary returned no result"));
      resolve(result);
    });
    streamifier.createReadStream(buffer).pipe(upload);
  });
}

export async function deleteFromCloudinary(publicId: string) {
  try {
    return await cloudinary.uploader.destroy(publicId, { invalidate: true });
  } catch (e) {
    // log y no romper el flujo del API
    console.error("[cloudinary.destroy]", e);
    return null;
  }
}
/**
 * (Optional) Extract publicId from a Cloudinary URL.
 * Useful if, for legacy rows, you only stored the URL.
 */
export function extractPublicIdFromUrl(url: string): string | null {
  try {
    const u = new URL(url);
    // path after /upload/ => e.g. "v1699999999/progress/USER/abc123.jpg"
    const afterUpload = u.pathname.split("/upload/")[1];
    if (!afterUpload) return null;
    const noVersion = afterUpload.replace(/^v\d+\//, "");
    // strip file extension
    return noVersion.replace(/\.[a-zA-Z0-9]+$/, "");
  } catch {
    return null;
  }
}
