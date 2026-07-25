import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import socket from "../../services/socket";
import { getRoomById } from "../../services/roomService";
import { useAuth } from "../../context/AuthContext";
import RoomHeader from "../../components/room/RoomHeader";
import CodeEditor from "../../components/room/CodeEditor";
import OutputPanel from "../../components/room/OutputPanel";

const Room = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [room, setRoom] = useState(null);
  const [code, setCode] = useState("// Start coding...");
  const [language, setLanguage] = useState("javascript");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState(null);
  const [running, setRunning] = useState(false);
  const isRemoteChange = useRef(false);

  // Load room details + join socket room
  useEffect(() => {
    getRoomById(roomId)
      .then((res) => {
        setRoom(res.data);
        setLanguage(res.data.language || "javascript");
        setCode(res.data.code || "// Start coding...");
      })
      .catch(() => {
        toast.error("Room not found");
        navigate("/dashboard");
      });

    socket.emit("join-room", { roomId, user: { id: user._id, name: user.name } });

    socket.on("code-change", ({ code: incoming }) => {
      isRemoteChange.current = true;
      setCode(incoming);
    });

    socket.on("execution-started", () => setRunning(true));

    socket.on("code-result", (result) => {
      setRunning(false);
      setOutput(result);
    });

    socket.on("user-joined", ({ user: joinedUser }) => {
      toast(`${joinedUser.name} joined the room`, { icon: "👋" });
    });

    socket.on("user-left", ({ user: leftUser }) => {
      toast(`${leftUser.name} left the room`, { icon: "👋" });
    });

    return () => {
      socket.emit("leave-room", { roomId, user: { id: user._id, name: user.name } });
      socket.off("code-change");
      socket.off("execution-started");
      socket.off("code-result");
      socket.off("user-joined");
      socket.off("user-left");
    };
  }, [roomId]);

  const handleCodeChange = (value) => {
    setCode(value);
    if (isRemoteChange.current) {
      isRemoteChange.current = false;
      return;
    }
    socket.emit("code-change", { roomId, code: value });
  };

  const handleRun = () => {
    if (running) return;
    setOutput(null);
    socket.emit("run-code", { roomId, code, language, input });
  };

  const handleLeave = () => {
    navigate("/dashboard");
  };

  if (!room) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      <RoomHeader
        room={room}
        language={language}
        onLanguageChange={setLanguage}
        onRun={handleRun}
        running={running}
        onLeave={handleLeave}
      />
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1">
          <CodeEditor code={code} language={language} onChange={handleCodeChange} />
        </div>
        <div className="w-[380px] border-l border-white/10">
          <OutputPanel output={output} running={running} input={input} onInputChange={setInput} />
        </div>
      </div>
    </div>
  );
};

export default Room;