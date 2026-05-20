// utils/planLimits.ts

export type PlanName = "free" | "pro" | "elite";

export const PLAN_LIMITS = {
  free: {
    recipes: 50,
    routines: 5,
    mealsLog: "basic",
    macroGoals: 1,
    progressTracking: "basic",
    timers: false,
    duplicateRoutines: false,
    archiveRoutines: false,
    advancedMacros: false,
    recipeImageUploads: false,
    advancedAnalytics: false,
    csvExport: false,
    coachClients: 0,
    prioritySupport: false,
  },

  pro: {
    recipes: Infinity,
    routines: Infinity,
    mealsLog: "full",
    macroGoals: Infinity,
    progressTracking: "full",
    timers: true,
    duplicateRoutines: true,
    archiveRoutines: true,
    advancedMacros: true,
    recipeImageUploads: true,
    advancedAnalytics: false,
    csvExport: false,
    coachClients: 0,
    prioritySupport: false,
  },

  elite: {
    recipes: Infinity,
    routines: Infinity,
    mealsLog: "full",
    macroGoals: Infinity,
    progressTracking: "advanced",
    timers: true,
    duplicateRoutines: true,
    archiveRoutines: true,
    advancedMacros: true,
    recipeImageUploads: true,
    advancedAnalytics: true,
    csvExport: true,
    coachClients: 5,
    prioritySupport: true,
  },
} as const;
