/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryResult,
} from "@tanstack/react-query";

import {
  listAllProgress,
  getProgressById,
  getProgressByDate,
  createProgress,
  upsertProgressByDate,
  updateProgress,
  deleteProgress,
  getProgressStats,
  upsertPosedPhotos,
  removeProgressPhotoByPublicId,
  removeProgressPhotoByUrl,
  uploadReferencePhotos,
  setReferencePhotosByJson,
  removeReferencePhoto,
  type IListProgressParams,
  type ListProgressResponse,
  type IProgress,
  type CreateProgressInput,
  type UpdateProgressInput,
  type UpsertByDateInput,
  type ProgressStatsResponse,
  type UpsertPosedPhotosInput,
  type ISinglePhoto,
} from "@/services/progressService";

/** =========================
 * Query Keys
 * ========================= */
type ProgressListKey = readonly ["progress", "list", IListProgressParams?];
type ProgressByIdKey = readonly ["progress", "by-id", string];
type ProgressByDateKey = readonly ["progress", "by-date", string];
type ProgressStatsKey = readonly [
  "progress",
  "stats",
  { from?: string; to?: string },
];

/** =========================
 * LIST
 * ========================= */
export function useProgress(opts: IListProgressParams = {}) {
  const {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
  }: UseQueryResult<ListProgressResponse, unknown> = useQuery<
    ListProgressResponse,
    unknown,
    ListProgressResponse,
    ProgressListKey
  >({
    queryKey: ["progress", "list", opts] as const,
    queryFn: () => listAllProgress(opts),
    staleTime: 30_000,
    gcTime: 5 * 60 * 1000,
  });

  return {
    // data
    items: data?.items ?? [],
    page: data?.page ?? 1,
    limit: data?.limit ?? data?.items?.length ?? 0,
    total: data?.total ?? data?.items?.length ?? 0,
    hasMore: data?.hasMore ?? false,

    // states
    isLoading,
    isFetching,
    error,

    // actions
    refetch,
  };
}

/** =========================
 * GET BY ID
 * ========================= */
export function useProgressById(id?: string, enabled = true) {
  return useQuery<IProgress, unknown, IProgress, ProgressByIdKey>({
    queryKey: ["progress", "by-id", id ?? ""] as const,
    queryFn: () => getProgressById(id as string),
    enabled: !!id && enabled,
    staleTime: 30_000,
  });
}

/** =========================
 * GET BY DATE
 * ========================= */
export function useProgressByDate(date?: string, enabled = true) {
  return useQuery<IProgress, unknown, IProgress, ProgressByDateKey>({
    queryKey: ["progress", "by-date", date ?? ""] as const,
    queryFn: () => getProgressByDate(date as string),
    enabled: !!date && enabled,
    staleTime: 30_000,
  });
}

/** =========================
 * CREATE
 * ========================= */
export function useCreateProgress(opts?: { listParams?: IListProgressParams }) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateProgressInput) => createProgress(payload),
    onSuccess: (doc) => {
      // hydrate by-id
      qc.setQueryData<IProgress>(["progress", "by-id", doc._id], doc);
      // hydrate by-date
      qc.setQueryData<IProgress>(["progress", "by-date", doc.date], doc);
      // invalidate list
      qc.invalidateQueries({
        queryKey: ["progress", "list", opts?.listParams],
      });
    },
  });
}

/** =========================
 * UPSERT BY DATE (PUT)
 * ========================= */
export function useUpsertProgressByDate(opts?: {
  listParams?: IListProgressParams;
}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      date,
      payload,
    }: {
      date: string;
      payload: UpsertByDateInput;
    }) => upsertProgressByDate(date, payload),
    onSuccess: (doc) => {
      qc.setQueryData<IProgress>(["progress", "by-id", doc._id], doc);
      qc.setQueryData<IProgress>(["progress", "by-date", doc.date], doc);
      qc.invalidateQueries({
        queryKey: ["progress", "list", opts?.listParams],
      });
    },
  });
}

/** =========================
 * UPDATE BY ID (PATCH)
 * ========================= */
