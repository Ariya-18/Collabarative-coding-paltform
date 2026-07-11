import { useEffect, useState } from "react";
import { Plus, LogIn, Layers, Video, Activity, CheckCircle2 } from "lucide-react";
import StatsCard from "../../components/dashboard/StatsCard";
import RecentSessions from "../../components/dashboard/RecentSessions";
import UpcomingInterviews from "../../components/dashboard/UpcomingInterviews";
import CreateRoomModal from "../../components/dashboard/CreateRoomModal";
import JoinRoomModal from "../../components/dashboard/JoinRoomModal";
import Loader from "../../components/common/Loader";
import { getDashboardStats } from "../../services/dashboardService";
import { getMySessions, getUpcomingInterviews } from "../../services/roomService";
import toast from "react-hot-toast";

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, sessionsRes, interviewsRes] = await Promise.all([
        getDashboardStats(),
        getMySessions(),
        getUpcomingInterviews(),
      ]);
     setStats(statsRes.data.data);
setSessions(sessionsRes.data.data);
setInterviews(interviewsRes.data.data);
    } catch (err) {
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <Loader fullScreen />;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-white text-xl font-semibold">Dashboard</h2>
          <p className="text-[#9CA3AF] text-sm mt-1">
            Overview of your coding sessions and interviews
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowJoinModal(true)}
            className="flex items-center gap-2 bg-[#111827] border border-white/10 hover:border-white/20 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
          >
            <LogIn size={16} /> Join Room
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-[#6366F1] hover:bg-[#6366F1]/90 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
          >
            <Plus size={16} /> Create Room
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard icon={Layers} label="Total Rooms" value={stats?.totalRooms ?? 0} color="primary" />
        <StatsCard icon={Video} label="Interviews" value={stats?.totalInterviews ?? 0} color="secondary" />
        <StatsCard icon={Activity} label="Active Rooms" value={stats?.activeRooms ?? 0} color="accent" />
        <StatsCard icon={CheckCircle2} label="Completed" value={stats?.completedSessions ?? 0} color="success" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <RecentSessions sessions={sessions} />
        <UpcomingInterviews interviews={interviews} />
      </div>

      <CreateRoomModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} />
      <JoinRoomModal isOpen={showJoinModal} onClose={() => setShowJoinModal(false)} />
    </div>
  );
};

export default Dashboard;