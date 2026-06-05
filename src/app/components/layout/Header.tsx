import { Link, useNavigate } from "react-router";
import { Menu, User, Bell, LogOut } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="bg-slate-100 border-b border-slate-200 shadow-sm sticky top-0 z-50">
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button className="lg:hidden p-2 hover:bg-slate-100 rounded-lg">
            <Menu className="w-6 h-6 text-slate-700" />
          </button>
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-xl">A</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">AfyaConnect</h1>
              <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest">Smart Healthcare</p>
            </div>
          </Link>
        </div>

        {/* <nav className="hidden md:flex items-center gap-6">
          <Link to="/appointments/book" className="text-slate-600 hover:text-blue-600 font-semibold text-sm transition-colors">
            Appointments
          </Link>
          <Link to="/telemedicine" className="text-slate-600 hover:text-blue-600 font-semibold text-sm transition-colors">
            Telemedicine
          </Link>
          <Link to="/ehr/records" className="text-slate-600 hover:text-blue-600 font-semibold text-sm transition-colors">
            Medical Records
          </Link>
          <Link to="/symptom-checker" className="text-slate-600 hover:text-blue-600 font-semibold text-sm transition-colors">
            AI Checker
          </Link>
        </nav> */}

        <div className="flex items-center gap-3">
          <button className="p-2 hover:bg-slate-100 rounded-lg relative transition-colors">
            <Bell className="w-5 h-5 text-slate-600" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
          
          <div className="h-8 w-px bg-slate-200 mx-2"></div>
          
          {user ? (
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-900 leading-none">{user.name}</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase mt-1 tracking-tighter">{user.role}</p>
              </div>
              <Link to="/profile" className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center hover:bg-slate-200 transition-colors border border-slate-200">
                <User className="w-5 h-5 text-slate-600" />
              </Link>
              <button 
                onClick={handleLogout}
                className="p-2 hover:bg-red-50 text-slate-600 hover:text-red-600 rounded-lg transition-all"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <Link 
              to="/login" 
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
