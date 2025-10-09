import { v2 as cloudinary } from "cloudinary";

export function uploadBufferToCloudinary(buffer: Buffer, folder: string) {
  return new Promise<string>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder },
      (err, result) => {
        if (err) return reject(err);
        if (!result?.secure_url)
          return reject(new Error("Cloudinary: empty result"));
        resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
}
