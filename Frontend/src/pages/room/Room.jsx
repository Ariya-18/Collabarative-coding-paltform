import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import socket from "../../services/socket";
import videoService from "../../services/videoService";
import { getRoomById, getRoomExecutions, getRoomMessages } from "../../services/roomService";
import { useAuth } from "../../context/AuthContext";
import RoomHeader from "../../components/room/RoomHeader";
import CodeEditor from "../../components/room/CodeEditor";
import OutputPanel from "../../components/room/OutputPanel";
import ParticipantsList from "../../components/room/ParticipantsList";
import VideoGallery from "../../components/room/VideoGallery";

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
  const [activeParticipants, setActiveParticipants] = useState([]);

  // Module 5 History states
  const [executions, setExecutions] = useState([]);

  // Module 6 Chat states
  const [activeSidebarTab, setActiveSidebarTab] = useState("console");
  const [messages, setMessages] = useState([]);
  const [chatTypingUsers, setChatTypingUsers] = useState({});
  const [unreadMessages, setUnreadMessages] = useState(0);

  // Module 7 Video calling states
  const [isVideoCalling, setIsVideoCalling] = useState(false);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState([]);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [remotePeers, setRemotePeers] = useState({}); // { peerId: { name, profilePicture } }
  const [videoMinimized, setVideoMinimized] = useState(false);

  // Keep a ref of active sidebar tab to avoid socket hook closure trapping
  const activeSidebarTabRef = useRef(activeSidebarTab);
  useEffect(() => {
    activeSidebarTabRef.current = activeSidebarTab;
  }, [activeSidebarTab]);

  // Typing debounces
  const typingTimeoutRef = useRef(null);
  const isCurrentlyTypingRef = useRef(false);

  // Cursor debounce (emit cursor changes at max 5x per second = 200ms throttle)
  const cursorTimeoutRef = useRef(null);
  const lastCursorRef = useRef(null);
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

    const joinData = { roomId, user: { id: user._id, name: user.name, profilePicture: user.profilePicture } };

    // Initialize participants list with current user
    setActiveParticipants([
      { userId: user._id, name: user.name, profilePicture: user.profilePicture },
    ]);

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
      setActiveParticipants((prev) => [
        ...prev,
        { userId: joinedUser.id, name: joinedUser.name, profilePicture: joinedUser.profilePicture },
      ]);
    });

    socket.on("user-left", ({ user: leftUser }) => {
      toast(`${leftUser.name} left the room`, { icon: "👋" });
      setActiveParticipants((prev) => prev.filter((p) => p.userId !== leftUser.id));
      
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

    // ── Video calling event handlers ──
    socket.on("video-call-started", ({ user: videoUser, peerId }) => {
      console.log(`${videoUser.name} started video call with peerId: ${peerId}`);
      setRemotePeers((prev) => ({
        ...prev,
        [peerId]: { name: videoUser.name, profilePicture: videoUser.profilePicture },
      }));
      // If current user hasn't started video, automatically prompt
      if (!isVideoCalling && !videoMinimized) {
        toast(`${videoUser.name} started a video call`, {
          icon: "📹",
          duration: 3000,
        });
      }
    });

    socket.on("video-call-ended", ({ user: videoUser, peerId }) => {
      console.log(`${videoUser.name} ended video call`);
      if (peerId) {
        setRemotePeers((prev) => {
          const copy = { ...prev };
          delete copy[peerId];
          return copy;
        });
      }
    });

    socket.on("peer-joined", ({ user: peerUser, peerId }) => {
      console.log(`Peer joined: ${peerUser.name} with ID: ${peerId}`);
      setRemotePeers((prev) => ({
        ...prev,
        [peerId]: { name: peerUser.name, profilePicture: peerUser.profilePicture },
      }));
      // If current user is in a video call, connect to this new peer
      if (isVideoCalling && videoService.localStream) {
        videoService.callPeer(peerId).catch((err) => {
          console.error("Failed to call peer:", err);
        });
      }
    });

    socket.on("peer-left", ({ peerId, user: leftUser }) => {
      console.log(`Peer left: ${leftUser.name}`);
      setRemotePeers((prev) => {
        const copy = { ...prev };
        delete copy[peerId];
        return copy;
      });
      setRemoteStreams((prev) => prev.filter((s) => s.peerId !== peerId));
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
      socket.off("video-call-started");
      socket.off("video-call-ended");
      socket.off("peer-joined");
      socket.off("peer-left");
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      if (cursorTimeoutRef.current) clearTimeout(cursorTimeoutRef.current);
      // Clean up video service on unmount
      videoService.stopAll();
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
    lastCursorRef.current = position;
    
    if (cursorTimeoutRef.current) return; // Debounce: skip if already scheduled
    
    cursorTimeoutRef.current = setTimeout(() => {
      if (lastCursorRef.current) {
        socket.emit("cursor-change", {
          roomId,
          user: { id: user._id, name: user.name },
          position: lastCursorRef.current,
        });
      }
      cursorTimeoutRef.current = null;
    }, 100); // Emit max 10x per second (100ms throttle)
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

  // ── Video calling handlers ──
  const handleToggleVideoCall = async (start) => {
    if (start) {
      setIsConnecting(true);
      try {
        // Initialize peer connection
        const peerId = await videoService.initializePeer(user._id, socket.id);
        console.log("Peer initialized with ID:", peerId);

        // Get local media stream
        const localStream = await videoService.getLocalStream();
        setLocalStream(localStream);
        setIsVideoCalling(true);

        // Setup remote stream handlers
        videoService.onRemoteStream((peerId, stream) => {
          console.log("Received remote stream from:", peerId);
          setRemoteStreams((prev) => {
            // Avoid duplicates
            const exists = prev.some((s) => s.peerId === peerId);
            if (exists) return prev;
            return [...prev, { peerId, stream }];
          });
        });

        videoService.onRemoteStreamRemoved((peerId) => {
          console.log("Remote stream removed:", peerId);
          setRemoteStreams((prev) => prev.filter((s) => s.peerId !== peerId));
        });

        videoService.onError((error) => {
          console.error("Video service error:", error);
          toast.error("Video error: " + error.message);
        });

        // Notify others in the room about video call start
        socket.emit("video-call-start", {
          roomId,
          user: { id: user._id, name: user.name, profilePicture: user.profilePicture },
          peerId,
        });

        // Broadcast peer ID for others to connect to
        socket.emit("peer-id-update", {
          roomId,
          peerId,
          user: { id: user._id, name: user.name, profilePicture: user.profilePicture },
        });

        // Connect to any existing peers in the room
        Object.keys(remotePeers).forEach((remotePeerId) => {
          videoService.callPeer(remotePeerId).catch((err) => {
            console.error("Failed to call peer:", err);
          });
        });

        toast.success("Video call started");
      } catch (error) {
        console.error("Failed to start video call:", error);
        toast.error("Failed to start video call");
        setIsVideoCalling(false);
      } finally {
        setIsConnecting(false);
      }
    } else {
      // End video call
      videoService.stopAll();
      setLocalStream(null);
      setRemoteStreams([]);
      setIsVideoCalling(false);
      setIsAudioEnabled(true);
      setIsVideoEnabled(true);

      socket.emit("video-call-end", {
        roomId,
        user: { id: user._id, name: user.name, profilePicture: user.profilePicture },
      });

      toast.success("Video call ended");
    }
  };

  const handleToggleAudio = (enabled) => {
    videoService.toggleAudio(enabled);
    setIsAudioEnabled(enabled);
  };

  const handleToggleVideo = (enabled) => {
    videoService.toggleVideo(enabled);
    setIsVideoEnabled(enabled);
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
        isVideoCalling={isVideoCalling}
        onToggleVideoCall={handleToggleVideoCall}
        isConnecting={isConnecting}
      />
      {isVideoCalling && !videoMinimized && (
        <VideoGallery
          localStream={localStream}
          remoteStreams={remoteStreams}
          currentUser={user}
          onToggleAudio={handleToggleAudio}
          onToggleVideo={handleToggleVideo}
          isAudioEnabled={isAudioEnabled}
          isVideoEnabled={isVideoEnabled}
          onMinimize={() => setVideoMinimized(true)}
          participantsData={remotePeers}
        />
      )}
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
              activeParticipants={activeParticipants}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Room;