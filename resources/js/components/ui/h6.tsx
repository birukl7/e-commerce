import React, { ReactNode } from "react";

type H6Props = {
  children: ReactNode; // Any valid React children
  className?: string
};

const H6: React.FC<H6Props> = ({ children, className }) => {
  return <h6 className={''+ className }>{children}</h6>;
};

export default H6;
