import SideBar from "@/components/SideBar";
import React from "react";
import { Outlet } from "react-router-dom";

const MainLayout = () => {
  return (
    <div className="flex min-h-screen">
      <SideBar />
      <main className="flex-1 ml-72 mr-8">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;