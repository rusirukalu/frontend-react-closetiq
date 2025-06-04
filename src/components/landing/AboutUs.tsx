import React from "react";
import { Users, Target, Award, Lightbulb } from "lucide-react";

const AboutUs: React.FC = () => {
  return (
    <section className="min-h-screen flex flex-col justify-center items-center bg-gray-50 px-4 py-20">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
            About ClosetIQ
          </h2>
          <p className="max-w-3xl mx-auto text-center text-gray-600 text-lg leading-relaxed">
            ClosetIQ is dedicated to democratizing style through advanced
            artificial intelligence. We believe everyone deserves to look and
            feel their best, regardless of their fashion expertise.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h3 className="text-3xl font-bold text-gray-900 mb-6">
              Our Mission
            </h3>
            <p className="text-gray-600 text-lg leading-relaxed mb-6">
              We're revolutionizing the way people approach fashion by combining
              cutting-edge AI technology with deep fashion expertise. Our
              platform offers personalized outfit recommendations, wardrobe
              organization, and style advice tailored to your unique preferences
              and lifestyle.
            </p>
            <p className="text-gray-600 text-lg leading-relaxed">
              Whether you're looking to refresh your wardrobe, find the perfect
              outfit for a special occasion, or simply discover your personal
              style, ClosetIQ is here to guide you every step of the way.
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="aspect-square bg-gradient-to-br from-purple-100 to-indigo-100 rounded-xl flex items-center justify-center">
              <div className="text-center">
                <Lightbulb className="w-16 h-16 text-purple-600 mx-auto mb-4" />
                <h4 className="text-xl font-semibold text-gray-900">
                  AI Innovation
                </h4>
                <p className="text-gray-600 mt-2">
                  Powered by advanced machine learning
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
            <Users className="w-12 h-12 text-purple-600 mx-auto mb-4" />
            <h4 className="text-xl font-semibold text-gray-900 mb-3">
              For Everyone
            </h4>
            <p className="text-gray-600">
              Designed for fashion enthusiasts and beginners alike, making style
              accessible to all.
            </p>
          </div>
          <div className="text-center bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
            <Target className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
            <h4 className="text-xl font-semibold text-gray-900 mb-3">
              Personalized
            </h4>
            <p className="text-gray-600">
              Every recommendation is tailored to your body type, style
              preferences, and lifestyle.
            </p>
          </div>
          <div className="text-center bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
            <Award className="w-12 h-12 text-pink-600 mx-auto mb-4" />
            <h4 className="text-xl font-semibold text-gray-900 mb-3">
              Expert-Backed
            </h4>
            <p className="text-gray-600">
              Our AI is trained on insights from top fashion stylists and
              industry experts.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;
