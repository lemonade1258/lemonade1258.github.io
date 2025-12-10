import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Menu,
  X,
  ChevronRight,
  Languages,
  LayoutDashboard,
} from "lucide-react";
import { LAB_NAME, LAB_FULL_NAME, UNIVERSITY_NAME } from "../constants";
import { useLanguage } from "../contexts/LanguageContext";

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { language, setLanguage, t } = useLanguage();

  // Hide Navbar on admin routes
  if (location.pathname.startsWith("/admin")) return null;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "zh" : "en");
  };

  const links = [
    { name: t("nav.tour"), path: "/" },
    { name: t("nav.news"), path: "/news" },
    { name: t("nav.people"), path: "/people" },
    // { name: t('nav.events'), path: '/events' }, // Removed
    { name: t("nav.publications"), path: "/publications" },
    { name: t("nav.contact"), path: "/contact" },
  ];

  const activeClass =
    "text-brand-red font-medium relative after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-full after:h-[1.5px] after:bg-brand-red";
  const inactiveClass =
    "text-slate-600 hover:text-brand-red-light transition-colors duration-200";

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-100"
          : "bg-white border-b border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo Section */}
          <div className="flex-shrink-0 flex items-center gap-3">
            <NavLink to="/" className="group flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center pt-1">
                <img
                  src="/clain_logo_icon.png"
                  alt="CLAIN Icon"
                  className="h-full w-auto object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    const parent = e.currentTarget.parentElement;
                    if (parent) {
                      parent.innerHTML = `<svg viewBox="0 0 100 100" class="w-full h-full text-brand-red" fill="currentColor"><path d="M50 10 C30 30 20 45 20 60 C20 80 35 95 50 95 C65 95 80 80 80 60 C80 45 70 30 50 10 Z" /></svg>`;
                    }
                  }}
                />
              </div>

              <div className="flex flex-col">
                <div className="flex items-baseline gap-2">
                  <h1 className="text-2xl font-bold tracking-tight text-brand-red font-sans">
                    {LAB_NAME}
                  </h1>
                  <span className="hidden md:block text-xs uppercase tracking-widest text-slate-400 font-medium">
                    {UNIVERSITY_NAME}
                  </span>
                </div>
                <span className="text-[10px] md:text-xs text-slate-500 font-normal leading-none group-hover:text-brand-dark transition-colors">
                  {LAB_FULL_NAME}
                </span>
              </div>
            </NavLink>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            <div className="flex space-x-8 text-sm tracking-wide">
              {links.map((link) => (
                <NavLink
                  key={link.name}
                  to={link.path}
                  className={({ isActive }) =>
                    isActive ? activeClass : inactiveClass
                  }
                >
                  {link.name}
                </NavLink>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
              <button
                onClick={toggleLanguage}
                className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-brand-dark transition-colors uppercase tracking-wider"
              >
                <Languages size={16} />
                {language === "en" ? "EN" : "中文"}
              </button>

              <NavLink
                to="/admin"
                className="text-slate-400 hover:text-brand-red transition-colors"
                title="Admin Login"
              >
                <LayoutDashboard size={16} />
              </NavLink>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden gap-4">
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1 text-xs font-bold text-slate-500"
            >
              <Languages size={18} />
              {language === "en" ? "EN" : "中文"}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-slate-900 focus:outline-none"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-b border-slate-100 h-screen animate-fade-in">
          <div className="px-6 pt-8 pb-3 space-y-4">
            {links.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                className={({ isActive }) =>
                  `flex items-center justify-between py-3 text-xl font-serif ${
                    isActive ? "text-brand-red" : "text-slate-800"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {link.name}
                    {isActive && <ChevronRight className="h-5 w-5" />}
                  </>
                )}
              </NavLink>
            ))}
            <NavLink
              to="/admin"
              className="flex items-center justify-between py-3 text-xl font-serif text-slate-400"
            >
              Admin
            </NavLink>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
