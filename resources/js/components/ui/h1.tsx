import React, { ReactNode } from "react";

type H1Props = {
  children: ReactNode; // Any valid React children
  className?: string
};

const H1: React.FC<H1Props> = ({ children, className }) => {
  return <h1 className={' ' + className}>{children}</h1>;
};

export default H1;
