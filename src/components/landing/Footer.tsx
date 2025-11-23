import React from "react";
import { Link } from "react-router-dom";
import { Sparkles, Twitter, Instagram, Facebook, Mail } from "lucide-react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-black border-t border-white/10 py-20 px-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="md:col-span-2 space-y-6">
          <Link to="/" className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-white" />
            <span className="text-2xl font-black uppercase tracking-widest text-white">
              ClosetIQ
            </span>
          </Link>
          <p className="text-gray-500 text-sm max-w-sm leading-relaxed">
            Engineered for the modern aesthete. ClosetIQ combines brutalist
            utility with refined intelligence.
          </p>
          <div className="flex gap-4">
            {[Twitter, Instagram, Facebook, Mail].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="text-gray-500 hover:text-white transition-colors"
              >
                <Icon className="w-5 h-5" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-white font-bold uppercase text-sm tracking-widest mb-6">
            Platform
          </h3>
          <ul className="space-y-4 text-gray-500 text-sm">
            {["Intelligence", "Database", "API Access", "Status"].map(
              (item) => (
                <li key={item}>
                  <a href="#" className="hover:text-white transition-colors">
                    {item}
                  </a>
                </li>
              )
            )}
          </ul>
        </div>

        <div>
          <h3 className="text-white font-bold uppercase text-sm tracking-widest mb-6">
            Legal
          </h3>
          <ul className="space-y-4 text-gray-500 text-sm">
            {[
              "Privacy Protocol",
              "Terms of Use",
              "Cookie Policy",
              "Security",
            ].map((item) => (
              <li key={item}>
                <a href="#" className="hover:text-white transition-colors">
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-gray-600 text-xs uppercase tracking-wider">
          &copy; {new Date().getFullYear()} ClosetIQ Systems Inc.
        </p>
        <div className="flex gap-2 items-center">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          <span className="text-gray-600 text-xs uppercase tracking-wider">
            All Systems Operational
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
