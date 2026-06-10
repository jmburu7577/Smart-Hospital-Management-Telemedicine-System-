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

export const getNavItems = (user: any) => {
    if (!user) return [{ path: "/", icon: Home, label: "Home" }];

    const items: { path: string; icon: any; label: string }[] = [];

    if (user.role === "patient") {
        items.push(
            { path: "/patient/dashboard", icon: LayoutDashboard, label: "Dashboard" },
            { path: "/appointments/view", icon: Calendar, label: "My Appointments" },
            { path: "/ehr/records", icon: FileText, label: "Medical Records" },
            { path: "/telemedicine", icon: Video, label: "Telemedicine" },
            { path: "/pharmacy", icon: Pill, label: "Pharmacy" },
            { path: "/laboratory", icon: TestTube, label: "Lab Results" },
            { path: "/billing", icon: CreditCard, label: "Billing" },
            { path: "/symptom-checker", icon: Brain, label: "AI Checker" }
        );
    } else if (user.role === "doctor") {
        items.push(
            { path: "/doctor/dashboard", icon: LayoutDashboard, label: "Dashboard" },
            { path: "/appointments/schedule", icon: Calendar, label: "My Schedule" },
            { path: "/ehr/records", icon: Users, label: "Patient Records" },
            { path: "/telemedicine", icon: Video, label: "Video Consults" },
            { path: "/laboratory", icon: TestTube, label: "Lab Orders" }
        );
    } else if (user.role === "admin") {
        items.push(
            { path: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
            { path: "/users", icon: Users, label: "User Management" },
            { path: "/billing", icon: CreditCard, label: "Revenue" }
        );
    }

    items.push({ path: "/profile", icon: Settings, label: "Settings" });

    return items;
};