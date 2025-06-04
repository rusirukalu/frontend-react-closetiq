import React from "react";
import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import AboutUs from "@/components/landing/AboutUs";
import CTA from "@/components/landing/CTA";
import Footer from "@/components/landing/Footer";

const LandingPage: React.FC = () => {
  return (
    <>
      <Navbar />
      <main className="pt-16">
        <Hero />
        <AboutUs />
        <CTA />
        <Footer />
      </main>
    </>
  );
};

export default LandingPage;
