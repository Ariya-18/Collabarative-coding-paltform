import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { getRoomById } from "../../services/roomService";
import { connectSocket, disconnectSocket } from "../../services/socket";
import RoomHeader from "../../components/room/RoomHeader";
import ParticipantsList from "../../components/room/ParticipantsList";
import CodeEditor from "../../components/room/CodeEditor";
import OutputPanel from "../../components/room/OutputPanel";
import Loader from "../../components/common/Loader";

const Room = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();

  const [room, setRoom] = useState(null);
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [participants, setParticipants] = useState([]);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  const socketRef = useRef(null);
  const emitTimer = useRef(null);

  useEffect(() => {
    let isMounted = true;

    const setup = async () => {
      try {
        const res = await getRoomById(roomId);
        if (!isMounted) return;
        setRoom(res.data);
        setLanguage(res.data.language);
        setCode(res.data.code || "");
      } catch (err) {
        toast.error(err.response?.data?.message || "Room not found");
        navigate("/dashboard");
        return;
      } finally {
        if (isMounted) setLoading(false);
      }

      const socket = connectSocket();
      socketRef.current = socket;

      socket.on("connect", () => {
        socket.emit("join-room", { roomId });
      });

      socket.on("room-state", (state) => {
        setCode(state.code);
        setLanguage(state.language);
        setParticipants(state.participants);
      });

      socket.on("user-joined", ({ name, participants }) => {
        setParticipants(participants);
        toast(`${name} joined the room`, { icon: "👋" });
      });

      socket.on("user-left", ({ name, participants }) => {
        setParticipants(participants);
        toast(`${name} left the room`, { icon: "🚪" });
      });

      socket.on("code-update", ({ code }) => setCode(code));
      socket.on("language-update", ({ language }) => setLanguage(language));

      socket.on("run-started", () => setRunning(true));

      socket.on("run-result", (data) => {
        setRunning(false);
        setResult(data);
      });

      socket.on("room-error", ({ message }) => {
        toast.error(message);
        navigate("/dashboard");
      });
    };

    setup();

    return () => {
      isMounted = false;
      if (socketRef.current) {
        socketRef.current.emit("leave-room", { roomId });
        disconnectSocket();
      }
      clearTimeout(emitTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  const handleCodeChange = (value) => {
    setCode(value);
    clearTimeout(emitTimer.current);
    emitTimer.current = setTimeout(() => {
      socketRef.current?.emit("code-change", { roomId, code: value });
    }, 200);
  };

  const handleLanguageChange = (value) => {
    setLanguage(value);
    socketRef.current?.emit("language-change", { roomId, language: value });
  };

  const handleRun = () => {
    if (running) return;
    setResult(null);
    socketRef.current?.emit("run-code", { roomId, code, language });
  };

  const handleLeave = () => navigate("/dashboard");

  if (loading) return <Loader fullScreen />;
  if (!room) return null;

  return (
    <div className="flex h-screen bg-[#0B0F19]">
      <div className="flex flex-col flex-1 min-w-0">
        <RoomHeader
          room={room}
          language={language}
          onLanguageChange={handleLanguageChange}
          onRun={handleRun}
          running={running}
          onLeave={handleLeave}
        />
        <div className="flex-1 min-h-0">
          <CodeEditor code={code} language={language} onChange={handleCodeChange} />
        </div>
        <div className="h-56">
          <OutputPanel running={running} result={result} />
        </div>
      </div>
      <div className="w-64 border-l border-white/10 bg-[#111827] overflow-y-auto">
        <ParticipantsList participants={participants} />
      </div>
    </div>
  );
};

export default Room;