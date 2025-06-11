import { BookOpenIcon, HomeIcon, FolderGit2, UsersIcon } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

const SidebarItems = [
    {label: "Home", location:"/home", icon: <HomeIcon />},
    {label: "Learn",location: "/learn/courses", icon: <BookOpenIcon />},
    {label: "Pair Projects", location: "/pair-projects", icon: <FolderGit2 />},
    {label: "Community", location: "/community", icon: <UsersIcon />},

]

const SideBar = () => {
  const location = useLocation();
  const [activeItem, setactiveItem] = useState("Home")

  useEffect(() => {
    const currentPath = location.pathname;
    const activeItem = SidebarItems.find(item => item.location === currentPath);
    setactiveItem(activeItem?.label || "Home");
  }, [location]);

  return (
    <div className="sidebar-container">
    <div className="h-screen w-64 bg-white shadow-lg fixed left-0 top-0">
      <div className="p-4">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Learning Platform</h2>
        <nav className='flex flex-col gap-4 mt-20'>
          {SidebarItems.map((item, index) => (
            <Link key={index} to={item.location}>
              <div className={`flex items-center p-2 rounded-md hover:bg-gray-100 ${activeItem === item.label ? "bg-gray-100" : ""}`}>
                {item.icon}
                <span className="ml-3">{item.label}</span>
              </div>
            </Link>
          ))}
        </nav>
      </div>
    </div>
    </div>
  )
}

export default SideBar
