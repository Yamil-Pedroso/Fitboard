import React, { useState, useEffect } from "react";
import Navbar from "@/components/navbar/Navbar";
import Footer from "@/components/footer/Footer";
import { Toaster } from "sonner";
import Lenis from "@studio-freight/lenis";
import { DevelopmentModal } from "@/components/dev-modal/DevelopmentModal";
interface MainLayoutProps {
  children?: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const hasModalShown = localStorage.getItem("modalShown");

    if (!hasModalShown) {
      const timer = setTimeout(() => {
        setIsModalOpen(true);
        localStorage.setItem("modalShown", "true");
      }, 8000);

      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    const lenis = new Lenis();

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    const onScroll = () => {
      document.dispatchEvent(new Event("scroll"));
    };

    window.addEventListener("scroll", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      lenis.destroy();
    };
  }, []);
  return (
    <div
      className="
flex flex-col min-h-screen relative
    "
    >
      <DevelopmentModal
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
      />

      <Toaster
        position="top-right"
        toastOptions={{
          classNames: {
            success: "!border-lime-400 !bg-[#393a3c] !text-white",
            icon: "!bg-lime-400 !text-black rounded-full",
          },
        }}
      />

      <Navbar />

      <main className="flex-1 mx-auto w-full">{children}</main>

      <Footer />
    </div>
  );
};

export default MainLayout;
