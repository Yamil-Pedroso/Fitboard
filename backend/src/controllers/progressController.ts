import { Request, Response } from "express";
import { z } from "zod";
import { Progress } from "../models/Progress";
import {
  CreateProgressDto,
  UpdateProgressDto,
  UpdateReferencePhotosDto,
  IProgress,
} from "../models/Progress";
import { AuthReq } from "../types/domain";
import {
  uploadBufferToCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary-upload";
import { v2 as cloudinary } from "cloudinary";

type Pose = "front" | "side" | "back";
const POSES: Pose[] = ["front", "side", "back"];

// --- helpers ---
const qNum = (v: any, d: number) =>
  Number.isFinite(Number(v)) ? Number(v) : d;
const isISODate = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s);

function toArray<T = string>(v: any): T[] {
  if (v == null) return [];
  return Array.isArray(v) ? v : [v];
}
function isHttpUrl(s: unknown): s is string {
  if (typeof s !== "string") return false;
  try {
    const u = new URL(s);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

// Shared query schema for listing
const ListQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  from: z.string().optional(),
  to: z.string().optional(),
  sort: z.enum(["date", "-date", "createdAt", "-createdAt"]).default("-date"),
});

// --- CONTROLLER ACTIONS ---

// POST /progress
export async function createProgress(req: AuthReq, res: Response) {
  try {
    if (!req.auth?.userId)
      return res.status(401).json({ error: "Unauthorized" });

    const data = CreateProgressDto.parse(req.body);

    // enforce date shape
    if (!isISODate(data.date)) {
      return res
        .status(400)
        .json({ error: "Invalid date format (YYYY-MM-DD)" });
    }

    const doc = await Progress.create({ userId: req.auth.userId, ...data });
    return res.status(201).json(doc);
  } catch (err: any) {
    if (err.code === 11000) {
      // unique (userId, date)
      return res
        .status(409)
        .json({ error: "A progress entry for this date already exists." });
    }
    if (err?.issues) {
      return res
        .status(400)
        .json({ error: "Validation failed", details: err.issues });
    }
    return res.status(500).json({ error: "Failed to create progress" });
  }
}

