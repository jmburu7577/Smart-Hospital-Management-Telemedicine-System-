import { Link, useLocation } from "react-router";
import {
  Home,
  Calendar,
  FileText,
  Video,
  Pill,
  TestTube,
  CreditCard,
  Brain,
  Users,
  Settings,
  LayoutDashboard,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

export default function Sidebar() {
  const location = useLocation();
  const { user } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  // Define navigation items based on role
  const getNavItems = () => {
    // const common = [{ path: "/", icon: Home, label: "Home" }];
    const common = !user
      ? [{ path: "/", icon: Home, label: "Home" }]
      : [];
    
    if (!user) return common;

    const roleSpecific = [];
    if (user.role === 'patient') {
      roleSpecific.push(
        { path: "/patient/dashboard", icon: LayoutDashboard, label: "Dashboard" },
        { path: "/appointments/view", icon: Calendar, label: "My Appointments" },
        { path: "/ehr/records", icon: FileText, label: "Medical Records" },
        { path: "/telemedicine", icon: Video, label: "Telemedicine" },
        { path: "/pharmacy", icon: Pill, label: "Pharmacy" },
        { path: "/laboratory", icon: TestTube, label: "Lab Results" },
        { path: "/billing", icon: CreditCard, label: "Billing" },
        { path: "/symptom-checker", icon: Brain, label: "AI Checker" },
      );
    } else if (user.role === 'doctor') {
      roleSpecific.push(
        { path: "/doctor/dashboard", icon: LayoutDashboard, label: "Dashboard" },
        { path: "/appointments/schedule", icon: Calendar, label: "My Schedule" },
        { path: "/ehr/records", icon: Users, label: "Patient Records" },
        { path: "/telemedicine", icon: Video, label: "Video Consults" },
        { path: "/laboratory", icon: TestTube, label: "Lab Orders" },
      );
    } else if (user.role === 'admin') {
      roleSpecific.push(
        { path: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
        { path: "/users", icon: Users, label: "User Management" },
        { path: "/billing", icon: CreditCard, label: "Revenue" },
      );
    }

    return [
      ...common,
      ...roleSpecific,
      { path: "/profile", icon: Settings, label: "Settings" },
    ];
  };

  const navItems = getNavItems();

  return (
    <aside className="hidden lg:block w-64 bg-white border-r border-slate-200 min-h-[calc(100vh-73px)] sticky top-[73px]">
      <nav className="p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
                active
                  ? "bg-blue-600 text-white shadow-md shadow-blue-200 font-bold"
                  : "text-slate-600 hover:bg-slate-50 hover:text-blue-600 font-medium"
              }`}
            >
              <Icon className={`w-5 h-5 transition-colors ${active ? "text-white" : "text-slate-400 group-hover:text-blue-600"}`} />
              <span className="text-sm">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      
      {user && (
        <div className="absolute bottom-8 left-4 right-4 p-4 bg-blue-50 rounded-2xl border border-blue-100">
          <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest mb-1">Current Session</p>
          <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
          <p className="text-xs text-slate-500 font-medium">{user.email}</p>
        </div>
      )}
    </aside>
  );
}
