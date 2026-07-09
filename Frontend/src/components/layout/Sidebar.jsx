import { NavLink } from "react-router-dom";
import { LayoutDashboard, Code2, Calendar, Settings, User } from "lucide-react";

const navItems = [
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { name: "Sessions", path: "/dashboard/sessions", icon: Code2 },
  { name: "Interviews", path: "/dashboard/interviews", icon: Calendar },
  { name: "Profile", path: "/profile", icon: User },
  { name: "Settings", path: "/settings", icon: Settings },
];

const Sidebar = () => {
  return (
    <aside className="hidden md:flex flex-col w-60 shrink-0 h-screen sticky top-0 bg-[#0B0F19] border-r border-white/5 px-4 py-6">
      <div className="flex items-center gap-2 px-2 mb-8">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center">
          <Code2 size={18} className="text-white" />
        </div>
        <span className="text-white font-semibold text-lg">CodeShare</span>
      </div>

      <nav className="flex flex-col gap-1">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            end={item.path === "/dashboard"}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? "bg-[#6366F1]/10 text-[#6366F1] font-medium"
                  : "text-[#9CA3AF] hover:text-white hover:bg-white/5"
              }`
            }
          >
            <item.icon size={18} />
            {item.name}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;