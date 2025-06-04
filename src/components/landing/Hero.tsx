import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Zap, Heart } from "lucide-react";

const Hero: React.FC = () => {
  return (
    <section className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 text-white px-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
      <div className="absolute top-40 right-10 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-20 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>

      {/* Content */}
      <div className="relative z-10 text-center max-w-5xl">
        <div className="flex justify-center mb-6">
          <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
            <Sparkles className="w-5 h-5" />
            <span className="text-sm font-medium">
              AI-Powered Fashion Assistant
            </span>
          </div>
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight">
          Transform Your
          <span className="bg-gradient-to-r from-yellow-400 to-pink-400 bg-clip-text text-transparent">
            {" "}
            Style
          </span>
          <br />
          with AI
        </h1>

        <p className="text-xl md:text-2xl max-w-3xl mx-auto mb-8 text-white/90 leading-relaxed">
          Revolutionize your wardrobe with AI-powered outfit recommendations,
          smart styling advice, and personalized fashion insights.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <Link
            to="/register"
            className="bg-white text-purple-600 font-bold px-8 py-4 rounded-xl hover:bg-gray-100 transition-all transform hover:scale-105 shadow-xl flex items-center space-x-2"
          >
            <span>Start Your Style Journey</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            to="/login"
            className="border-2 border-white text-white font-semibold px-8 py-4 rounded-xl hover:bg-white hover:text-purple-600 transition-all transform hover:scale-105 flex items-center space-x-2"
          >
            <span>Sign In</span>
          </Link>
        </div>

        {/* Features Preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <Zap className="w-8 h-8 mb-4 mx-auto text-yellow-400" />
            <h3 className="font-semibold mb-2">Smart Recommendations</h3>
            <p className="text-sm text-white/80">
              AI-powered outfit suggestions based on your style, weather, and
              occasion.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <Heart className="w-8 h-8 mb-4 mx-auto text-pink-400" />
            <h3 className="font-semibold mb-2">Wardrobe Management</h3>
            <p className="text-sm text-white/80">
              Organize your closet digitally and track your favorite pieces.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <Sparkles className="w-8 h-8 mb-4 mx-auto text-purple-400" />
            <h3 className="font-semibold mb-2">Style Analysis</h3>
            <p className="text-sm text-white/80">
              Get personalized insights and discover your unique style profile.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