// PUT /progress/:date  (idempotent upsert by date)
export async function upsertByDate(req: AuthReq, res: Response) {
  try {
    if (!req.auth?.userId)
      return res.status(401).json({ error: "Unauthorized" });

    const date = req.params.date;
    if (!isISODate(date)) {
      return res.status(400).json({ error: "Invalid date param (YYYY-MM-DD)" });
    }

    // allow using Create DTO but date comes from param to avoid mismatch
    const body = CreateProgressDto.omit({ date: true })
      .partial()
      .parse(req.body);

    const updated = await Progress.findOneAndUpdate(
      { userId: req.auth.userId, date },
      { $set: { ...body } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.json(updated);
  } catch (err: any) {
    if (err?.issues) {
      return res
        .status(400)
        .json({ error: "Validation failed", details: err.issues });
    }
    return res.status(500).json({ error: "Failed to upsert progress" });
  }
}

// GET /progress
export async function listProgress(req: AuthReq, res: Response) {
  try {
    if (!req.auth?.userId)
      return res.status(401).json({ error: "Unauthorized" });

    const q = ListQuery.parse(req.query);
    const filter: any = { userId: req.auth.userId };

    if (q.from || q.to) {
      filter.date = {};
      if (q.from) filter.date.$gte = q.from;
      if (q.to) filter.date.$lte = q.to;
    }

    const sort: Record<string, 1 | -1> = {};
    const field = q.sort.replace("-", "");
    sort[field] = q.sort.startsWith("-") ? -1 : 1;

    const [items, total] = await Promise.all([
      Progress.find(filter)
        .sort(sort)
        .skip((q.page - 1) * q.limit)
        .limit(q.limit),
      Progress.countDocuments(filter),
    ]);

    return res.json({
      page: q.page,
      limit: q.limit,
      total,
      items,
      hasMore: q.page * q.limit < total,
    });
  } catch {
    return res.status(500).json({ error: "Failed to list progress" });
  }
}

// GET /progress/:id
export async function getById(req: AuthReq, res: Response) {
  try {
    if (!req.auth?.userId)
      return res.status(401).json({ error: "Unauthorized" });

    const doc = await Progress.findOne({
      _id: req.params.id,
      userId: req.auth.userId,
    });
    if (!doc) return res.status(404).json({ error: "Not found" });
    return res.json(doc);
  } catch {
    return res.status(500).json({ error: "Failed to fetch progress" });
  }
}

// GET /progress/date/:date
export async function getByDate(req: AuthReq, res: Response) {
  try {
    if (!req.auth?.userId)
      return res.status(401).json({ error: "Unauthorized" });

    const date = req.params.date;
    if (!isISODate(date)) {
      return res.status(400).json({ error: "Invalid date param (YYYY-MM-DD)" });
    }

    const doc = await Progress.findOne({ userId: req.auth.userId, date });
    if (!doc) return res.status(404).json({ error: "Not found" });
    return res.json(doc);
  } catch {
    return res.status(500).json({ error: "Failed to fetch progress" });
  }
}

// PATCH /progress/:id
export async function updateById(req: AuthReq, res: Response) {
  try {
    if (!req.auth?.userId)
      return res.status(401).json({ error: "Unauthorized" });

    const body = UpdateProgressDto.parse(req.body);
    if (body.date && !isISODate(body.date)) {
      return res
        .status(400)
        .json({ error: "Invalid date format (YYYY-MM-DD)" });
    }

    const updated = await Progress.findOneAndUpdate(
      { _id: req.params.id, userId: req.auth.userId },
      { $set: body },
      { new: true }
    );

    if (!updated) return res.status(404).json({ error: "Not found" });
    return res.json(updated);
  } catch (err: any) {
    if (err?.issues) {
      return res
        .status(400)
        .json({ error: "Validation failed", details: err.issues });
    }
    return res.status(500).json({ error: "Failed to update progress" });
  }
}

// DELETE /progress/:id
export async function removeById(req: AuthReq, res: Response) {
  try {
    if (!req.auth?.userId)
      return res.status(401).json({ error: "Unauthorized" });

    const deleted = await Progress.findOneAndDelete({
      _id: req.params.id,
      userId: req.auth.userId,
    });
    if (!deleted) return res.status(404).json({ error: "Not found" });
    return res.json({ ok: true });
  } catch {
    return res.status(500).json({ error: "Failed to delete progress" });
  }
}

// GET /progress/stats?from=YYYY-MM-DD&to=YYYY-MM-DD
// Lightweight stats for dashboard (delta & per-week pace)
export async function stats(req: AuthReq, res: Response) {
  try {
    if (!req.auth?.userId)
      return res.status(401).json({ error: "Unauthorized" });

    const from = (req.query.from as string) || undefined;
    const to = (req.query.to as string) || undefined;

    const filter: any = { userId: req.auth.userId };
    if (from || to) {
      filter.date = {};
      if (from) filter.date.$gte = from;
      if (to) filter.date.$lte = to;
    }

    const items = await Progress.find(filter).sort({ date: 1 });

    const first = items[0];
    const last = items[items.length - 1];

    const days =
      items.length > 1
        ? (new Date(last?.date ?? "").getTime() -
            new Date(first?.date ?? "").getTime()) /
          (1000 * 60 * 60 * 24)
        : 0;

    const weightDelta =
      first?.weight_kg != null && last?.weight_kg != null
        ? last.weight_kg - first.weight_kg
        : null;

    const waistDelta =
      first?.waist_cm != null && last?.waist_cm != null
        ? last.waist_cm - first.waist_cm
        : null;

    const perWeek = (delta: number | null) =>
      delta == null || days === 0 ? null : (delta / days) * 7;

    return res.json({
      count: items.length,
      range: {
        from: from ?? first?.date ?? null,
        to: to ?? last?.date ?? null,
      },
      weight: {
        start: first?.weight_kg ?? null,
        end: last?.weight_kg ?? null,
        delta: weightDelta,
        perWeek: perWeek(weightDelta),
      },
      waist: {
        start: first?.waist_cm ?? null,
        end: last?.waist_cm ?? null,
        delta: waistDelta,
        perWeek: perWeek(waistDelta),
      },
    });
  } catch {
    return res.status(500).json({ error: "Failed to compute stats" });
  }
}

// controller (resumen)
export async function upsertReferencePhotosUpload(req: AuthReq, res: Response) {
  if (!req.auth?.userId) return res.status(401).json({ error: "Unauthorized" });
  const { id } = req.params;

  const files = (req.files as Record<string, Express.Multer.File[]>) || {};
  const startFile = files.start?.[0];
  const compareFile = files.compare?.[0];

  if (!startFile && !compareFile) {
    return res
      .status(400)
      .json({ error: "No files uploaded (start/compare)." });
  }

  const doc = await Progress.findOne({ _id: id, userId: req.auth.userId });
  if (!doc) return res.status(404).json({ error: "Not found" });

  // Upload helpers
  const folder = `progress/${req.auth.userId}/${doc.date}/reference`;
  const uploadOne = (f: Express.Multer.File) =>
    uploadBufferToCloudinary(f.buffer, {
      folder,
      resource_type: "image",
      overwrite: true,
    });

  const updates: Partial<IProgress> = {};

  // start
  if (startFile) {
    const { secure_url, public_id } = await uploadOne(startFile);
    // delete previous if exists
    if (doc.startPhoto?.publicId) {
      try {
        await cloudinary.uploader.destroy(doc.startPhoto.publicId, {
          invalidate: true,
        });
      } catch {}
    }
    updates.startPhoto = {
      url: secure_url,
      publicId: public_id,
      notes: req.body?.startNotes,
      capturedAt: req.body?.startCapturedAt,
    };
  }

  // compare
  if (compareFile) {
    const { secure_url, public_id } = await uploadOne(compareFile);
    if (doc.comparePhoto?.publicId) {
      try {
        await cloudinary.uploader.destroy(doc.comparePhoto.publicId, {
          invalidate: true,
        });
      } catch {}
    }
    updates.comparePhoto = {
      url: secure_url,
      publicId: public_id,
      notes: req.body?.compareNotes,
      capturedAt: req.body?.compareCapturedAt,
    };
  }

  const updated = await Progress.findOneAndUpdate(
    { _id: id, userId: req.auth.userId },
    { $set: updates },
    { new: true }
  );
  return res.json(updated);
}

export async function setReferencePhotosByJson(req: AuthReq, res: Response) {
  if (!req.auth?.userId) return res.status(401).json({ error: "Unauthorized" });

  const { id } = req.params;
  const payload = UpdateReferencePhotosDto.parse(req.body);

  const doc = await Progress.findOne({ _id: id, userId: req.auth.userId });
  if (!doc) return res.status(404).json({ error: "Not found" });

  const updates: any = {};
  // start
  if ("startPhoto" in payload) {
    if (payload.startPhoto === null) {
      if (doc.startPhoto?.publicId) {
        try {
          await cloudinary.uploader.destroy(doc.startPhoto.publicId, {
            invalidate: true,
          });
        } catch {}
      }
      updates.startPhoto = undefined;
    } else if (payload.startPhoto) {
      updates.startPhoto = payload.startPhoto;
    }
  }
  // compare
  if ("comparePhoto" in payload) {
    if (payload.comparePhoto === null) {
      if (doc.comparePhoto?.publicId) {
        try {
          await cloudinary.uploader.destroy(doc.comparePhoto.publicId, {
            invalidate: true,
          });
        } catch {}
      }
      updates.comparePhoto = undefined;
    } else if (payload.comparePhoto) {
      updates.comparePhoto = payload.comparePhoto;
    }
  }

  const updated = await Progress.findOneAndUpdate(
    { _id: id, userId: req.auth.userId },
    { $set: updates },
    { new: true }
  );
  return res.json(updated);
}

export async function upsertPosedPhotos(req: AuthReq, res: Response) {
  try {
    if (!req.auth?.userId)
      return res.status(401).json({ error: "Unauthorized" });

    const { id } = req.params;

    // 1) Collect incoming files by pose
    const files = (req.files as Record<string, Express.Multer.File[]>) || {};
    const entries: Array<{
      pose: Pose;
      file: Express.Multer.File;
      lighting?: string;
      notes?: string;
    }> = [];
    for (const pose of POSES) {
      const f = files[pose]?.[0];
      if (f) {
        entries.push({
          pose,
          file: f,
          lighting: (req.body?.[`${pose}Lighting`] as string) || undefined,
          notes: (req.body?.[`${pose}Notes`] as string) || undefined,
        });
      }
    }

    if (entries.length === 0) {
      return res
        .status(400)
        .json({ error: "No files uploaded. Use fields: front, side, back." });
    }

    // 2) Load current doc
    const doc = await Progress.findOne({ _id: id, userId: req.auth.userId });
    if (!doc)
      return res.status(404).json({ error: "Progress entry not found." });

    // Map existing photos by pose for quick replace
    const existingByPose = new Map<
      Pose,
      {
        url: string;
        publicId?: string;
        pose?: Pose;
        lighting?: string;
        notes?: string;
      }
    >();
    for (const p of doc.photos) {
      if (p.pose && (POSES as string[]).includes(p.pose)) {
        existingByPose.set(p.pose as Pose, p as any);
      }
    }

    // 3) Upload new files to Cloudinary and prepare replacements
    const uploaded = await Promise.all(
      entries.map(async (e) => {
        const { secure_url, public_id } = await uploadBufferToCloudinary(
          e.file.buffer,
          {
            folder: `progress/${req.auth?.userId}/${doc.date}`,
            resource_type: "image",
            overwrite: true,
          }
        );
        return {
          pose: e.pose,
          url: secure_url,
          publicId: public_id,
          lighting: (e.lighting as any) ?? "unknown",
          notes: e.notes,
        };
      })
    );

    // 4) Replace per pose (delete old Cloudinary asset if present)
    for (const u of uploaded) {
      const prev = existingByPose.get(u.pose);
      if (prev?.publicId) {
        try {
          await cloudinary.uploader.destroy(prev.publicId);
        } catch {}
      }
      existingByPose.set(u.pose, u);
    }

    // 5) Persist EXACTLY up to 3 posed photos (front/side/back), in fixed order
    const nextPhotos = POSES.map((p) => existingByPose.get(p)).filter(
      Boolean
    ) as Array<{
      url: string;
      publicId?: string;
      pose: Pose;
      lighting?: string;
      notes?: string;
    }>;

    const updated = await Progress.findOneAndUpdate(
      { _id: id, userId: req.auth.userId },
      { $set: { photos: nextPhotos } },
      { new: true }
    );

    return res.json(updated);
  } catch (err) {
    console.error("[upsertPosedPhotos] error:", err);
    return res.status(500).json({ error: "Failed to upsert posed photos." });
  }
}

/**
 * POST /progress/:id/photos
 * Accepts:
 *  - multipart/form-data with field "photos" (one or many files)
 *    Optional per-file metadata arrays: pose[], lighting[], notes[]
 *  - OR JSON { photos: string[] } with absolute URLs
 */
export async function addPhotos(req: AuthReq, res: Response) {
  try {
    if (!req.auth?.userId)
      return res.status(401).json({ error: "Unauthorized" });

    const { id } = req.params;
    const files = (req.files as Express.Multer.File[]) || [];

    // Will accumulate new photo subdocs to push
    const newPhotos: {
      url: string;
      publicId?: string;
      pose?: "front" | "side" | "back";
      lighting?: "natural" | "artificial" | "unknown";
      notes?: string;
    }[] = [];

    if (files.length > 0) {
      // Read optional metadata arrays (aligned by index)
      const poses = toArray(req.body.pose) as Array<"front" | "side" | "back">;
      const lightings = toArray(req.body.lighting) as Array<
        "natural" | "artificial" | "unknown"
      >;
      const notes = toArray(req.body.notes) as string[];

      for (let i = 0; i < files.length; i++) {
        const f = files[i];
        const result = await uploadBufferToCloudinary(f.buffer, {
          folder: `progress/${req.auth.userId}`,
          // e.g. transformation options (opcionales)
          // transformation: [{ quality: "auto", fetch_format: "auto" }],
        });

        newPhotos.push({
          url: result.secure_url,
          publicId: result.public_id,
          pose: poses[i],
          lighting: lightings[i],
          notes: notes[i],
        });
      }
    } else if (Array.isArray((req.body as any)?.photos)) {
      // Fallback: accept URLs body { photos: string[] }
      const urls = (req.body as any).photos.filter(isHttpUrl);
      if (!urls.length) {
        return res
          .status(400)
          .json({ error: "Body 'photos' must include valid URLs." });
      }
      urls.forEach((u: string) => newPhotos.push({ url: u }));
    } else {
      return res.status(400).json({
        error:
          "Provide images as multipart 'photos' files or JSON { photos: string[] } of absolute URLs.",
      });
    }

    const updated = await Progress.findOneAndUpdate(
      { _id: id, userId: req.auth.userId },
      { $push: { photos: { $each: newPhotos } } },
      { new: true }
    );

    if (!updated)
      return res.status(404).json({ error: "Progress entry not found." });
    return res.json(updated);
  } catch (err) {
    console.error("[addPhotos] error:", err);
    return res.status(500).json({ error: "Failed to add photos." });
  }
}

export async function removeReferencePhoto(req: AuthReq, res: Response) {
  if (!req.auth?.userId) return res.status(401).json({ error: "Unauthorized" });
  const { id, which } = req.params as {
    id: string;
    which: "start" | "compare";
  };

  if (!["start", "compare"].includes(which)) {
    return res.status(400).json({ error: "Param which must be start|compare" });
  }

  const doc = await Progress.findOne({ _id: id, userId: req.auth.userId });
  if (!doc) return res.status(404).json({ error: "Not found" });

  const current = which === "start" ? doc.startPhoto : doc.comparePhoto;
  if (current?.publicId) {
    try {
      await cloudinary.uploader.destroy(current.publicId, { invalidate: true });
    } catch {}
  }

  const $set: any = {};
  $set[which === "start" ? "startPhoto" : "comparePhoto"] = undefined;

  const updated = await Progress.findOneAndUpdate(
    { _id: id, userId: req.auth.userId },
    { $set },
    { new: true }
  );
  return res.json(updated);
}

/**
 * DELETE /progress/:id/photos/:photoId
 * Removes a photo by subdocument _id (preferred) or URL (if :photoId is a URL-encoded http/https).
 * If subdoc has publicId, it also deletes from Cloudinary.
 */
export async function removePhoto(req: AuthReq, res: Response) {
  try {
    if (!req.auth?.userId)
      return res.status(401).json({ error: "Unauthorized" });

    const { id, photoId } = req.params;
    const value = decodeURIComponent(photoId);
    const isUrl = /^https?:\/\//i.test(value);
    const pull = isUrl ? { url: value } : { publicId: value };

    const result = await Progress.updateOne(
      { _id: id, userId: req.auth.userId },
      { $pull: { photos: pull } }
    );

    if (result.matchedCount === 0)
      return res.status(404).json({ error: "Progress entry not found." });

    // ⬇️ Inserta el if aquí: solo borra en Cloudinary si quitaste algo y te pasaron publicId
    if (result.modifiedCount > 0 && !isUrl) {
      try {
        await cloudinary.uploader.destroy(value, { invalidate: true });
      } catch (e) {
        console.error("[cloudinary.destroy]", e);
      }
    }

    // Devuelve el doc actualizado si lo necesitas en el cliente
    const updated = await Progress.findById(id);
    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ error: "Failed to remove photo." });
  }
}
