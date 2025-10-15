import Navbar from "@/components/navbar/Navbar";
import Footer from "@/components/footer/Footer";
import { Toaster } from "sonner";

interface MainLayoutProps {
  children?: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="min-h-dvh flex flex-col">
      <Toaster position="top-right" />
      <nav className="sticky top-0 z-50 w-full border-b bg-bg2-color backdrop-blur">
        <Navbar />
      </nav>

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-6">
        {children}
      </main>

      <footer className="mt-auto w-full border-t">
        <Footer />
      </footer>
    </div>
  );
};

export default MainLayout;
