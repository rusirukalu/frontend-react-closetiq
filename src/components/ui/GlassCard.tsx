import React from "react";

const GLASS_CLASSES =
  "bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)]";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
}

const GlassCard: React.FC<GlassCardProps> = ({ children, className = "" }) => {
  return (
    <div
      className={`
      ${GLASS_CLASSES}
      p-8 rounded-3xl
      hover:bg-white/10 transition-colors duration-300
      ${className}
    `}
    >
      {children}
    </div>
  );
};

export default GlassCard;
