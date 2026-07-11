import { Copy, LogOut, Play, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

const LANGUAGES = [
  { value: "javascript", label: "JavaScript" },
  { value: "python", label: "Python" },
  { value: "cpp", label: "C++" },
  { value: "java", label: "Java" },
];

const RoomHeader = ({ room, language, onLanguageChange, onRun, running, onLeave }) => {
  const copyRoomId = () => {
    navigator.clipboard.writeText(room.roomId);
    toast.success("Room ID copied");
  };

  return (
    <div className="flex items-center justify-between px-5 py-3 border-b border-white/10 bg-[#111827]">
      <div className="flex items-center gap-3">
        <h1 className="text-white font-semibold text-sm">{room.title}</h1>
        <button
          onClick={copyRoomId}
          className="flex items-center gap-1.5 bg-[#0B0F19] border border-white/10 rounded-md px-2.5 py-1 text-xs text-[#9CA3AF] hover:text-white transition-colors"
        >
          {room.roomId}
          <Copy size={12} />
        </button>
      </div>

      <div className="flex items-center gap-3">
        <select
          value={language}
          onChange={(e) => onLanguageChange(e.target.value)}
          className="bg-[#0B0F19] border border-white/10 rounded-md px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#6366F1]"
        >
          {LANGUAGES.map((l) => (
            <option key={l.value} value={l.value}>
              {l.label}
            </option>
          ))}
        </select>

        <button
          onClick={onRun}
          disabled={running}
          className="flex items-center gap-1.5 bg-[#22C55E] hover:bg-[#22C55E]/90 disabled:opacity-60 text-white text-xs font-medium px-3 py-1.5 rounded-md transition-colors"
        >
          {running ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
          Run
        </button>

        <button
          onClick={onLeave}
          className="flex items-center gap-1.5 text-[#EF4444] hover:bg-[#EF4444]/10 text-xs font-medium px-2.5 py-1.5 rounded-md transition-colors"
        >
          <LogOut size={14} />
          Leave
        </button>
      </div>
    </div>
  );
};

export default RoomHeader;