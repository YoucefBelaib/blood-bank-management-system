import React from "react";
import logo from '../../public/figmaAssets/logo.png'

const Dashboardnav = () => {
  return (
    <nav className="w-full bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        
        {/* Logo */}
        <div className="flex items-center gap-2">
          <img src={logo} alt="Logo" className="h-10 w-10 object-contain" />
          <span className="text-xl font-semibold text-red-600">VitaBlood</span>
        </div>

        {/* Navigation Links */}
        <ul className="flex items-center gap-10 text-[17px]">
          <li className="flex items-center gap-1 text-red-500 font-medium cursor-pointer">
            <span>❤️</span>
            <span>Home</span>
          </li>

          <li className="flex items-center gap-1 text-gray-700 cursor-pointer">
            <span>💧</span>
            <span>Donate Blood</span>
          </li>

          <li className="flex items-center gap-1 text-gray-700 cursor-pointer">
            <span>👥</span>
            <span>Request Blood</span>
          </li>

          <li className="flex flex-col items-center text-gray-700 cursor-pointer">
            <div className="flex items-center gap-1">
              <span>🩸</span>
              <span>Overview</span>
            </div>
            <div className="w-12 h-[2px] bg-red-500 rounded-full mt-1"></div>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Dashboardnav;
