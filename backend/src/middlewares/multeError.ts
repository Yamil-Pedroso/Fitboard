import { ErrorRequestHandler } from "express";
import multer from "multer";

export const multerErrorHandler: ErrorRequestHandler = (
  err,
  _req,
  res,
  next
) => {
  if (err instanceof multer.MulterError) {
    // e.g. LIMIT_FILE_SIZE
    return res.status(400).json({ error: err.message });
  }
  if (err?.message === "Only image files are allowed!") {
    return res.status(400).json({ error: err.message });
  }
  next(err);
};
