import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import socket from "../../services/socket";
import { getRoomById, getRoomExecutions, getRoomMessages } from "../../services/roomService";
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

  // Module 4 Real-time states
  const [cursors, setCursors] = useState({});
  const [typingUsers, setTypingUsers] = useState({});
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Module 5 History states
  const [executions, setExecutions] = useState([]);

  // Module 6 Chat states
  const [activeSidebarTab, setActiveSidebarTab] = useState("console");
  const [messages, setMessages] = useState([]);
  const [chatTypingUsers, setChatTypingUsers] = useState({});
  const [unreadMessages, setUnreadMessages] = useState(0);

  // Keep a ref of active sidebar tab to avoid socket hook closure trapping
  const activeSidebarTabRef = useRef(activeSidebarTab);
  useEffect(() => {
    activeSidebarTabRef.current = activeSidebarTab;
  }, [activeSidebarTab]);

  // Typing debounces
  const typingTimeoutRef = useRef(null);
  const isCurrentlyTypingRef = useRef(false);

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

    // Fetch initial execution history log
    getRoomExecutions(roomId)
      .then((res) => {
        setExecutions(res.data);
      })
      .catch((err) => {
        console.error("Failed to load run history:", err);
      });

    // Fetch initial chat messages history
    getRoomMessages(roomId)
      .then((res) => {
        setMessages(res.data);
      })
      .catch((err) => {
        console.error("Failed to load chat history:", err);
      });

    const joinData = { roomId, user: { id: user._id, name: user.name } };

    // Auto-reconnect handling: re-emit join on reconnect
    const handleConnect = () => {
      socket.emit("join-room", joinData);
    };

    socket.emit("join-room", joinData);
    socket.on("connect", handleConnect);

    socket.on("code-change", ({ code: incoming }) => {
      isRemoteChange.current = true;
      setCode(incoming);
    });

    socket.on("execution-started", () => setRunning(true));

    socket.on("code-result", (result) => {
      setRunning(false);
      setOutput(result);
    });

    socket.on("new-execution", (newExec) => {
      setExecutions((prev) => [newExec, ...prev]);
    });

    socket.on("new-message", (newMsg) => {
      setMessages((prev) => [...prev, newMsg]);
      // Increment unread count if client is not actively looking at chat
      if (activeSidebarTabRef.current !== "chat") {
        setUnreadMessages((prev) => prev + 1);
      }
    });

    socket.on("user-joined", ({ user: joinedUser }) => {
      toast(`${joinedUser.name} joined the room`, { icon: "👋" });
    });

    socket.on("user-left", ({ user: leftUser }) => {
      toast(`${leftUser.name} left the room`, { icon: "👋" });
      
      // Clean up remote cursor/typing states for user who left
      setCursors((prev) => {
        const copy = { ...prev };
        delete copy[leftUser.id];
        return copy;
      });
      setTypingUsers((prev) => {
        const copy = { ...prev };
        delete copy[leftUser.id];
        return copy;
      });
      setChatTypingUsers((prev) => {
        const copy = { ...prev };
        delete copy[leftUser.id];
        return copy;
      });
    });

    socket.on("cursor-change", ({ user: remoteUser, position }) => {
      setCursors((prev) => ({
        ...prev,
        [remoteUser.id]: { user: remoteUser, position },
      }));
    });

    socket.on("typing", ({ user: remoteUser }) => {
      setTypingUsers((prev) => ({
        ...prev,
        [remoteUser.id]: remoteUser.name,
      }));
    });

    socket.on("stop-typing", ({ user: remoteUser }) => {
      setTypingUsers((prev) => {
        const copy = { ...prev };
        delete copy[remoteUser.id];
        return copy;
      });
    });

    socket.on("chat-typing", ({ user: remoteUser }) => {
      setChatTypingUsers((prev) => ({
        ...prev,
        [remoteUser.id]: remoteUser.name,
      }));
    });

    socket.on("chat-stop-typing", ({ user: remoteUser }) => {
      setChatTypingUsers((prev) => {
        const copy = { ...prev };
        delete copy[remoteUser.id];
        return copy;
      });
    });

    return () => {
      socket.emit("leave-room", { roomId, user: { id: user._id, name: user.name } });
      socket.off("connect", handleConnect);
      socket.off("code-change");
      socket.off("execution-started");
      socket.off("code-result");
      socket.off("new-execution");
      socket.off("new-message");
      socket.off("user-joined");
      socket.off("user-left");
      socket.off("cursor-change");
      socket.off("typing");
      socket.off("stop-typing");
      socket.off("chat-typing");
      socket.off("chat-stop-typing");
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [roomId]);

  const handleCodeChange = (value) => {
    setCode(value);
    if (isRemoteChange.current) {
      isRemoteChange.current = false;
      return;
    }
    socket.emit("code-change", { roomId, code: value });

    // Emit typing status
    if (!isCurrentlyTypingRef.current) {
      isCurrentlyTypingRef.current = true;
      socket.emit("typing", { roomId, user: { id: user._id, name: user.name } });
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      isCurrentlyTypingRef.current = false;
      socket.emit("stop-typing", { roomId, user: { id: user._id, name: user.name } });
    }, 1500);
  };

  const handleCursorChange = (position) => {
    socket.emit("cursor-change", {
      roomId,
      user: { id: user._id, name: user.name },
      position,
    });
  };

  const handleRestoreCode = (restoredCode) => {
    setCode(restoredCode);
    socket.emit("code-change", { roomId, code: restoredCode });
  };

  const handleSendMessage = (text) => {
    socket.emit("send-message", { roomId, text });
  };

  const handleChatTyping = () => {
    socket.emit("chat-typing", { roomId, user: { id: user._id, name: user.name } });
  };

  const handleChatStopTyping = () => {
    socket.emit("chat-stop-typing", { roomId, user: { id: user._id, name: user.name } });
  };

  const handleSidebarTabChange = (tabName) => {
    setActiveSidebarTab(tabName);
    if (tabName === "chat") {
      setUnreadMessages(0);
    }
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
        isFullscreen={isFullscreen}
        onToggleFullscreen={() => setIsFullscreen(prev => !prev)}
      />
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1">
          <CodeEditor
            code={code}
            language={language}
            onChange={handleCodeChange}
            onCursorChange={handleCursorChange}
            cursors={cursors}
            typingUsers={typingUsers}
          />
        </div>
        {!isFullscreen && (
          <div className="w-[380px] border-l border-white/10">
            <OutputPanel
              output={output}
              running={running}
              input={input}
              onInputChange={setInput}
              executions={executions}
              onRestoreCode={handleRestoreCode}
              activeTab={activeSidebarTab}
              setActiveTab={handleSidebarTabChange}
              messages={messages}
              onSendMessage={handleSendMessage}
              chatTypingUsers={chatTypingUsers}
              onChatTyping={handleChatTyping}
              onChatStopTyping={handleChatStopTyping}
              unreadCount={unreadMessages}
              currentUser={user}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Room;