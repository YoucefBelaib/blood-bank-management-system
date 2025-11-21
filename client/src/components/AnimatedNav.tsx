import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Droplet, Heart, Users, Info } from "lucide-react";
import { useEffect, useState } from "react";

export function AnimatedNav() {
  const [location] = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { href: "/", label: "Home", icon: Heart, testId: "nav-home" },
    { href: "/donate", label: "Donate Blood", icon: Droplet, testId: "nav-donate" },
    { href: "/request", label: "Request Blood", icon: Users, testId: "nav-request" },
    { href: "/about", label: "About Us", icon: Info, testId: "nav-about" },
  ];

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white/90 backdrop-blur-md shadow-lg" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <motion.div
            className="flex items-center gap-3"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="relative">
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-12 h-12 gradient-red-primary rounded-full flex items-center justify-center shadow-lg"
              >
                <Droplet className="w-6 h-6 text-white fill-white" />
              </motion.div>
              <motion.div
                className="absolute inset-0 gradient-red-primary rounded-full blur-xl opacity-50"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">VitaBlood</span>
          </motion.div>

          <nav className="hidden md:flex items-center gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href;
              
              return (
                <Link key={item.href} href={item.href} data-testid={item.testId}>
                  <motion.div
                    className="relative px-4 py-2 rounded-lg cursor-pointer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${isActive ? "text-red-600" : "text-red-900"}`} />
                      <span
                        className={`font-medium transition-colors ${
                          isActive ? "text-red-600" : "text-red-900 hover:text-red-600"
                        }`}
                      >
                        {item.label}
                      </span>
                    </div>
                    {isActive && (
                      <motion.div
                        layoutId="activeNav"
                        className="absolute bottom-0 left-0 right-0 h-0.5 gradient-red-primary rounded-full"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                  </motion.div>
                </Link>
              );
            })}
          </nav>

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="md:hidden"
          >
            <button className="p-2 rounded-lg hover:bg-red-50 transition-colors">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </motion.div>
        </div>
      </div>
    </motion.header>
  );
}
