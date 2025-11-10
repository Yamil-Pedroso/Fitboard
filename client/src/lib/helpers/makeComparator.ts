/* eslint-disable @typescript-eslint/no-explicit-any */
import { IRoutine } from "@/services/routineService";
import { SortOption } from "@/types/types";

export function makeComparator(sort: SortOption) {
  const dir = sort.startsWith("-") ? -1 : 1;
  const field = sort.replace(/^-/, "");
  return (a: IRoutine, b: IRoutine) => {
    const av = (a as any)[field];
    const bv = (b as any)[field];
    if (!av && !bv) return 0;
    if (!av) return 1;
    if (!bv) return -1;
    if (field === "updatedAt" || field === "createdAt") {
      return (new Date(av).getTime() - new Date(bv).getTime()) * dir;
    }
    if (typeof av === "string" && typeof bv === "string") {
      return av.localeCompare(bv) * dir;
    }
    return (av > bv ? 1 : av < bv ? -1 : 0) * dir;
  };
}
