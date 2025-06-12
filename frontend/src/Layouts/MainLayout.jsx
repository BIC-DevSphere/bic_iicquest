import SideBar from "@/components/SideBar";
import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";
import socketService from "@/services/socketService";

const MainLayout = () => {
  // Initialize WebSocket connection for authenticated users
  useEffect(() => {
    const initializeWebSocket = async () => {
      // Check for auth token (using both possible keys for compatibility)
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      
      if (token && !socketService.isSocketConnected()) {
        try {
          console.log('🚀 Initializing global WebSocket connection...');
          await socketService.connect(token);
          socketService.joinPeerLearning();
        } catch (error) {
          console.error('❌ Failed to initialize WebSocket:', error);
        }
      }
    };

    initializeWebSocket();

    // Cleanup WebSocket on unmount
    return () => {
      if (socketService.isSocketConnected()) {
        socketService.disconnect();
      }
    };
  }, []);

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