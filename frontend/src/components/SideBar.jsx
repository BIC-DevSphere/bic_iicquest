import { BookOpenIcon, HomeIcon, FolderGit2, UsersIcon, BriefcaseBusiness, GraduationCap, Sparkles } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

const SidebarItems = [
  { label: "Home", location: "/home", icon: <HomeIcon className="w-5 h-5" /> },
  { label: "Learn", location: "/learn/courses", icon: <BookOpenIcon className="w-5 h-5" /> },
  { label: "Pair Projects", location: "/pair-projects", icon: <FolderGit2 className="w-5 h-5" /> },
  { label: "Community", location: "/community", icon: <UsersIcon className="w-5 h-5" /> },
  { label: "Jobs", location: "/jobs", icon: <BriefcaseBusiness className="w-5 h-5" /> },
];

const SideBar = () => {
  const location = useLocation();
  const [activeItem, setactiveItem] = useState("Home");

  useEffect(() => {
    const currentPath = location.pathname;
    const activeItem = SidebarItems.find((item) => item.location === currentPath);
    setactiveItem(activeItem?.label || "Home");
  }, [location]);

  return (
    <div className="sidebar-container">
      <div className="h-screen w-64 bg-sidebar border-r border-sidebar-border fixed left-0 top-0 shadow-professional backdrop-blur-sm">
        {/* Elegant gradient overlay */}
        <div className="absolute inset-0 gradient-bg-card opacity-95"></div>
        
        {/* Content */}
        <div className="relative z-10">
          {/* Header with sophisticated branding */}
          <div className="p-6 border-b border-sidebar-border/50">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center shadow-elegant">
                <GraduationCap className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-sidebar-foreground tracking-tight">IIC Quest</h2>
                <p className="text-xs text-sidebar-foreground/70 font-medium">Interactive Learning</p>
              </div>
            </div>
          </div>

          {/* Navigation with elegant styling */}
          <nav className="flex flex-col gap-2 p-6 mt-2">
            {SidebarItems.map((item, index) => (
              <Link key={index} to={item.location} className="group">
                <div
                  className={`flex items-center p-4 rounded-2xl transition-all duration-300 ease-out group-hover:scale-[1.02] ${
                    activeItem === item.label 
                      ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-professional transform scale-[1.02]" 
                      : "text-sidebar-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent/50"
                  }`}
                >
                  <div className={`mr-4 transition-all duration-300 ${
                    activeItem === item.label ? "text-sidebar-primary-foreground" : "text-sidebar-foreground/70 group-hover:text-sidebar-accent-foreground"
                  }`}>
                    {item.icon}
                  </div>
                  <span className="font-semibold text-sm tracking-wide">{item.label}</span>
                  {activeItem === item.label && (
                    <div className="ml-auto flex items-center">
                      <Sparkles className="w-4 h-4 text-sidebar-primary-foreground/80 animate-pulse-elegant" />
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </nav>

          {/* Elegant bottom section */}
          <div className=" bottom-2 left-6 right-6">
            <div className="glass-card-subtle rounded-2xl p-5 border border-sidebar-border/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full gradient-secondary flex items-center justify-center shadow-elegant">
                  <span className="text-sm font-bold text-sidebar-foreground">U</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-sidebar-foreground truncate">Student</p>
                  <p className="text-xs text-sidebar-foreground/60 truncate">Learning Journey</p>
                </div>
              </div>
              
              {/* Progress indicator */}
              <div className="mt-3 pt-3 border-t border-sidebar-border/30">
                <div className="flex items-center justify-between text-xs text-sidebar-foreground/70 mb-1">
                  <span>Progress</span>
                  <span>75%</span>
                </div>
                <div className="w-full bg-sidebar-border/40 rounded-full h-1.5">
                  <div className="gradient-primary h-1.5 rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SideBar;
