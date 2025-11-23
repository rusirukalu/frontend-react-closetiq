import React from "react";
import { Zap, Heart, Sparkles } from "lucide-react";
import Section from "../ui/Section";
import GlassCard from "../ui/GlassCard";

const Features: React.FC = () => {
  return (
    <Section className="bg-black">
      <div className="mb-20">
        <h2 className="text-4xl md:text-6xl font-black uppercase text-white mb-6">
          System <span className="text-gray-600">Capabilities</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <GlassCard className="group">
          <Zap className="w-10 h-10 text-white mb-6 group-hover:scale-110 transition-transform duration-300" />
          <h3 className="text-xl font-bold text-white uppercase mb-4">
            Neural Recommendations
          </h3>
          <p className="text-gray-400 leading-relaxed">
            Our engine analyzes millions of data points to suggest outfits that
            match your exact biometric and stylistic profile.
          </p>
        </GlassCard>

        <GlassCard className="group bg-white/10 border-white/20">
          <Heart className="w-10 h-10 text-white mb-6 group-hover:scale-110 transition-transform duration-300" />
          <h3 className="text-xl font-bold text-white uppercase mb-4">
            Smart Wardrobe
          </h3>
          <p className="text-gray-400 leading-relaxed">
            Digitize your closet. Track usage metrics. Optimize your rotation
            with data-driven insights.
          </p>
        </GlassCard>

        <GlassCard className="group">
          <Sparkles className="w-10 h-10 text-white mb-6 group-hover:scale-110 transition-transform duration-300" />
          <h3 className="text-xl font-bold text-white uppercase mb-4">
            Style DNA
          </h3>
          <p className="text-gray-400 leading-relaxed">
            Deep learning algorithms decode your personal aesthetic and evolve
            with your preferences over time.
          </p>
        </GlassCard>
      </div>
    </Section>
  );
};

export default Features;
