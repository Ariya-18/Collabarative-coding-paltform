import { useState, useEffect, useRef } from "react";
import { Bell, Check, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from "../../services/notificationService";
import toast from "react-hot-toast";

const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const ref = useRef(null);

  const fetchNotifications = async () => {
    try {
      const res = await getNotifications();
      setNotifications(res.data);
      setUnreadCount(res.unreadCount);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await markNotificationAsRead(id);
      fetchNotifications();
    } catch (err) {
      toast.error("Failed to update notification");
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsAsRead();
      fetchNotifications();
    } catch (err) {
      toast.error("Failed to update notifications");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteNotification(id);
      fetchNotifications();
    } catch (err) {
      toast.error("Failed to delete notification");
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative w-9 h-9 rounded-lg bg-[#111827] border border-white/5 flex items-center justify-center text-[#9CA3AF] hover:text-white transition-colors"
      >
        <Bell size={17} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#EF4444] text-white text-[10px] flex items-center justify-center font-medium">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-80 bg-[#111827] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
              <h3 className="text-white text-sm font-medium">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs text-[#6366F1] hover:text-[#8B5CF6] transition-colors"
                >
                  Mark all read
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="text-[#9CA3AF] text-sm text-center py-8">
                  No notifications yet
                </p>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n._id}
                    className={`px-4 py-3 border-b border-white/5 flex items-start gap-2 ${
                      !n.isRead ? "bg-[#6366F1]/5" : ""
                    }`}
                  >
                    <div className="flex-1">
                      <p className="text-white text-sm font-medium">{n.title}</p>
                      <p className="text-[#9CA3AF] text-xs mt-0.5">{n.message}</p>
                    </div>
                    <div className="flex flex-col gap-1">
                      {!n.isRead && (
                        <button
                          onClick={() => handleMarkRead(n._id)}
                          className="text-[#22C55E] hover:opacity-80"
                        >
                          <Check size={14} />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(n._id)}
                        className="text-[#EF4444] hover:opacity-80"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;