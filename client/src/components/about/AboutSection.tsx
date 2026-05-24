import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Activity, Apple, Dumbbell, Sparkles } from "lucide-react";

export default function AboutSection() {
  const { t } = useTranslation("about");

  const features = [
    {
      icon: <Apple className="h-5 w-5" />,
      title: t("feature1Title"),
      text: t("feature1Text"),
    },

    {
      icon: <Dumbbell className="h-5 w-5" />,
      title: t("feature2Title"),
      text: t("feature2Text"),
    },

    {
      icon: <Activity className="h-5 w-5" />,
      title: t("feature3Title"),
      text: t("feature3Text"),
    },
  ];

  return (
    <section id="about" className="relative overflow-hidden py-20 md:py-28">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-10 top-10 h-72 w-72 rounded-full bg-lime-300/20 blur-3xl" />

        <div className="absolute bottom-10 right-10 h-72 w-72 rounded-full bg-orange-300/20 blur-3xl" />
      </div>

      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_1.1fr] lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-[2rem] border-6 border-gray-800 bg-white p-6"
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-lime-100 px-3 py-1 text-xs font-bold text-neutral-900 ring-1 ring-lime-300">
            <Sparkles className="h-3.5 w-3.5" />

            {t("badge")}
          </div>

          <h2 className="mt-5 text-3xl font-black tracking-tight text-neutral-900 sm:text-4xl">
            {t("title")}
          </h2>

          <p className="mt-4 text-neutral-600">{t("description1")}</p>

          <p className="mt-4 text-neutral-600">{t("description2")}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="grid gap-4"
        >
          {features.map((feature, index) => (
            <motion.article
              key={feature.title}
              initial={{ opacity: 0, x: 28 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.45, delay: index * 0.1 }}
              className="rounded-2xl border border-gray-200 shadow-sm bg-white p-5"
            >
              <div className="flex gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-lime-400 text-neutral-900">
                  {feature.icon}
                </div>

                <div>
                  <h3 className="font-bold text-neutral-900">
                    {feature.title}
                  </h3>

                  <p className="mt-1 text-sm text-neutral-600">
                    {feature.text}
                  </p>
                </div>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
