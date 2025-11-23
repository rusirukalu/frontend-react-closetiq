import React from "react";
import GlassButton from "../ui/GlassButton";

const Hero: React.FC = () => {
  return (
    <section className="relative flex items-center justify-center min-h-screen mt-12 overflow-visible bg-black">
      {/* Ambient Background */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-900/30 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-900/20 rounded-full blur-[120px]" />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>

      <div className="relative z-10 px-4 mx-auto text-center max-w-7xl">
        <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 border rounded-full bg-white/5 border-white/10 backdrop-blur-md animate-fade-in-up">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-xs font-bold tracking-widest text-gray-300 uppercase">
            AI-Powered Wardrobe v2.0
          </span>
        </div>

        <h1 className="text-6xl md:text-9xl font-black uppercase tracking-tighter text-white mb-8 leading-[0.9]">
          Future <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/20">
            Of Style
          </span>
        </h1>

        <p className="max-w-2xl mx-auto mb-12 text-lg font-light leading-relaxed text-gray-400 md:text-xl">
          Experience the next generation of wardrobe management. Powered by
          advanced neural networks to curate your perfect look.
        </p>

        <div className="flex flex-col items-center justify-center gap-6 sm:flex-row">
          <GlassButton to="/register" variant="primary">
            Start Journey
          </GlassButton>
          <GlassButton to="/login" variant="secondary">
            Explore Demo
          </GlassButton>
        </div>

        {/* Floating Glass Cards */}
        <div className="grid max-w-5xl grid-cols-1 gap-6 mx-auto mt-24 md:grid-cols-3 perspective-1000">
          {[
            { title: "Analysis", val: "99.9%", sub: "Accuracy" },
            { title: "Outfits", val: "∞", sub: "Combinations" },
            { title: "Speed", val: "<0.1s", sub: "Processing" },
          ].map((item, i) => (
            <div
              key={i}
              className="p-6 transition-all duration-500 border bg-white/5 border-white/10 rounded-2xl backdrop-blur-md hover:bg-white/10 hover:-translate-y-2"
            >
              <div className="mb-2 text-xs font-bold tracking-widest text-gray-400 uppercase">
                {item.title}
              </div>
              <div className="mb-1 text-4xl font-black text-white">
                {item.val}
              </div>
              <div className="text-sm text-gray-500">{item.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;
