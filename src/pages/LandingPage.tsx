import React from "react";
import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import AboutUs from "@/components/landing/AboutUs";
import CTA from "@/components/landing/CTA";
import Footer from "@/components/landing/Footer";

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen font-sans bg-black selection:bg-white selection:text-black">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <AboutUs />
        <CTA />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;
