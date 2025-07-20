import React, { ReactNode } from "react";

type H2Props = {
  children: ReactNode; // Any valid React children
  className?: string
};

const H2: React.FC<H2Props> = ({ children, className }) => {
  return <h2 className={' text-[36px] font-bold text-gray-900 mb-8' + className}>{children}</h2>;
};

export default H2;
