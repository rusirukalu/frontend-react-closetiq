import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle } from "lucide-react";

const CTA: React.FC = () => {
  const features = [
    "AI-powered outfit recommendations",
    "Smart wardrobe organization",
    "Personalized style analysis",
    "Weather-based suggestions",
    "Color coordination assistance",
    "Occasion-specific styling",
  ];

  return (
    <section className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-primary-600 via-purple-600 to-indigo-600 text-white px-4 py-20 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-black/10"></div>
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-20 left-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-yellow-500/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <h2 className="text-4xl md:text-6xl font-bold mb-6">
          Ready to Transform
          <br />
          <span className="bg-gradient-to-r from-yellow-400 to-pink-400 bg-clip-text text-transparent">
            Your Style?
          </span>
        </h2>

        <p className="text-xl md:text-2xl mb-12 text-white/90 max-w-3xl mx-auto leading-relaxed">
          Join thousands of fashion enthusiasts who have already discovered
          their perfect style with ClosetIQ. Start your transformation today!
        </p>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12 max-w-2xl mx-auto">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center space-x-3 text-left">
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
              <span className="text-white/90">{feature}</span>
            </div>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
          <Link
            to="/register"
            className="bg-white text-purple-600 font-bold px-8 py-4 rounded-xl hover:bg-gray-100 transition-all transform hover:scale-105 shadow-xl flex items-center space-x-2 text-lg"
          >
            <span>Start Free Today</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            to="/login"
            className="border-2 border-white text-white font-semibold px-8 py-4 rounded-xl hover:bg-white hover:text-purple-600 transition-all transform hover:scale-105 flex items-center space-x-2 text-lg"
          >
            <span>Already a Member?</span>
          </Link>
        </div>

        {/* Trust Indicators */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-white mb-2">10k+</div>
              <div className="text-white/80">Happy Users</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-2">50k+</div>
              <div className="text-white/80">Outfits Created</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-2">95%</div>
              <div className="text-white/80">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
