import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sparkles, Menu, X } from "lucide-react";
import { auth } from "../../config/firebase";
import { signOut, onAuthStateChanged, User } from "firebase/auth";
import GlassButton from "../ui/GlassButton";

const Navbar: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => {
      unsubscribe();
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <nav
      className={`fixed top-8 left-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? "bg-black/50 backdrop-blur-xl border-b border-white/5 py-4"
          : "bg-transparent py-6"
      }`}
    >
      <div className="flex items-center justify-between px-4 mx-auto max-w-7xl">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="p-2 transition-colors border bg-white/10 rounded-xl border-white/10 group-hover:bg-white/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-black tracking-widest text-white uppercase">
            ClosetIQ
          </span>
        </Link>

        {/* Desktop Menu */}
        <div className="items-center hidden gap-8 md:flex">
          {user ? (
            <>
              <span className="text-sm font-medium text-gray-300">
                {user.displayName || user.email?.split("@")[0]}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-sm font-bold text-white transition-colors hover:text-gray-300"
              >
                LOGOUT
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-bold tracking-wider text-gray-300 uppercase transition-colors hover:text-white"
              >
                Login
              </Link>
              <GlassButton
                to="/register"
                variant="primary"
                className="!py-2 !px-6 !text-xs"
              >
                Get Started
              </GlassButton>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="text-white md:hidden"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="absolute left-0 flex flex-col w-full gap-4 p-4 border-b md:hidden top-full bg-black/90 backdrop-blur-2xl border-white/10">
          {user ? (
            <>
              <div className="p-2 text-sm text-gray-400">
                {user.displayName || user.email}
              </div>
              <button
                onClick={handleLogout}
                className="p-2 font-bold text-left text-white"
              >
                LOGOUT
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="p-2 font-bold text-white">
                LOGIN
              </Link>
              <Link
                to="/register"
                className="p-2 font-bold text-center text-black bg-white rounded-lg"
              >
                GET STARTED
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
