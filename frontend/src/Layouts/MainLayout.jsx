import SideBar from "@/components/SideBar";
import React from "react";
import { Outlet } from "react-router-dom";

const MainLayout = () => {
  return (
    <div className="flex min-h-screen gradient-bg-primary">
      <SideBar />
      <main className="flex-1 ml-64 transition-all duration-300 ease-in-out">
        <div className="min-h-screen relative">
          {/* Subtle overlay pattern for depth */}
          <div className="absolute inset-0 opacity-30 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-primary/5 to-secondary/10"></div>
          </div>
          
          {/* Main content */}
          <div className="relative z-10">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default MainLayout;