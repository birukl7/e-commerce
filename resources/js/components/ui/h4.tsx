import React, { ReactNode } from "react";

type H4Props = {
  children: ReactNode; // Any valid React children
  className?: string
};

const H4: React.FC<H4Props> = ({ children, className }) => {
  return <h4 className={''+ className }>{children}</h4>;
};

export default H4;
