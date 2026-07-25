import { useState } from "react";
import Modal from "../common/Modal";
import { joinRoom } from "../../services/roomService";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

// Extracts a room ID whether the user pasted a full link or just the raw ID
const extractRoomId = (input) => {
  const trimmed = input.trim();
  const match = trimmed.match(/\/join\/([A-Za-z0-9]+)/);
  return (match ? match[1] : trimmed).toUpperCase();
};

const JoinRoomModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", link: "", password: "" });

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email.trim()) return toast.error("Email is required");
    if (!form.link.trim()) return toast.error("Paste the room link or ID");

    setLoading(true);
    try {
      const roomId = extractRoomId(form.link);
      const res = await joinRoom({ roomId, password: form.password });
      toast.success("Joined room successfully");
      onClose();
      navigate(`/room/${res.data.roomId}`);
    } catch (err) {
      const resData = err.response?.data;
      if (resData?.requiresVerification) {
        toast.error("Please verify your email before joining a room");
        onClose();
        navigate("/verify-email", { state: { email: resData.email } });
        return;
      }
      toast.error(resData?.message || "Failed to join room");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Join Room">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="text-[#9CA3AF] text-xs mb-1.5 block">Your Email</label>
          <input type="email" name="email" value={form.email} onChange={handleChange}
            placeholder="you@example.com"
            className="w-full bg-[#0B0F19] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-[#9CA3AF]/50 focus:outline-none focus:border-[#6366F1]" />
        </div>
        <div>
          <label className="text-[#9CA3AF] text-xs mb-1.5 block">Room Link or ID</label>
          <input type="text" name="link" value={form.link} onChange={handleChange}
            placeholder="Paste invite link or e.g. X7K9P2"
            className="w-full bg-[#0B0F19] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-[#9CA3AF]/50 focus:outline-none focus:border-[#6366F1]" />
        </div>
        <div>
          <label className="text-[#9CA3AF] text-xs mb-1.5 block">Password (if private)</label>
          <input type="password" name="password" value={form.password} onChange={handleChange}
            placeholder="Leave empty if public"
            className="w-full bg-[#0B0F19] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-[#9CA3AF]/50 focus:outline-none focus:border-[#6366F1]" />
        </div>
        <button type="submit" disabled={loading}
          className="mt-2 w-full bg-[#8B5CF6] hover:bg-[#8B5CF6]/90 disabled:opacity-60 text-white text-sm font-medium py-2.5 rounded-lg flex items-center justify-center gap-2">
          {loading && <Loader2 size={16} className="animate-spin" />}
          {loading ? "Joining..." : "Join Room"}
        </button>
      </form>
    </Modal>
  );
};

export default JoinRoomModal;