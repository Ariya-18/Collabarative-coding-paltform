import { useState } from "react";
import Modal from "../common/Modal";
import { createRoom } from "../../services/roomService";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

const CreateRoomModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    type: "practice",
    language: "javascript",
    isPrivate: false,
    password: "",
    scheduledAt: "",
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error("Room title is required");
      return;
    }
    setLoading(true);
    try {
      const payload = { ...form };
      if (!payload.isPrivate) delete payload.password;
      if (!payload.scheduledAt) delete payload.scheduledAt;

      const res = await createRoom(payload);
      toast.success("Room created successfully");
      onClose();
      navigate(`/room/${res.data.roomId}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create room");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Room">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="text-[#9CA3AF] text-xs mb-1.5 block">Room Title</label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="e.g. Frontend Interview Round 1"
            className="w-full bg-[#0B0F19] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-[#9CA3AF]/50 focus:outline-none focus:border-[#6366F1] transition-colors"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[#9CA3AF] text-xs mb-1.5 block">Type</label>
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              className="w-full bg-[#0B0F19] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#6366F1]"
            >
              <option value="practice">Practice</option>
              <option value="interview">Interview</option>
            </select>
          </div>
          <div>
            <label className="text-[#9CA3AF] text-xs mb-1.5 block">Language</label>
            <select
              name="language"
              value={form.language}
              onChange={handleChange}
              className="w-full bg-[#0B0F19] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#6366F1]"
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="cpp">C++</option>
              <option value="java">Java</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-[#9CA3AF] text-xs mb-1.5 block">
            Schedule (optional)
          </label>
          <input
            type="datetime-local"
            name="scheduledAt"
            value={form.scheduledAt}
            onChange={handleChange}
            className="w-full bg-[#0B0F19] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#6366F1]"
          />
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            name="isPrivate"
            checked={form.isPrivate}
            onChange={handleChange}
            className="accent-[#6366F1]"
          />
          <span className="text-sm text-[#9CA3AF]">Make this room private</span>
        </label>

        {form.isPrivate && (
          <div>
            <label className="text-[#9CA3AF] text-xs mb-1.5 block">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Set a room password"
              className="w-full bg-[#0B0F19] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-[#9CA3AF]/50 focus:outline-none focus:border-[#6366F1]"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-2 w-full bg-[#6366F1] hover:bg-[#6366F1]/90 disabled:opacity-60 text-white text-sm font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {loading && <Loader2 size={16} className="animate-spin" />}
          {loading ? "Creating..." : "Create Room"}
        </button>
      </form>
    </Modal>
  );
};

export default CreateRoomModal;