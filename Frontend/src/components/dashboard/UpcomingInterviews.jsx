import { CalendarClock } from "lucide-react";
import EmptyState from "../common/EmptyState";

const UpcomingInterviews = ({ interviews }) => {
  if (!interviews || interviews.length === 0) {
    return (
      <div className="bg-[#111827] border border-white/5 rounded-xl">
        <EmptyState
          icon={CalendarClock}
          title="No upcoming interviews"
          subtitle="Scheduled interviews will appear here."
        />
      </div>
    );
  }

  return (
    <div className="bg-[#111827] border border-white/5 rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-white/5">
        <h3 className="text-white font-medium text-sm">Upcoming Interviews</h3>
      </div>
      <div className="divide-y divide-white/5">
        {interviews.map((i) => (
          <div key={i._id} className="px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#F59E0B]/10 flex items-center justify-center">
                <CalendarClock size={16} className="text-[#F59E0B]" />
              </div>
              <div>
                <p className="text-white text-sm font-medium">{i.title}</p>
                <p className="text-[#9CA3AF] text-xs mt-0.5">
                  Host: {i.host?.name || "You"}
                </p>
              </div>
            </div>
            <span className="text-[#9CA3AF] text-xs">
              {new Date(i.scheduledAt).toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UpcomingInterviews;