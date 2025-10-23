import { createFileRoute, Link } from "@tanstack/react-router";
import assets from "@/assets";
import Hero from "@/components/hero/Hero";
import DMealComp from "@/components/dummy-components/DMealComp";
import { RiArrowRightUpFill } from "react-icons/ri";
import SectionB from "@/components/dummy-components/SectionB";
//import { motion } from "framer-motion";

import SectionC from "@/components/dummy-components/SectionC";
import SectionD from "@/components/dummy-components/SectionD";
import MealSection from "@/components/meals/MealSection";
import RoutineSection from "@/components/routines/RoutineSection";
import RecipesSection from "@/components/recipes/RecipesSection";
import PlansSection from "@/components/plans/PlansSection";

export const Route = createFileRoute("/")({
  component: Home,
});

const fnImages = [
  {
    category: "Meal Plans",
    src: assets.fn1,
    alt: "Feature 1",
  },
  { category: "Workout Routines", src: assets.fn2, alt: "Feature 2" },
  { category: "Progress Tracking", src: assets.fn3, alt: "Feature 3" },
  { category: "Community Support", src: assets.fn4, alt: "Feature 4" },
];

function Home() {
  return (
    <div className="p-4">
      <DMealComp />
      <Hero />

      <div className="mt-26 mb-6 flex flex-col items-center text-center gap-4">
        <h1 className="text-2xl font-bold text-black">Fitness and Nutrition</h1>
        <p className="max-w-2xl text-black">
          Welcome to the Yoga and Nutrition section! Here you'll find resources
          and tips to enhance your well-being through mindful practices and
          healthy eating.
        </p>
      </div>

      <div className="flex flex-col items-center mb-12">
        <div className="mt-6 flex gap-4">
          {[
            {
              title: "Box 1",
              content: "Content",
            },
            {
              title: "Box 2",
              content: "Content",
            },
          ].map((box, index) => (
            <div
              key={index}
              className="w-[10rem] flex justify-center shadow-[-3px_3px_0px_0px_rgb(0_0_0/0.8)] rounded-[1rem]"
            >
              <div className="bg-white w-2xl  text-center text-[#393a3c] flex flex-col justify-center items-center border-6 border-[#393a3c] p-4 rounded-[1rem]">
                <h2 className="text-xl font-semibold mb-2">{box.title}</h2>
                <p>{box.content}</p>
              </div>
            </div>
          ))}
        </div>

        <div className=" flex mt-6  border-[#393a3c] gap-4 ">
          {fnImages.map((src, index) => (
            <div
              //initial={{ opacity: 0, y: 50 }}
              //whileInView={{ opacity: 1, y: 0 }}
              //viewport={{ once: true }}
              //transition={{ duration: 0.5, delay: index * 0.2 }}
              key={index}
              className="w-[25rem] border-6 border-[#393a3c] overflow-hidden shadow-lg rounded-[2rem]"
            >
              <div className="flex justify-between items-center bg-[#bbbbbb]  text-[#393a3c] p-4 border-b-6 border-[#393a3c]">
                <h3 className="text-lg font-semibold">{src.category}</h3>
                <Link to="/meals">
                  <RiArrowRightUpFill className="inline-block ml-2 text-4xl cursor-pointer hover:scale-110 hover:text-emerald-600 transition-all duration-300" />
                </Link>
              </div>
              <div className="w-[12rem] h-[12rem] overflow-hidden">
                <img
                  src={src.src}
                  alt={src.alt}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <SectionB />

      <SectionD />

      <SectionC />

      <MealSection />

      <RoutineSection />

      <RecipesSection />

      <PlansSection />
    </div>
  );
}
