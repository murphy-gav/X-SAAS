import Navbar from "@/components/section/navbar/Navbar";
import Footer from "@/components/section/footer/Footer";
import { Toaster } from "@/components/ui/sonner"
import React from "react";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="background-light850_dark100 relative">
      <Navbar />
      <div className="flex">
        <section className="flex min-h-screen flex-1 flex-col px-6 pb-6 pt-3 max-md:pb-14 sm:px-14">
          <div className="mx-auto w-full">{children}</div>
        </section>
      </div>
      <Footer />
      <Toaster />
    </main>
  );
};

export default Layout;
