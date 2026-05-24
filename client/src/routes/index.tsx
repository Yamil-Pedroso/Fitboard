import { createFileRoute } from "@tanstack/react-router";
import Hero from "@/components/hero/Hero";
//import DMealComp from "@/components/dummy-components/DMealComp";
//import SectionA from "@/components/dummy-components/SectionA";
//import SectionB from "@/components/dummy-components/SectionB";
import MealSection from "@/components/meals/MealSection";
import RoutineSection from "@/components/routines/RoutineSection";
import RecipesSection from "@/components/recipes/RecipesSection";
import PlansSection from "@/components/plans/PlansSection";
import AboutSection from "@/components/about/AboutSection";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <div className="">
      <Hero />

      <AboutSection />

      <MealSection />

      <RoutineSection />

      <RecipesSection />

      <PlansSection />
    </div>
  );
}
