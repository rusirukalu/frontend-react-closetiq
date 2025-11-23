import React from "react";
import { Link } from "react-router-dom";

const GLOW_ACCENT = "shadow-[0_0_20px_rgba(255,255,255,0.3)]";

interface GlassButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "outline";
  className?: string;
  onClick?: () => void;
  to?: string;
}

const GlassButton: React.FC<GlassButtonProps> = ({
  children,
  variant = "primary",
  className = "",
  onClick,
  to,
}) => {
  let baseClasses = `
    relative overflow-hidden group
    inline-flex items-center justify-center px-8 py-4
    font-bold uppercase tracking-wider text-sm
    transition-all duration-300 ease-out
    rounded-full
    ${className}
  `;

  if (variant === "primary") {
    baseClasses += ` bg-white text-black hover:bg-gray-200 ${GLOW_ACCENT}`;
  } else if (variant === "secondary") {
    baseClasses += ` bg-white/10 text-white hover:bg-white/20 border border-white/10 backdrop-blur-md`;
  } else if (variant === "outline") {
    baseClasses += ` border border-white/30 text-white hover:bg-white/10`;
  }

  const content = (
    <>
      <span className="relative z-10 flex items-center gap-2">{children}</span>
      {variant === "primary" && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
      )}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={baseClasses}>
        {content}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={baseClasses}>
      {content}
    </button>
  );
};

export default GlassButton;
