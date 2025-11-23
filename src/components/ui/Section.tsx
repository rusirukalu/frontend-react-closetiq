import React from "react";

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
}

const Section: React.FC<SectionProps> = ({ children, className = "", id }) => {
  return (
    <section
      id={id}
      className={`py-24 px-4 md:px-8 relative overflow-hidden ${className}`}
    >
      <div className="max-w-7xl mx-auto relative z-10">{children}</div>
    </section>
  );
};

export default Section;
