import { useState } from "react";
import { Copy, LogOut, Play, Loader2, ChevronDown } from "lucide-react";
import toast from "react-hot-toast";
import LanguagePickerModal from "./LanguagePickerModal";
import { getLanguageByValue } from "../../data/languages";

const RoomHeader = ({ room, language, onLanguageChange, onRun, running, onLeave }) => {
  const [pickerOpen, setPickerOpen] = useState(false);
  const current = getLanguageByValue(language);
  const CurrentIcon = current?.icon;

  const copyRoomId = () => {
    navigator.clipboard.writeText(room.roomId);
    toast.success("Room ID copied");
  };

  return (
    <div className="flex items-center justify-between border-b border-white/10 bg-[#111827] px-5 py-3">
      <div className="flex items-center gap-3">
        <h1 className="text-sm font-semibold text-white">{room.title}</h1>
        <button
          onClick={copyRoomId}
          className="flex items-center gap-1.5 rounded-md border border-white/10 bg-[#0B0F19] px-2.5 py-1 text-xs text-[#9CA3AF] transition-colors hover:text-white"
        >
          {room.roomId}
          <Copy size={12} />
        </button>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className="flex items-center gap-2 rounded-md border border-white/10 bg-[#0B0F19] px-3 py-1.5 text-xs text-white transition-colors hover:border-white/20"
        >
          {CurrentIcon && <CurrentIcon size={14} />}
          {current?.label || language}
          <ChevronDown size={12} className="text-[#9CA3AF]" />
        </button>

        <button
          onClick={onRun}
          disabled={running}
          className="flex items-center gap-1.5 rounded-md bg-[#22C55E] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#22C55E]/90 disabled:opacity-60"
        >
          {running ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
          Run
        </button>

        <button
          onClick={onLeave}
          className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-[#EF4444] transition-colors hover:bg-[#EF4444]/10"
        >
          <LogOut size={14} />
          Leave
        </button>
      </div>

      <LanguagePickerModal
        isOpen={pickerOpen}
        onClose={() => setPickerOpen(false)}
        selected={language}
        onSelect={onLanguageChange}
      />
    </div>
  );
};

export default RoomHeader;