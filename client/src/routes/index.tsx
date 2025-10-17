import { createFileRoute } from "@tanstack/react-router";
import assets from "@/assets";
import Hero from "@/components/hero/Hero";
import DMealComp from "@/components/dummy-components/DMealComp";
import { RiArrowRightUpFill } from "react-icons/ri";
import SectionB from "@/components/dummy-components/SectionB";
import { motion } from "framer-motion";

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
      <h1 className="text-2xl font-bold">Yoga and Nutrition</h1>
      <p className="max-w-2xl text-gray-500">
        Welcome to the Yoga and Nutrition section! Here you'll find resources
        and tips to enhance your well-being through mindful practices and
        healthy eating.
      </p>

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
            className="w-[10rem] flex justify-center shadow-[-3px_3px_0px_0px_rgb(0_0_0/0.8)] "
          >
            <div className="bg-white w-2xl  text-center text-[#393a3c] flex flex-col justify-center items-center border-6 border-[#393a3c] p-4">
              <h2 className="text-xl font-semibold mb-2">{box.title}</h2>
              <p>{box.content}</p>
            </div>
          </div>
        ))}
      </div>

      <div className=" flex mt-6  border-[#393a3c] gap-4 ">
        {fnImages.map((src, index) => (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.2 }}
            key={index}
            className="w-[25rem] border-6 border-[#393a3c] overflow-hidden shadow-lg"
          >
            <div className="flex justify-between items-center bg-[#bbbbbb]  text-[#393a3c] p-4 border-b-6 border-[#393a3c]">
              <h3 className="text-lg font-semibold">{src.category}</h3>
              <RiArrowRightUpFill className="inline-block ml-2 text-4xl cursor-pointer" />
            </div>
            <div className="w-[12rem] h-[12rem] overflow-hidden">
              <img
                src={src.src}
                alt={src.alt}
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>
        ))}
      </div>

      <SectionB />
    </div>
  );
}
