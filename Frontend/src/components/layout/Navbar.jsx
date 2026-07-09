import { useAuth } from "../../context/AuthContext";
import NotificationBell from "../dashboard/NotificationBell";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="h-16 sticky top-0 z-30 bg-[#0B0F19]/80 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-6">
      <div>
        <h1 className="text-white font-semibold text-base">
          Welcome back, {user?.name?.split(" ")[0] || "there"} 👋
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <NotificationBell />
        <button
          onClick={() => navigate("/profile")}
          className="w-9 h-9 rounded-lg overflow-hidden border border-white/10"
        >
          {user?.profilePicture ? (
            <img
              src={user.profilePicture}
              alt="profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center text-white text-sm font-medium">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </div>
          )}
        </button>
      </div>
    </header>
  );
};

export default Navbar;