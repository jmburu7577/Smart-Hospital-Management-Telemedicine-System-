import { Outlet, useLocation } from "react-router";
import Header from "./Header";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import { useAuth } from "../../contexts/AuthContext";

export default function Layout() {
  const { user } = useAuth();
  const location = useLocation();

  // hide sidebar on landing page AND when not logged in
  const hideSidebar =
    location.pathname === "/" || !user;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />

      <div className="flex flex-1">
        {!hideSidebar && <Sidebar />}

        <main className="flex-1 p-6">
          <div className="max-w-[1200px] mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}