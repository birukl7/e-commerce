import React, { ReactNode } from "react";

type H5Props = {
  children: ReactNode; // Any valid React children
  className: string
};

const H5: React.FC<H5Props> = ({ children, className }) => {
  return <h5 className={''+ className }>{children}</h5>;
};

export default H5;
