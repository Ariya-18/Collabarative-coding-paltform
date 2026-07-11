import { Users } from "lucide-react";

const ParticipantsList = ({ participants }) => {
  return (
    <div className="flex flex-col gap-2 p-4">
      <div className="flex items-center gap-2 text-[#9CA3AF] text-xs font-medium uppercase tracking-wide">
        <Users size={14} />
        Participants ({participants.length})
      </div>
      {participants.map((p) => (
        <div key={p.userId} className="flex items-center gap-2 bg-[#111827] rounded-lg px-3 py-2">
          <div className="relative">
            {p.profilePicture ? (
              <img
                src={p.profilePicture}
                alt={p.name}
                className="h-7 w-7 rounded-full object-cover"
              />
            ) : (
              <div className="h-7 w-7 rounded-full bg-[#6366F1] flex items-center justify-center text-xs text-white font-medium">
                {p.name?.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-[#22C55E] border-2 border-[#111827]" />
          </div>
          <span className="text-sm text-white truncate">{p.name}</span>
        </div>
      ))}
    </div>
  );
};

export default ParticipantsList;