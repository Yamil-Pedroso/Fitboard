import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Global
import enGlobal from "./locales/en/global/chatAi.json";
import deGlobal from "./locales/de/global/chatAi.json";
import esGlobal from "./locales/es/global/chatAi.json";

// Hero
import enHero from "./locales/en/home-page/hero.json";
import deHero from "./locales/de/home-page/hero.json";
import esHero from "./locales/es/home-page/hero.json";

// About
import enAbout from "./locales/en/home-page/about.json";
import deAbout from "./locales/de/home-page/about.json";
import esAbout from "./locales/es/home-page/about.json";

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
        chatAi: enGlobal,
        hero: enHero,
        about: enAbout,
        meals: enMeals,
        routines: enRoutines,
        recipes: enRecipes,
        plans: enPlans,
        settings: enSettings,
      },

      es: {
        chatAi: esGlobal,
        hero: esHero,
        about: esAbout,
        meals: esMeals,
        routines: esRoutines,
        recipes: esRecipes,
        plans: esPlans,
        settings: esSettings,
      },

      de: {
        chatAi: deGlobal,
        hero: deHero,
        about: deAbout,
        meals: deMeals,
        routines: deRoutines,
        recipes: deRecipes,
        plans: dePlans,
        settings: deSettings,
      },
    },
    ns: [
      "chatAi",
      "hero",
      "about",
      "meals",
      "routines",
      "recipes",
      "plans",
      "settings",
    ],
    defaultNS: "hero",
    fallbackLng: "en",

    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
