import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import { Menu, User, Bell, LogOut } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { getNavItems } from "./navItems";

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const avatar = localStorage.getItem("avatar");
  const navItems = getNavItems(user);

  const getHomeRoute = () => {
    if (!user) return "/";
    switch (user.role) {
      case "admin": return "/admin/dashboard";
      case "doctor": return "/doctor/dashboard";
      case "patient": return "/patient/dashboard";
      default: return "/";
    }
  };

  const homeRoute = getHomeRoute();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isLandingPage = location.pathname === "/" && !user;

  return (
    <header className="bg-slate-100 border-b border-slate-200 shadow-sm sticky top-0 z-50">
      <div className="px-6 py-4 flex items-center justify-between">
        {/* LEFT */}
        <div className="flex items-center gap-4">
          {user ? (
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden p-2 hover:bg-slate-100 rounded-lg"
            >
              <Menu className="w-6 h-6 text-slate-700" />
            </button>
          ) : null}

          <Link to={homeRoute} className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-xl">A</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-slate-900">AfyaConnect</h1>
              <p className="text-[10px] text-blue-600 font-bold uppercase">Smart Healthcare</p>
            </div>
          </Link>
        </div>

        {/* CENTER NAV (landing page only) */}
        {isLandingPage && (
          <nav className="hidden md:flex items-center gap-6">
            <a href="#features">Features</a>
            <a href="#how-it-works">How It Works</a>
            <a href="#specialists">Our Specialists</a>
            <a href="#testimonials">Testimonials</a>
            <a href="#why">Why AfyaConnect</a>
            <a href="#faq">FAQ</a>
          </nav>
        )}

        {/* RIGHT */}
        <div className="flex items-center gap-3">
          <button className="p-2 relative">
            <Bell className="w-5 h-5 text-slate-600" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          <div className="h-8 w-px bg-slate-200 mx-2"></div>

          {user ? (
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-900">{user.name}</p>
                <p className="text-[10px] text-slate-500 uppercase">{user.role}</p>
              </div>

              <Link
                to="/profile"
                className="w-9 h-9 rounded-full overflow-hidden border border-slate-500 bg-slate-100 flex items-center justify-center"
              >
                {avatar ? (
                  <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-5 h-5 text-slate-600" />
                )}
              </Link>

              <button onClick={handleLogout} className="p-2 hover:text-red-600" title="Logout">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>

      {/* MOBILE MENU */}
      {user && menuOpen && (
        <div className="lg:hidden absolute top-16 left-0 w-full bg-white border-t border-slate-200 shadow-md z-50">

          {user && (
            <div className="px-4 py-3 border-b border-slate-200">
              <p className="font-bold text-slate-900">{user.name}</p>
              <p className="text-xs text-slate-500 uppercase">
                {user.role}
              </p>
            </div>
          )}

          <div className="flex flex-col p-3">
            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-700 hover:bg-slate-100"
                >
                  <Icon className="w-5 h-5 text-slate-500" />
                  <span className="text-sm font-medium">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}