import React from "react";
import { Link, useLocation } from "wouter";
import { AnimatedNav } from "./AnimatedNav";


const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [location] = useLocation();

  const isActive = (path: string) => location === path;

  return (
    <div className="min-h-screen">
    <div className="w-full h-full mt-24 flex bg-white">

      <aside className="w-64 bg-[#FFEEF0] p-6 flex flex-col rounded-tr-3xl rounded-br-3xl">
        <nav className="flex flex-col gap-8 mt-6">

          {/* Overview - active pill */}
          <Link href="/admin">
            <div
              aria-current={isActive("/admin") ? "page" : undefined}
              className={`w-full flex items-center gap-3 px-5 py-3 rounded-full cursor-pointer transition transform duration-300 ease-out ${isActive("/admin") ? "bg-[#A30000] text-white shadow-lg scale-[1.01]" : "text-[#A30000] hover:bg-[#ffdadc] hover:scale-105"}`}
            >
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center transition duration-300">
                {/* small pie icon */}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11 2v10H2a9 9 0 0 1 9-9z" fill="white" />
                  <path d="M13 13V3a1 1 0 0 1 1-1h.01A10 10 0 0 1 23 13H13z" fill="rgba(255,255,255,0.15)" />
                </svg>
              </div>
              <span className="text-base font-medium tracking-wide">Overview</span>
            </div>
          </Link>

          {/* Menu items */}
          <div className="flex flex-col gap-4 mt-2">
            <Link href="/admin/donors">
              <div
                aria-current={isActive("/admin/donors") ? "page" : undefined}
                className={`group flex items-center gap-3 px-3 py-2 rounded-lg transition transform duration-300 ease-out ${isActive("/donors") ? "text-[#A30000] font-semibold" : "text-[#A30000] hover:translate-x-2 hover:shadow-sm hover:bg-[#ffdadc]"}`}
              >
                <svg className="w-6 h-6 transition-transform duration-300 group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 12a4 4 0 100-8 4 4 0 000 8z" fill="#A30000" />
                  <path d="M4 20c0-4 4-6 8-6s8 2 8 6v1H4v-1z" fill="#A30000" />
                </svg>
                <span className="text-base tracking-wide">Donors</span>
              </div>
            </Link>

            <Link href="/admin/hospitals">
              <div
                aria-current={isActive("/admin/hospitals") ? "page" : undefined}
                className={`group flex items-center gap-3 px-3 py-2 rounded-lg transition transform duration-300 ease-out ${isActive("/hospitals") ? "text-[#A30000] font-semibold" : "text-[#A30000] hover:translate-x-2 hover:shadow-sm hover:bg-[#ffdadc]"}`}
              >
                <svg className="w-6 h-6 transition-transform duration-300 group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3" y="7" width="18" height="13" rx="2" fill="#A30000" />
                  <path d="M7 11h2v2H7v-2z" fill="#fff" opacity="0.08" />
                </svg>
                <span className="text-base tracking-wide">Hospitals</span>
              </div>
            </Link>

            {/* <Link href="/admin/analysis">
              <div
                aria-current={isActive("/admin/analysis") ? "page" : undefined}
                className={`group flex items-center gap-3 px-3 py-2 rounded-lg transition transform duration-300 ease-out ${isActive("/analysis") ? "text-[#A30000] font-semibold" : "text-[#A30000] hover:translate-x-2 hover:shadow-sm hover:bg-[#ffdadc]"}`}
              >
                <svg className="w-6 h-6 transition-transform duration-300 group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 2h12v4H6z" fill="#A30000" />
                  <path d="M4 8h16v10a2 2 0 01-2 2H6a2 2 0 01-2-2V8z" fill="#A30000" />
                </svg>
                <span className="text-base tracking-wide"></span>
              </div>
            </Link> */}

            <Link href="/admin/requests">
              <div
                aria-current={isActive("/admin/requests") ? "page" : undefined}
                className={`group flex items-center gap-3 px-3 py-2 rounded-lg transition transform duration-300 ease-out ${isActive("/requests") ? "text-[#A30000] font-semibold" : "text-[#A30000] hover:translate-x-2 hover:shadow-sm hover:bg-[#ffdadc]"}`}
              >
                <svg className="w-6 h-6 transition-transform duration-300 group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="5" y="4" width="14" height="16" rx="2" fill="#A30000" />
                  <path d="M7 8h10v2H7V8z" fill="#fff" opacity="0.08" />
                </svg>
                <span className="text-base tracking-wide">Requests</span>
              </div>
            </Link>
          </div>

        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10 overflow-y-auto">{children}</main>
    </div>
    </div>
  );
};

export default Layout;
