import { useState } from "react";
import Modal from "../common/Modal";
import { joinRoom } from "../../services/roomService";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

const JoinRoomModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ roomId: "", password: "" });

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.roomId.trim()) {
      toast.error("Room ID is required");
      return;
    }
    setLoading(true);
    try {
      const res = await joinRoom(form);
      toast.success("Joined room successfully");
      onClose();
      navigate(`/room/${res.data.roomId}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to join room");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Join Room">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="text-[#9CA3AF] text-xs mb-1.5 block">Room ID</label>
          <input
            type="text"
            name="roomId"
            value={form.roomId}
            onChange={handleChange}
            placeholder="e.g. X7K9P2"
            className="w-full bg-[#0B0F19] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white uppercase placeholder:text-[#9CA3AF]/50 focus:outline-none focus:border-[#6366F1]"
          />
        </div>
        <div>
          <label className="text-[#9CA3AF] text-xs mb-1.5 block">
            Password (if private)
          </label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Leave empty if public"
            className="w-full bg-[#0B0F19] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-[#9CA3AF]/50 focus:outline-none focus:border-[#6366F1]"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="mt-2 w-full bg-[#8B5CF6] hover:bg-[#8B5CF6]/90 disabled:opacity-60 text-white text-sm font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {loading && <Loader2 size={16} className="animate-spin" />}
          {loading ? "Joining..." : "Join Room"}
        </button>
      </form>
    </Modal>
  );
};

export default JoinRoomModal;