import React, { ReactNode } from "react";

type H1Props = {
  children: ReactNode; // Any valid React children
  className?: string
};

const H1: React.FC<H1Props> = ({ children, className }) => {
  return <h1 className={'text-[26px] font-bold text-gray-900 mb-8 ' + className}>{children}</h1>;
};

export default H1;