export function useUpdateProgress(opts?: { listParams?: IListProgressParams }) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: UpdateProgressInput }) =>
      updateProgress(id, patch),
    onSuccess: (doc) => {
      qc.setQueryData<IProgress>(["progress", "by-id", doc._id], doc);
      qc.setQueryData<IProgress>(["progress", "by-date", doc.date], doc);
      qc.invalidateQueries({
        queryKey: ["progress", "list", opts?.listParams],
      });
    },
  });
}

/** =========================
 * DELETE BY ID
 * ========================= */
export function useDeleteProgress(opts?: { listParams?: IListProgressParams }) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteProgress(id),
    onSuccess: (_res, id) => {
      // remove cache by-id
      qc.removeQueries({ queryKey: ["progress", "by-id", id] });
      // invalidate list
      qc.invalidateQueries({
        queryKey: ["progress", "list", opts?.listParams],
      });
      // broad: revalidar cualquier by-date potencial afectado
      qc.invalidateQueries({ queryKey: ["progress", "by-date"] });
    },
  });
}

/** =========================
 * STATS
 * ========================= */
export function useProgressStats(params?: { from?: string; to?: string }) {
  return useQuery<
    ProgressStatsResponse,
    unknown,
    ProgressStatsResponse,
    ProgressStatsKey
  >({
    queryKey: [
      "progress",
      "stats",
      { from: params?.from, to: params?.to },
    ] as const,
    queryFn: () => getProgressStats({ from: params?.from, to: params?.to }),
    staleTime: 30_000,
  });
}

/** =========================
 * PHOTOS — POSED (front/side/back)
 * ========================= */
export function useUpsertPosedPhotos() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpsertPosedPhotosInput) => upsertPosedPhotos(input),
    onSuccess: (doc) => {
      // refresh caches for this progress
      qc.setQueryData<IProgress>(["progress", "by-id", doc._id], doc);
      qc.setQueryData<IProgress>(["progress", "by-date", doc.date], doc);
      // revalidar listas
      qc.invalidateQueries({ queryKey: ["progress", "list"] });
    },
  });
}

export function useRemoveProgressPhoto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: { id: string; publicId?: string; url?: string }) => {
      const { id, publicId, url } = params;
      if (!publicId && !url) throw new Error("Provide publicId or url");
      return publicId
        ? removeProgressPhotoByPublicId(id, publicId)
        : removeProgressPhotoByUrl(id, url as string);
    },
    onSuccess: (doc) => {
      qc.setQueryData<IProgress>(["progress", "by-id", doc._id], doc);
      qc.setQueryData<IProgress>(["progress", "by-date", doc.date], doc);
      qc.invalidateQueries({ queryKey: ["progress", "list"] });
    },
  });
}

/** =========================
 * REFERENCE PHOTOS (start/compare)
 * ========================= */
export function useUploadReferencePhotos() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: uploadReferencePhotos,
    onSuccess: (doc) => {
      qc.setQueryData<IProgress>(["progress", "by-id", doc._id], doc);
      qc.setQueryData<IProgress>(["progress", "by-date", doc.date], doc);
      qc.invalidateQueries({ queryKey: ["progress", "list"] });
    },
  });
}

export function useSetReferencePhotosByJson() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: {
      id: string;
      payload: {
        startPhoto?: ISinglePhoto | null;
        comparePhoto?: ISinglePhoto | null;
      };
    }) => setReferencePhotosByJson(args.id, args.payload),
    onSuccess: (doc) => {
      qc.setQueryData<IProgress>(["progress", "by-id", doc._id], doc);
      qc.setQueryData<IProgress>(["progress", "by-date", doc.date], doc);
      qc.invalidateQueries({ queryKey: ["progress", "list"] });
    },
  });
}

export function useRemoveReferencePhoto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: { id: string; which: "start" | "compare" }) =>
      removeReferencePhoto(args.id, args.which),
    onSuccess: (doc) => {
      qc.setQueryData<IProgress>(["progress", "by-id", doc._id], doc);
      qc.setQueryData<IProgress>(["progress", "by-date", doc.date], doc);
      qc.invalidateQueries({ queryKey: ["progress", "list"] });
    },
  });
}
