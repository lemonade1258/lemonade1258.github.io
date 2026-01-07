import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Newspaper,
  LogOut,
  Flame,
  BookOpen,
  MapPin,
  Box,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const AdminLayout: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md transition-colors ${
      isActive
        ? "bg-brand-red text-white"
        : "text-slate-400 hover:text-white hover:bg-white/5"
    }`;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white fixed h-full z-20 hidden md:flex flex-col">
        <div className="h-20 flex items-center px-6 border-b border-white/10">
          <Flame className="w-6 h-6 text-brand-red mr-3" />
          <span className="font-bold tracking-wider">CLAIN ADMIN</span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          <NavLink to="/admin/dashboard" className={navClass}>
            <LayoutDashboard size={18} />
            Dashboard
          </NavLink>
          <NavLink to="/admin/contact" className={navClass}>
            <MapPin size={18} />
            Site Settings
          </NavLink>
          <NavLink to="/admin/news" className={navClass}>
            <Newspaper size={18} />
            News & Updates
          </NavLink>
          <NavLink to="/admin/people" className={navClass}>
            <Users size={18} />
            People & Faculty
          </NavLink>
          <NavLink to="/admin/publications" className={navClass}>
            <BookOpen size={18} />
            Publications
          </NavLink>
          <NavLink to="/admin/projects" className={navClass}>
            <Box size={18} />
            Projects
          </NavLink>
        </nav>

        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-400 hover:text-white w-full"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 min-h-screen flex flex-col">
        {/* Mobile Header */}
        <header className="md:hidden h-16 bg-slate-900 text-white flex items-center justify-between px-4">
          <span className="font-bold">CLAIN ADMIN</span>
          <button onClick={handleLogout}>
            <LogOut size={18} />
          </button>
        </header>

        <div className="p-8 flex-grow">
          <Outlet />
        </div>

        <footer className="px-8 py-4 text-center text-xs text-slate-400 border-t border-slate-200">
          NextGen Admin System v2.2
        </footer>
      </main>
    </div>
  );
};

export default AdminLayout;
