import { createFileRoute } from "@tanstack/react-router";
import assets from "@/assets";
import Hero from "@/components/hero/Hero";

export const Route = createFileRoute("/")({
  component: Home,
});

const fnImages = [assets.fn1, assets.fn2, assets.fn3, assets.fn4];

function Home() {
  return (
    <div className="p-4">
      <Hero />
      <h1 className="text-2xl font-bold">Yoga and Nutrition</h1>
      <p className="max-w-2xl text-gray-500">
        Welcome to the Yoga and Nutrition section! Here you'll find resources
        and tips to enhance your well-being through mindful practices and
        healthy eating.
      </p>

      <div className="mt-6 flex gap-4">
        <div className="bg-bg2-color w-2xl h-3xl rounded-2xl text-center text-white">
          Box 1
        </div>
        <div className="bg-bg2-color w-2xl h-3xl rounded-2xl text-center text-white">
          Box 2
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4">
        {fnImages.map((src, index) => (
          <div
            key={index}
            className="border rounded-lg overflow-hidden shadow-lg"
          >
            <img
              src={src}
              alt={`Feature ${index + 1}`}
              className="w-full h-100 object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
