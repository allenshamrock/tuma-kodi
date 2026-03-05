import {
  LayoutDashboard,
  Building2,
  Users,
  CreditCard,
  BarChart3,
  Settings,
  LogOut,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
export const MainNav = [
  { title: "Dashboard", path: "/", icon: LayoutDashboard },
  { title: "Properties", path: "/properties", icon: Building2 },
  { title: "Tenants", path: "/tenants", icon: Users },
  { title: "Payments", path: "/payments", icon: CreditCard },
  { title: "Reports", path: "/reports", icon: BarChart3 },
];
export const BottomNav=[
    { title: "Settings", path: "/settings", icon: Settings },
]


export const DesignSystemAside = () => {
  const location = useLocation();

  const renderNavItem = (item: any) => {
    const Icon = item.icon;
    const isActive = location.pathname === item.path;

    return (
      <Link
        key={item.path}
        to={item.path}
        className={`flex items-center gap-3 py-2 px-4 rounded-lg transition-colors duration-200
        ${
          isActive
            ? "bg-primary-hover text-white"
            : "text-gray-400 hover:bg-primary-hover hover:text-white"
        }`}
      >
        <Icon size={18} />
        <span>{item.title}</span>
      </Link>
    );
  };

  return (
    <div className="bg-primary h-screen w-[240px] flex flex-col">
      <div className="my-6 px-4">
        <img src="" alt="Tuma kodi" />
      </div>

      <div className="flex flex-col gap-1">{MainNav.map(renderNavItem)}</div>

      <div className="mt-auto mb-6 flex flex-col gap-1">
        {BottomNav.map(renderNavItem)}

        <Link
          to="/logout"
          className="flex items-center gap-3 py-2 px-4 text-gray-400 hover:bg-red-600 hover:text-white rounded-lg transition-colors duration-200"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </Link>
      </div>
    </div>
  );
};
