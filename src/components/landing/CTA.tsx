import React from "react";
import Section from "../ui/Section";
import GlassButton from "../ui/GlassButton";

const CTA: React.FC = () => {
  return (
    <Section className="bg-black border-t border-white/10">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-5xl md:text-8xl font-black uppercase text-white mb-8 tracking-tighter">
          Ready To <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-600">
            Upgrade?
          </span>
        </h2>

        <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
          Join the elite community of users who have mastered their personal
          brand.
        </p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <GlassButton
            to="/register"
            variant="primary"
            className="w-full sm:w-auto"
          >
            Get Access Now
          </GlassButton>
        </div>

        <div className="mt-20 flex justify-center gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
          {/* Fake Logos for "Trusted By" */}
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-8 w-24 bg-white/20 rounded animate-pulse"
            />
          ))}
        </div>
      </div>
    </Section>
  );
};

export default CTA;
