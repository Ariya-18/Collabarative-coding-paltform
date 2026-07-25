import { useState } from "react";
import Modal from "../common/Modal";
import LanguagePickerModal from "../room/LanguagePickerModal";
import { createRoom, inviteToRoom } from "../../services/roomService";
import { getLanguageByValue } from "../../data/languages";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Loader2, ChevronDown, Copy, Send, ArrowRight } from "lucide-react";

const CreateRoomModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [createdRoom, setCreatedRoom] = useState(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [form, setForm] = useState({
    title: "",
    type: "practice",
    language: "javascript",
    isPrivate: false,
    password: "",
    scheduledAt: "",
  });

  const currentLang = getLanguageByValue(form.language);
  const CurrentIcon = currentLang?.icon;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error("Room title is required");
    setLoading(true);
    try {
      const payload = { ...form };
      if (!payload.isPrivate) delete payload.password;
      if (!payload.scheduledAt) delete payload.scheduledAt;

      const res = await createRoom(payload);
      setCreatedRoom({ roomId: res.data.roomId, inviteLink: res.data.inviteLink });
      toast.success("Room created!");
    } catch (err) {
      const resData = err.response?.data;
      if (resData?.requiresVerification) {
        toast.error("Please verify your email before creating a room");
        onClose();
        navigate("/verify-email", { state: { email: resData.email } });
        return;
      }
      toast.error(resData?.message || "Failed to create room");
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return toast.error("Enter an email to invite");
    setInviting(true);
    try {
      await inviteToRoom(createdRoom.roomId, inviteEmail);
      toast.success(`Invite sent to ${inviteEmail}`);
      setInviteEmail("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send invite");
    } finally {
      setInviting(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(createdRoom.inviteLink);
    toast.success("Link copied");
  };

  const handleClose = () => {
    setCreatedRoom(null);
    setForm({
      title: "",
      type: "practice",
      language: "javascript",
      isPrivate: false,
      password: "",
      scheduledAt: "",
    });
    onClose();
  };

  if (createdRoom) {
    return (
      <Modal isOpen={isOpen} onClose={handleClose} title="Room Ready 🎉">
        <div className="flex flex-col gap-4">
          <div>
            <label className="text-[#9CA3AF] text-xs mb-1.5 block">Shareable Link</label>
            <div className="flex gap-2">
              <input
                readOnly
                value={createdRoom.inviteLink}
                className="flex-1 bg-[#0B0F19] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white"
              />
              <button
                onClick={copyLink}
                className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg px-3 text-white"
              >
                <Copy size={16} />
              </button>
            </div>
          </div>

          <div>
            <label className="text-[#9CA3AF] text-xs mb-1.5 block">Invite by Email</label>
            <div className="flex gap-2">
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="friend@example.com"
                className="flex-1 bg-[#0B0F19] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-[#9CA3AF]/50 focus:outline-none focus:border-[#6366F1]"
              />
              <button
                onClick={handleInvite}
                disabled={inviting}
                className="bg-[#8B5CF6] hover:bg-[#8B5CF6]/90 disabled:opacity-60 rounded-lg px-3 text-white flex items-center justify-center"
              >
                {inviting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              </button>
            </div>
          </div>

          <button
            onClick={() => navigate(`/room/${createdRoom.roomId}`)}
            className="mt-2 w-full bg-[#6366F1] hover:bg-[#6366F1]/90 text-white text-sm font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            Enter Room <ArrowRight size={16} />
          </button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create New Room">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="text-[#9CA3AF] text-xs mb-1.5 block">Room Title</label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="e.g. Frontend Interview Round 1"
            className="w-full bg-[#0B0F19] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-[#9CA3AF]/50 focus:outline-none focus:border-[#6366F1]"
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
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              className="w-full flex items-center justify-between bg-[#0B0F19] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white hover:border-white/20"
            >
              <span className="flex items-center gap-2">
                {CurrentIcon && <CurrentIcon size={16} />}
                {currentLang?.label || "Select"}
              </span>
              <ChevronDown size={14} className="text-[#9CA3AF]" />
            </button>
          </div>
        </div>

        <div>
          <label className="text-[#9CA3AF] text-xs mb-1.5 block">Schedule (optional)</label>
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
          className="mt-2 w-full bg-[#6366F1] hover:bg-[#6366F1]/90 disabled:opacity-60 text-white text-sm font-medium py-2.5 rounded-lg flex items-center justify-center gap-2"
        >
          {loading && <Loader2 size={16} className="animate-spin" />}
          {loading ? "Creating..." : "Create Room"}
        </button>
      </form>

      <LanguagePickerModal
        isOpen={pickerOpen}
        onClose={() => setPickerOpen(false)}
        selected={form.language}
        onSelect={(value) => setForm((prev) => ({ ...prev, language: value }))}
      />
    </Modal>
  );
};

export default CreateRoomModal;