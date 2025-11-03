import { Request, Response } from "express";
import { z } from "zod";
import { Progress } from "../models/Progress";
import { CreateProgressDto, UpdateProgressDto } from "../models/Progress";
import { AuthReq } from "../types/domain";
import { uploadBufferToCloudinary } from "../utils/cloudinary-upload";

// --- helpers ---
const qNum = (v: any, d: number) =>
  Number.isFinite(Number(v)) ? Number(v) : d;
const isISODate = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s);

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

/**
 * POST /progress/:id/photos
 * Body: { photos: string[] }  // array of absolute URLs
 * Adds unique photo URLs to the progress entry.
 */
export async function addPhotos(req: AuthReq, res: Response) {
  try {
    if (!req.auth?.userId)
      return res.status(401).json({ error: "Unauthorized" });

    const { id } = req.params;
    const body = req.body ?? {};
    const photosInput = Array.isArray(body.photos) ? body.photos : [];

    const photos = photosInput.filter(isHttpUrl);
    if (!photos.length) {
      return res.status(400).json({
        error: "Body must include a non-empty array 'photos' of URLs.",
      });
    }

    const updated = await Progress.findOneAndUpdate(
      { _id: id, userId: req.auth.userId },
      { $addToSet: { photos: { $each: photos } } }, // add unique values
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: "Progress entry not found." });
    }

    return res.json(updated);
  } catch (err) {
    console.error("[addPhotos] error:", err);
    return res.status(500).json({ error: "Failed to add photos." });
  }
}

/**
 * DELETE /progress/:id/photos/:photoId
 * Removes a photo URL reference from the progress entry.
 * NOTE: `:photoId` should be URL-encoded if it contains special chars.
 */
export async function removePhoto(req: AuthReq, res: Response) {
  try {
    if (!req.auth?.userId)
      return res.status(401).json({ error: "Unauthorized" });

    const { id, photoId } = req.params;

    // Allow passing raw or URL-encoded value
    const photoUrl = decodeURIComponent(photoId);

    if (!isHttpUrl(photoUrl)) {
      return res.status(400).json({ error: "Invalid photo URL." });
    }

    const updated = await Progress.findOneAndUpdate(
      { _id: id, userId: req.auth.userId },
      { $pull: { photos: photoUrl } },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: "Progress entry not found." });
    }

    return res.json(updated);
  } catch (err) {
    console.error("[removePhoto] error:", err);
    return res.status(500).json({ error: "Failed to remove photo." });
  }
}
