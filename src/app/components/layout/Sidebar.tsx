import { Link, useLocation } from "react-router";
import { useAuth } from "../../contexts/AuthContext";
import { getNavItems } from "./navItems";

export default function Sidebar() {
  const location = useLocation();
  const { user } = useAuth();
  const navItems = getNavItems(user);

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside className="hidden lg:block w-64 bg-white border-r border-slate-200 min-h-[calc(100vh-73px)] sticky top-[73px]">
      <nav className="p-4 space-y-1 pb-40">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${active
                  ? "bg-blue-600 text-white shadow-md shadow-blue-200 font-bold"
                  : "text-slate-600 hover:bg-slate-50 hover:text-blue-600 font-medium"
                }`}
            >
              <Icon
                className={`w-5 h-5 transition-colors ${active ? "text-white" : "text-slate-400 group-hover:text-blue-600"
                  }`}
              />
              <span className="text-sm">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {user && (
        <div className="absolute bottom-8 left-4 right-4 p-4 bg-blue-50 rounded-2xl border border-blue-100">
          <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest mb-1">
            Current Session
          </p>
          <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
          <p className="text-xs text-slate-500 font-medium">{user.email}</p>
        </div>
      )}
    </aside>
  );
}