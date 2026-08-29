import { useState, useEffect, useRef } from "react";
import {
  Loader2,
  Terminal,
  Clock,
  Database,
  History,
  RotateCcw,
  User,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Send,
} from "lucide-react";
import toast from "react-hot-toast";

const OutputPanel = ({
  output,
  running,
  input,
  onInputChange,
  executions = [],
  onRestoreCode,
  // Chat Props
  activeTab,
  setActiveTab,
  messages = [],
  onSendMessage,
  chatTypingUsers = {},
  onChatTyping,
  onChatStopTyping,
  unreadCount = 0,
  currentUser,
}) => {
  const [expandedId, setExpandedId] = useState(null);
  const [messageText, setMessageText] = useState("");
  const chatEndRef = useRef(null);
  const chatTypingTimeoutRef = useRef(null);
  const chatIsCurrentlyTypingRef = useRef(false);

  const formatTime = (isoString) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  };

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (activeTab === "chat") {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, activeTab]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    onSendMessage(messageText.trim());
    setMessageText("");

    // Reset typing state
    if (chatTypingTimeoutRef.current) clearTimeout(chatTypingTimeoutRef.current);
    chatIsCurrentlyTypingRef.current = false;
    onChatStopTyping();
  };

  const handleInputChange = (e) => {
    setMessageText(e.target.value);

    // Trigger typing state
    if (!chatIsCurrentlyTypingRef.current) {
      chatIsCurrentlyTypingRef.current = true;
      onChatTyping();
    }

    if (chatTypingTimeoutRef.current) clearTimeout(chatTypingTimeoutRef.current);

    chatTypingTimeoutRef.current = setTimeout(() => {
      chatIsCurrentlyTypingRef.current = false;
      onChatStopTyping();
    }, 1500);
  };

  return (
    <div className="flex h-full flex-col bg-[#111827]">
      {/* Tab Selectors */}
      <div className="flex border-b border-white/10 bg-[#111827]">
        <button
          onClick={() => setActiveTab("console")}
          className={`flex-1 py-2.5 text-center text-xs font-semibold transition-colors ${
            activeTab === "console"
              ? "border-b-2 border-[#6366F1] text-white bg-[#0B0F19]/30"
              : "text-[#9CA3AF] hover:text-white"
          }`}
        >
          <div className="flex items-center justify-center gap-1.5">
            <Terminal size={12} />
            Console
          </div>
        </button>

        <button
          onClick={() => setActiveTab("history")}
          className={`flex-1 py-2.5 text-center text-xs font-semibold transition-colors ${
            activeTab === "history"
              ? "border-b-2 border-[#6366F1] text-white bg-[#0B0F19]/30"
              : "text-[#9CA3AF] hover:text-white"
          }`}
        >
          <div className="flex items-center justify-center gap-1.5">
            <History size={12} />
            History ({executions.length})
          </div>
        </button>

        <button
          onClick={() => setActiveTab("chat")}
          className={`relative flex-1 py-2.5 text-center text-xs font-semibold transition-colors ${
            activeTab === "chat"
              ? "border-b-2 border-[#6366F1] text-white bg-[#0B0F19]/30"
              : "text-[#9CA3AF] hover:text-white"
          }`}
        >
          <div className="flex items-center justify-center gap-1.5">
            <MessageSquare size={12} />
            Chat
            {unreadCount > 0 && (
              <span className="absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#EF4444] text-[8px] font-bold text-white animate-bounce">
                {unreadCount}
              </span>
            )}
          </div>
        </button>
      </div>

      {/* Tab: Console */}
      {activeTab === "console" && (
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="border-b border-white/10 p-3">
            <label className="mb-1.5 block text-xs text-[#9CA3AF]">Custom Input (stdin)</label>
            <textarea
              value={input}
              onChange={(e) => onInputChange(e.target.value)}
              rows={3}
              placeholder="Optional input for your program"
              className="w-full resize-none rounded-lg border border-white/10 bg-[#0B0F19] px-3 py-2 text-xs text-white placeholder:text-[#9CA3AF]/50 outline-none focus:border-[#6366F1]"
            />
          </div>

          <div className="flex-1 overflow-y-auto p-3 font-mono text-xs">
            {running && (
              <div className="flex items-center gap-2 text-[#9CA3AF]">
                <Loader2 size={14} className="animate-spin" />
                Running your code...
              </div>
            )}

            {!running && !output && (
              <p className="text-[#9CA3AF]">Click "Run" to see output here.</p>
            )}

            {!running && output && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      output.status === "Accepted"
                        ? "bg-[#22C55E]/20 text-[#22C55E]"
                        : "bg-[#EF4444]/20 text-[#EF4444]"
                    }`}
                  >
                    {output.status}
                  </span>
                  {output.time && (
                    <span className="flex items-center gap-1 text-[#9CA3AF]">
                      <Clock size={11} /> {output.time}s
                    </span>
                  )}
                  {output.memory && (
                    <span className="flex items-center gap-1 text-[#9CA3AF]">
                      <Database size={11} /> {output.memory} KB
                    </span>
                  )}
                </div>

                {output.stdout && (
                  <div>
                    <p className="mb-1 text-[#9CA3AF]">stdout</p>
                    <pre className="whitespace-pre-wrap rounded-lg bg-[#0B0F19] p-2.5 text-white">
                      {output.stdout}
                    </pre>
                  </div>
                )}

                {output.compileOutput && (
                  <div>
                    <p className="mb-1 text-[#F59E0B]">compile error</p>
                    <pre className="whitespace-pre-wrap rounded-lg bg-[#0B0F19] p-2.5 text-[#F59E0B]">
                      {output.compileOutput}
                    </pre>
                  </div>
                )}

                {output.stderr && (
                  <div>
                    <p className="mb-1 text-[#EF4444]">stderr</p>
                    <pre className="whitespace-pre-wrap rounded-lg bg-[#0B0F19] p-2.5 text-[#EF4444]">
                      {output.stderr}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: History */}
      {activeTab === "history" && (
        <div className="flex-1 overflow-y-auto p-3">
          {executions.length === 0 ? (
            <div className="flex h-48 flex-col items-center justify-center text-center text-[#9CA3AF]">
              <History size={24} className="mb-2 opacity-40" />
              <p className="text-xs">No execution logs found.</p>
              <p className="text-[10px] opacity-75">Runs in this room will show up here.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {executions.map((exec) => {
                const isExpanded = expandedId === exec._id;
                const hasAccepted = exec.output?.status === "Accepted";

                return (
                  <div
                    key={exec._id}
                    className="overflow-hidden rounded-lg border border-white/5 bg-[#0B0F19]/40 transition-colors hover:border-white/10"
                  >
                    {/* Header */}
                    <div
                      onClick={() => toggleExpand(exec._id)}
                      className="flex cursor-pointer items-center justify-between p-2.5"
                    >
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
                          <User size={10} className="text-[#9CA3AF]" />
                          {exec.user?.name || "User"}
                        </div>
                        <span className="text-[9px] text-[#9CA3AF]">
                          {formatTime(exec.timestamp || exec.createdAt)} •{" "}
                          <span className="uppercase text-[#8B5CF6] font-medium">
                            {exec.language}
                          </span>
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded px-1.5 py-0.5 text-[8px] font-semibold ${
                            hasAccepted
                              ? "bg-[#22C55E]/10 text-[#22C55E]"
                              : "bg-[#EF4444]/10 text-[#EF4444]"
                          }`}
                        >
                          {exec.output?.status || "Unknown"}
                        </span>
                        {isExpanded ? <ChevronUp size={12} className="text-[#9CA3AF]" /> : <ChevronDown size={12} className="text-[#9CA3AF]" />}
                      </div>
                    </div>

                    {/* Collapsible content */}
                    {isExpanded && (
                      <div className="border-t border-white/5 bg-[#0B0F19]/80 p-2.5 font-mono text-[10px] space-y-2.5">
                        {exec.input && (
                          <div>
                            <div className="text-[9px] font-semibold text-[#9CA3AF] mb-1">stdin</div>
                            <pre className="rounded bg-[#111827] p-1.5 text-white whitespace-pre-wrap">
                              {exec.input}
                            </pre>
                          </div>
                        )}

                        {exec.output?.stdout && (
                          <div>
                            <div className="text-[9px] font-semibold text-[#9CA3AF] mb-1">stdout</div>
                            <pre className="rounded bg-[#111827] p-1.5 text-white whitespace-pre-wrap">
                              {exec.output.stdout}
                            </pre>
                          </div>
                        )}

                        {exec.output?.compileOutput && (
                          <div>
                            <div className="text-[9px] font-semibold text-[#F59E0B] mb-1">compile error</div>
                            <pre className="rounded bg-[#111827] p-1.5 text-[#F59E0B] whitespace-pre-wrap">
                              {exec.output.compileOutput}
                            </pre>
                          </div>
                        )}

                        {exec.output?.stderr && (
                          <div>
                            <div className="text-[9px] font-semibold text-[#EF4444] mb-1">stderr</div>
                            <pre className="rounded bg-[#111827] p-1.5 text-[#EF4444] whitespace-pre-wrap">
                              {exec.output.stderr}
                            </pre>
                          </div>
                        )}

                        <div className="flex items-center gap-3 border-t border-white/5 pt-2 text-[9px] text-[#9CA3AF]">
                          {exec.output?.time && (
                            <span>Time: {exec.output.time}s</span>
                          )}
                          {exec.output?.memory && (
                            <span>Memory: {exec.output.memory} KB</span>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            onRestoreCode(exec.code);
                            toast.success("Code restored from history!");
                          }}
                          className="flex w-full items-center justify-center gap-1 rounded bg-[#6366F1] py-1 text-xs font-semibold text-white transition-colors hover:bg-[#6366F1]/80"
                        >
                          <RotateCcw size={11} />
                          Restore this code state
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab: Chat */}
      {activeTab === "chat" && (
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Message List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center text-[#9CA3AF] opacity-50">
                <MessageSquare size={24} className="mb-2" />
                <p className="text-xs">No chat messages yet.</p>
                <p className="text-[10px]">Start the conversation in real-time!</p>
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = msg.user?._id === currentUser?._id || msg.user === currentUser?._id;
                return (
                  <div
                    key={msg._id}
                    className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                  >
                    {/* User Tag */}
                    {!isMe && (
                      <span className="mb-0.5 text-[9px] text-[#9CA3AF] font-medium px-1">
                        {msg.user?.name || "User"}
                      </span>
                    )}

                    {/* Chat Bubble */}
                    <div
                      className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs break-words leading-relaxed shadow-sm ${
                        isMe
                          ? "bg-[#6366F1] text-white rounded-tr-none"
                          : "bg-[#0B0F19] text-white border border-white/5 rounded-tl-none"
                      }`}
                    >
                      <p>{msg.text}</p>
                    </div>

                    {/* Timestamp */}
                    <span className="mt-0.5 text-[8px] text-[#9CA3AF]/65 px-1 font-mono">
                      {formatTime(msg.timestamp || msg.createdAt)}
                    </span>
                  </div>
                );
              })
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Typing Indicator */}
          {Object.keys(chatTypingUsers).length > 0 && (
            <div className="px-3 py-1 text-[9px] text-cyan-400 animate-pulse font-medium">
              {Object.values(chatTypingUsers).join(", ")}
              {Object.keys(chatTypingUsers).length === 1 ? " is typing..." : " are typing..."}
            </div>
          )}

          {/* Input Box */}
          <form
            onSubmit={handleSend}
            className="flex items-center gap-2 border-t border-white/10 bg-[#111827] p-2"
          >
            <input
              type="text"
              value={messageText}
              onChange={handleInputChange}
              placeholder="Type your message..."
              className="flex-1 rounded-lg border border-white/10 bg-[#0B0F19] px-3 py-2 text-xs text-white placeholder:text-[#9CA3AF]/50 outline-none focus:border-[#6366F1]"
            />
            <button
              type="submit"
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#6366F1] text-white hover:bg-[#6366F1]/80 transition-colors"
            >
              <Send size={12} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default OutputPanel;