import crypto from "crypto";

export function generateResetToken() {
  const token = crypto.randomBytes(32).toString("hex"); // token for URL
  const hash = crypto.createHash("sha256").update(token).digest("hex"); // store hash
  return { token, hash };
}
