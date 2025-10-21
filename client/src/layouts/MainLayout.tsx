import React, { useEffect } from "react";
import Navbar from "@/components/navbar/Navbar";
import Footer from "@/components/footer/Footer";
import { Toaster } from "sonner";
import Lenis from "@studio-freight/lenis";

interface MainLayoutProps {
  children?: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
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
    <div className="min-h-dvh flex flex-col">
      <Toaster position="top-right" />

      <Navbar />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-6">
        {children}
      </main>

      <Footer />
    </div>
  );
};

export default MainLayout;
