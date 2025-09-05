import React from "react";
import TopBar from "./TopBar";

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <TopBar />
      <main className="flex-grow">{children}</main>
      {/* You can add Footer here */}
    </div>
  );
};

export default Layout;
