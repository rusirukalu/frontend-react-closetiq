import React from "react";
import { Users, Target, Award, Lightbulb } from "lucide-react";
import Section from "../ui/Section";

const AboutUs: React.FC = () => {
  return (
    <Section className="bg-zinc-950">
      <div className="grid lg:grid-cols-2 gap-20 items-center">
        <div className="space-y-8">
          <h2 className="text-4xl md:text-6xl font-black uppercase text-white leading-none">
            Beyond <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-600">
              Human Intuition
            </span>
          </h2>
          <p className="text-gray-400 text-lg leading-relaxed">
            ClosetIQ isn't just an app. It's an extension of your cognitive
            process for style. We leverage state-of-the-art computer vision and
            predictive modeling to solve the paradox of choice.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-8">
            {[
              { icon: Users, label: "Global Scale" },
              { icon: Target, label: "Precision" },
              { icon: Award, label: "Premium" },
              { icon: Lightbulb, label: "Adaptive" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-white">
                <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                  <item.icon className="w-5 h-5" />
                </div>
                <span className="font-bold uppercase text-sm tracking-wider">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="aspect-square rounded-3xl overflow-hidden border border-white/10 relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/50 to-blue-900/50 mix-blend-overlay z-10" />
            <img
              src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1000&auto=format&fit=crop"
              alt="Fashion Model"
              className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 scale-105 group-hover:scale-100"
            />

            <div className="absolute bottom-0 left-0 w-full p-8 z-20 bg-gradient-to-t from-black to-transparent">
              <div className="text-white font-black text-2xl uppercase">
                The Algorithm
              </div>
              <div className="text-gray-400 text-sm">v2.4.0 Stable</div>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
};

export default AboutUs;
