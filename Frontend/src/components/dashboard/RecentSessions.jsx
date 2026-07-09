import { Clock, Code2, Users } from "lucide-react";
import EmptyState from "../common/EmptyState";
import { useNavigate } from "react-router-dom";

const statusColor = {
  active: "text-[#22C55E] bg-[#22C55E]/10",
  scheduled: "text-[#F59E0B] bg-[#F59E0B]/10",
  ended: "text-[#9CA3AF] bg-white/5",
};

const RecentSessions = ({ sessions }) => {
  const navigate = useNavigate();

  if (!sessions || sessions.length === 0) {
    return (
      <div className="bg-[#111827] border border-white/5 rounded-xl">
        <EmptyState
          icon={Code2}
          title="No sessions yet"
          subtitle="Create or join a room to get started with your first coding session."
        />
      </div>
    );
  }

  return (
    <div className="bg-[#111827] border border-white/5 rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-white/5">
        <h3 className="text-white font-medium text-sm">Recent Sessions</h3>
      </div>
      <div className="divide-y divide-white/5">
        {sessions.map((s) => (
          <div
            key={s._id}
            onClick={() => navigate(`/room/${s.roomId}`)}
            className="px-5 py-4 flex items-center justify-between hover:bg-white/[0.02] cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#6366F1]/10 flex items-center justify-center">
                <Code2 size={16} className="text-[#6366F1]" />
              </div>
              <div>
                <p className="text-white text-sm font-medium">{s.title}</p>
                <p className="text-[#9CA3AF] text-xs flex items-center gap-1 mt-0.5">
                  <Users size={12} /> {s.participants?.length || 1} participant(s)
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${statusColor[s.status]}`}
              >
                {s.status}
              </span>
              <span className="text-[#9CA3AF] text-xs flex items-center gap-1">
                <Clock size={12} />
                {new Date(s.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentSessions;