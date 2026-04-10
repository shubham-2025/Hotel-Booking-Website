import React from 'react';
import { assets } from '../../assets/assets';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  const sidebarLinks = [
    { name: "Dashboard", path: "/owner", icon: assets.dashboardIcon },
    { name: "Add Room", path: "/owner/add-room", icon: assets.addIcon },
    { name: "List Room", path: "/owner/list-room", icon: assets.listIcon },
  ];

  return (
    <div className="md:w-64 h-full border-r border-gray-200 bg-white pt-4 flex flex-col transition-all duration-300">
      {sidebarLinks.map((item, index) => (
        <NavLink
          to={item.path}
          key={index}
          end
          className={({ isActive }) =>
            `flex items-center gap-3 px-6 py-3 cursor-pointer transition-colors duration-200
            ${isActive 
              ? 'bg-blue-100 text-blue-600 border-r-4 border-blue-500 font-medium' 
              : 'text-gray-700 hover:bg-gray-100 border-r-4 border-transparent'}`
          }
        >
          <img src={item.icon} alt={item.name} className="h-5 w-5" />
          <span className="text-sm">{item.name}</span>
        </NavLink>
      ))}
    </div>
  );
};

export default Sidebar;
