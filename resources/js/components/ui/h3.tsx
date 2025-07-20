import React, { ReactNode } from "react";

type H3Props = {
  children: ReactNode; // Any valid React children
  className?: string
};

const H3: React.FC<H3Props> = ({ children, className }) => {
  return <h3 className={' text-[20px]'+ className }>{children}</h3>;
};

export default H3;
