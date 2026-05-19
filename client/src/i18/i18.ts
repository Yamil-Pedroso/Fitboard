import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Hero
import enHero from "./locales/en/home-page/hero.json";
import deHero from "./locales/de/home-page/hero.json";
import esHero from "./locales/es/home-page/hero.json";

// Meals
import enMeals from "./locales/en/home-page/meals.json";
import deMeals from "./locales/de/home-page/meals.json";
import esMeals from "./locales/es/home-page/meals.json";

// Routines
import enRoutines from "./locales/en/home-page/routines.json";
import deRoutines from "./locales/de/home-page/routines.json";
import esRoutines from "./locales/es/home-page/routines.json";

// Recipes
import enRecipes from "./locales/en/home-page/recipes.json";
import deRecipes from "./locales/de/home-page/recipes.json";
import esRecipes from "./locales/es/home-page/recipes.json";

// Plans
import enPlans from "./locales/en/home-page/plans.json";
import dePlans from "./locales/de/home-page/plans.json";
import esPlans from "./locales/es/home-page/plans.json";

// Settings
import enSettings from "./locales/en/settings/settings.json";
import deSettings from "./locales/de/settings/settings.json";
import esSettings from "./locales/es/settings/settings.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        hero: enHero,
        meals: enMeals,
        routines: enRoutines,
        recipes: enRecipes,
        plans: enPlans,
        settings: enSettings,
      },

      es: {
        hero: esHero,
        meals: esMeals,
        routines: esRoutines,
        recipes: esRecipes,
        plans: esPlans,
        settings: esSettings,
      },

      de: {
        hero: deHero,
        meals: deMeals,
        routines: deRoutines,
        recipes: deRecipes,
        plans: dePlans,
        settings: deSettings,
      },
    },
    ns: ["hero", "meals", "routines", "recipes", "plans", "settings"],
    defaultNS: "hero",
    fallbackLng: "en",

    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
