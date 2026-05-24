import React from "react";
import { Link } from "@tanstack/react-router";
import { motion, Variants } from "framer-motion";
import { useTranslation } from "react-i18next";
import { BookOpen, Leaf, Tag, Sparkles, Plus } from "lucide-react";
import assets from "@/assets";

const sectionV = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.06 },
  },
} as Variants;

const upV = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
} as Variants;

const cardV = {
  hidden: (i: number) => ({
    opacity: 0,
    y: 24,
    rotate: i === 0 ? -4 : i === 1 ? 2 : -2,
    scale: 0.96,
  }),
  show: {
    opacity: 1,
    y: 0,
    rotate: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 320, damping: 26 },
  },
} as Variants;

const RecipesSection: React.FC = () => {
  const { t } = useTranslation("recipes");

  return (
    <motion.section
      id="recipes"
      className="relative py-16 md:py-24 overflow-hidden"
      variants={sectionV}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
    >
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,0,0,0.04),transparent_45%)]" />

        <motion.div
          className="absolute -top-16 right-10 h-64 w-64 rounded-full bg-lime-300/20 blur-3xl"
          animate={{ opacity: [0.35, 0.6, 0.35] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />

        <motion.div
          className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-rose-300/20 blur-3xl"
          animate={{ opacity: [0.35, 0.6, 0.35] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-start gap-12 lg:grid-cols-[1.1fr_1fr]">
          <motion.div variants={upV} className="space-y-6">
            <p className="inline-flex items-center gap-2 rounded-full bg-lime-100 px-3 py-1 text-xs font-bold text-neutral-900 ring-1 ring-inset ring-neutral-200">
              <BookOpen className="h-4 w-4" />
              {t("badge")}
            </p>

            <motion.h2
              variants={upV}
              className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl"
            >
              {t("titlePrefix")}{" "}
              <span className="bg-gradient-to-r from-neutral-900 via-neutral-700 to-neutral-900 bg-clip-text text-transparent">
                {t("titleHighlight")}
              </span>
            </motion.h2>

            <motion.p variants={upV} className="max-w-xl text-neutral-600">
              {t("subtitle")}
            </motion.p>

            <motion.ol variants={sectionV} className="relative ml-4 space-y-5">
              <li className="relative">
                <span className="absolute -left-4 top-1.5 h-2 w-2 rounded-full bg-lime-500" />

                <FeatureLine
                  icon={<Leaf className="h-4 w-4" />}
                  title={t("ingredientTitle")}
                  desc={t("ingredientDesc")}
                />
              </li>

              <li className="relative">
                <span className="absolute -left-4 top-1.5 h-2 w-2 rounded-full bg-sky-500" />

                <FeatureLine
                  icon={<Tag className="h-4 w-4" />}
                  title={t("categoriesTitle")}
                  desc={t("categoriesDesc")}
                />
              </li>

              <li className="relative">
                <span className="absolute -left-4 top-1.5 h-2 w-2 rounded-full bg-rose-500" />

                <FeatureLine
                  icon={<Sparkles className="h-4 w-4" />}
                  title={t("servingTitle")}
                  desc={t("servingDesc")}
                />
              </li>
            </motion.ol>

            <motion.div
              variants={upV}
              className="flex flex-col gap-3 sm:flex-row"
            >
              <Link
                to="/recipes/create"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-lime-400 px-4 py-2 text-neutral-900 shadow-sm transition hover:opacity-90"
              >
                <Plus className="h-4 w-4" />
                {t("createRecipe")}
              </Link>

              <Link
                to="/recipes"
                className="inline-flex items-center justify-center rounded-2xl border border-neutral-200 bg-white px-4 py-2 text-neutral-900 shadow-sm transition hover:bg-neutral-50"
              >
                {t("browseRecipes")}
              </Link>
            </motion.div>
          </motion.div>

          <div className="relative grid grid-cols-1 gap-6 sm:grid-cols-2">
            <RecipeCard
              i={0}
              title={t("recipe1Title")}
              kcal="520 kcal"
              tags={[t("tagHighProtein"), t("tagMealPrep")]}
              img={assets.recipe2}
            />

            <RecipeCard
              i={1}
              title={t("recipe2Title")}
              kcal="410 kcal"
              tags={[t("tagBreakfast"), t("tagQuick")]}
              img={assets.recipe3}
            />

            <RecipeCard
              i={2}
              title={t("recipe3Title")}
              kcal="260 kcal"
              tags={[t("tagSnack"), t("tagVegan")]}
              img={assets.recipe1}
              className="sm:col-span-2"
            />
          </div>
        </div>
      </div>
    </motion.section>
  );
};

function RecipeCard({
  i,
  title,
  kcal,
  tags,
  img,
  className = "",
}: {
  i: number;
  title: string;
  kcal: string;
  tags: string[];
  img: string;
  className?: string;
}) {
  return (
    <motion.article
      custom={i}
      variants={cardV}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.3 }}
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 240, damping: 20 }}
      className={`group relative overflow-hidden rounded-2xl border-6 border-neutral-800 bg-neutral-100 shadow-sm ${className}`}
    >
      <div className="aspect-[4/3] w-full overflow-hidden">
        <img
          src={img}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          loading="lazy"
        />
      </div>

      <div className="space-y-2 p-4">
        <div className="flex items-center justify-between">
          <h3 className="truncate font-semibold text-neutral-900">{title}</h3>

          <span className="shrink-0 rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-700 ring-1 ring-inset ring-neutral-200">
            {kcal}
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-neutral-50 px-2 py-0.5 text-xs text-neutral-700 ring-1 ring-inset ring-neutral-200"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </motion.article>
  );
}

function FeatureLine({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <motion.div variants={upV} className="flex items-start gap-3">
      <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-lg bg-neutral-100 text-neutral-800">
        {icon}
      </div>

      <div>
        <div className="font-medium text-neutral-900">{title}</div>
        <p className="text-neutral-600">{desc}</p>
      </div>
    </motion.div>
  );
}

export default RecipesSection;
