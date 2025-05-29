import Navbar from "./Navbar";
import React, { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}
const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center">
      <div className="w-full px-4 md:w-3/4 md:mx-auto">
        <Navbar />
        <main className="mt-4">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
