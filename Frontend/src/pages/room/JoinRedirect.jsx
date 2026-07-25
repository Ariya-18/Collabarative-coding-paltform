import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { joinRoom } from "../../services/roomService";
import toast from "react-hot-toast";

const JoinRedirect = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    joinRoom({ roomId })
      .then((res) => navigate(`/room/${res.data.roomId}`))
      .catch((err) => {
        toast.error(err.response?.data?.message || "Could not join room — it may be private");
        navigate("/dashboard");
      });
  }, [roomId, navigate]);

  return (
    <div className="flex h-screen items-center justify-center bg-background text-muted">
      Joining room...
    </div>
  );
};

export default JoinRedirect;