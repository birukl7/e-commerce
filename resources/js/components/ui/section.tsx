import React, { ReactNode } from "react";

type SectionProps = {
  children: ReactNode; // Any valid React children
};

const Section: React.FC<SectionProps> = ({ children }) => {
  return <section className="container mx-auto">{children}</section>;
};

export default Section;
