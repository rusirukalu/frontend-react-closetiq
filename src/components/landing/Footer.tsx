import React from "react";
import { Link } from "react-router-dom";
import { Sparkles, Mail, Twitter, Instagram, Facebook } from "lucide-react";

const Footer: React.FC = () => {
  return (
    <footer className="min-h-screen flex flex-col justify-center bg-gray-900 text-gray-300 px-4 py-20">
      <div className="max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand Section */}
          <div className="md:col-span-2">
            <Link
              to="/"
              className="flex items-center space-x-2 text-2xl font-bold text-white mb-6"
            >
              <Sparkles className="w-8 h-8 text-purple-400" />
              <span>ClosetIQ</span>
            </Link>
            <p className="text-gray-400 text-lg leading-relaxed mb-6 max-w-md">
              Revolutionizing personal style through artificial intelligence.
              Discover your perfect look with our AI-powered fashion assistant.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="bg-gray-800 p-3 rounded-lg hover:bg-purple-600 transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="bg-gray-800 p-3 rounded-lg hover:bg-purple-600 transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="bg-gray-800 p-3 rounded-lg hover:bg-purple-600 transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="bg-gray-800 p-3 rounded-lg hover:bg-purple-600 transition-colors"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-6">Product</h3>
            <ul className="space-y-4">
              <li>
                <Link
                  to="/register"
                  className="hover:text-purple-400 transition-colors"
                >
                  Get Started
                </Link>
              </li>
              <li>
                <a
                  href="#features"
                  className="hover:text-purple-400 transition-colors"
                >
                  Features
                </a>
              </li>
              <li>
                <a
                  href="#pricing"
                  className="hover:text-purple-400 transition-colors"
                >
                  Pricing
                </a>
              </li>
              <li>
                <a
                  href="#api"
                  className="hover:text-purple-400 transition-colors"
                >
                  API
                </a>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-6">Company</h3>
            <ul className="space-y-4">
              <li>
                <a
                  href="#about"
                  className="hover:text-purple-400 transition-colors"
                >
                  About Us
                </a>
              </li>
              <li>
                <a
                  href="#careers"
                  className="hover:text-purple-400 transition-colors"
                >
                  Careers
                </a>
              </li>
              <li>
                <a
                  href="#blog"
                  className="hover:text-purple-400 transition-colors"
                >
                  Blog
                </a>
              </li>
              <li>
                <a
                  href="#contact"
                  className="hover:text-purple-400 transition-colors"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="bg-gray-800 rounded-2xl p-8 mb-12">
          <div className="text-center">
            <h3 className="text-white font-semibold text-2xl mb-4">
              Stay Updated
            </h3>
            <p className="text-gray-400 mb-6">
              Get the latest fashion insights and AI updates delivered to your
              inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 border border-gray-600 focus:border-purple-400 focus:outline-none"
              />
              <button className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 mb-4 md:mb-0">
              &copy; {new Date().getFullYear()} ClosetIQ. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <a
                href="#privacy"
                className="text-gray-400 hover:text-purple-400 transition-colors"
              >
                Privacy Policy
              </a>
              <a
                href="#terms"
                className="text-gray-400 hover:text-purple-400 transition-colors"
              >
                Terms of Service
              </a>
              <a
                href="#cookies"
                className="text-gray-400 hover:text-purple-400 transition-colors"
              >
                Cookie Policy
              </a>
            </div>
          </div>
          <div className="text-center mt-8">
            <p className="text-sm text-gray-500">
              Made with <span className="text-red-400">❤️</span> by the ClosetIQ
              Team
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
