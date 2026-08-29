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
  Users,
  Copy,
  Smile,
} from "lucide-react";
import toast from "react-hot-toast";
import ParticipantsList from "./ParticipantsList";

// Common emoji set for quick access
const QUICK_EMOJIS = ["😀", "👍", "❤️", "🎉", "🚀", "💯", "🔥", "👏", "😂", "✨"];


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
  activeParticipants = [],
}) => {
  const [expandedId, setExpandedId] = useState(null);
  const [messageText, setMessageText] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
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

  // Format time relative to now (e.g., "2 mins ago", "1 hour ago")
  const formatRelativeTime = (isoString) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffSeconds = Math.floor((now - date) / 1000);

      if (diffSeconds < 60) return "just now";
      const diffMinutes = Math.floor(diffSeconds / 60);
      if (diffMinutes < 60) return `${diffMinutes} min${diffMinutes > 1 ? "s" : ""} ago`;
      const diffHours = Math.floor(diffMinutes / 60);
      if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
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

  const handleKeyDown = (e) => {
    // Send on Enter (unless Shift is held for new line)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
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

        <button
          onClick={() => setActiveTab("participants")}
          className={`flex-1 py-2.5 text-center text-xs font-semibold transition-colors ${
            activeTab === "participants"
              ? "border-b-2 border-[#6366F1] text-white bg-[#0B0F19]/30"
              : "text-[#9CA3AF] hover:text-white"
          }`}
        >
          <div className="flex items-center justify-center gap-1.5">
            <Users size={12} />
            Participants ({activeParticipants.length})
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
                const codePreview = exec.code?.split("\n")[0]?.slice(0, 45) || "No code";
                const codePreviewDisplay = codePreview.length > 42 ? codePreview.slice(0, 42) + "..." : codePreview;

                return (
                  <div
                    key={exec._id}
                    className="overflow-hidden rounded-lg border border-white/5 bg-[#0B0F19]/40 transition-colors hover:border-white/10"
                  >
                    {/* Header */}
                    <div
                      onClick={() => toggleExpand(exec._id)}
                      className="flex cursor-pointer items-center justify-between gap-3 p-2.5"
                    >
                      <div className="flex-1 flex flex-col gap-1">
                        {/* User & Language */}
                        <div className="flex items-center gap-2">
                          <User size={10} className="text-[#9CA3AF]" />
                          <span className="text-xs font-semibold text-white">
                            {exec.user?.name || "User"}
                          </span>
                          <span className="text-[8px] font-medium text-[#8B5CF6] bg-[#8B5CF6]/10 px-1.5 py-0.5 rounded">
                            {exec.language?.toUpperCase() || "JS"}
                          </span>
                        </div>

                        {/* Code Preview & Time */}
                        <div className="flex items-center gap-2 text-[8px] text-[#9CA3AF]">
                          <span className="font-mono text-[#6366F1]">{codePreviewDisplay}</span>
                          <span>•</span>
                          <span className="whitespace-nowrap">{formatRelativeTime(exec.timestamp || exec.createdAt)}</span>
                          {exec.output?.time && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-0.5">
                                <Clock size={8} /> {exec.output.time}s
                              </span>
                            </>
                          )}
                          {exec.output?.memory && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-0.5">
                                <Database size={8} /> {exec.output.memory}KB
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Status & Expand Icon */}
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded px-1.5 py-0.5 text-[8px] font-semibold whitespace-nowrap ${
                            hasAccepted
                              ? "bg-[#22C55E]/10 text-[#22C55E]"
                              : "bg-[#EF4444]/10 text-[#EF4444]"
                          }`}
                        >
                          {exec.output?.status || "Unknown"}
                        </span>
                        {isExpanded ? (
                          <ChevronUp size={12} className="text-[#9CA3AF] flex-shrink-0" />
                        ) : (
                          <ChevronDown size={12} className="text-[#9CA3AF] flex-shrink-0" />
                        )}
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

                        {/* Code Section */}
                        <div className="border-t border-white/5 pt-2">
                          <div className="text-[9px] font-semibold text-[#9CA3AF] mb-1">code executed</div>
                          <pre className="rounded bg-[#111827] p-1.5 text-white whitespace-pre-wrap text-[9px] max-h-32 overflow-y-auto font-mono">
                            {exec.code}
                          </pre>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 border-t border-white/5 pt-2">
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(exec.code);
                              toast.success("Code copied to clipboard!");
                            }}
                            className="flex flex-1 items-center justify-center gap-1 rounded bg-[#8B5CF6] py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#8B5CF6]/80"
                          >
                            <Copy size={12} />
                            Copy Code
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              onRestoreCode(exec.code);
                              toast.success("Code restored! Continue coding...", { icon: "✨" });
                            }}
                            className="flex flex-1 items-center justify-center gap-1 rounded bg-[#6366F1] py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#6366F1]/80"
                          >
                            <RotateCcw size={12} />
                            Restore & Edit
                          </button>
                        </div>
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
              messages.map((msg, idx) => {
                const isMe = msg.user?._id === currentUser?._id || msg.user === currentUser?._id;
                // Check if we should show user info (different user from previous message)
                const prevMsg = idx > 0 ? messages[idx - 1] : null;
                const showUserInfo = !prevMsg || prevMsg.user?._id !== msg.user?._id;

                return (
                  <div
                    key={msg._id}
                    className={`flex gap-2 ${isMe ? "flex-row-reverse" : "flex-row"}`}
                  >
                    {/* Avatar */}
                    {showUserInfo && !isMe && (
                      <div className="mt-1 flex-shrink-0">
                        {msg.user?.profilePicture ? (
                          <img
                            src={msg.user.profilePicture}
                            alt={msg.user?.name}
                            className="h-7 w-7 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-7 w-7 rounded-full bg-[#6366F1] flex items-center justify-center text-xs text-white font-medium">
                            {msg.user?.name?.charAt(0).toUpperCase() || "U"}
                          </div>
                        )}
                      </div>
                    )}
                    {showUserInfo && isMe && <div className="w-7 flex-shrink-0" />}

                    {/* Message Content */}
                    <div className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                      {/* User Tag (only if different from previous) */}
                      {showUserInfo && !isMe && (
                        <span className="mb-1 text-[9px] text-[#9CA3AF] font-semibold px-1">
                          {msg.user?.name || "User"}
                        </span>
                      )}

                      {/* Chat Bubble */}
                      <div
                        className={`max-w-[280px] rounded-2xl px-3 py-2 text-xs break-words leading-relaxed shadow-sm transition-all ${
                          isMe
                            ? "bg-[#6366F1] text-white rounded-tr-none"
                            : "bg-[#111827] text-white border border-white/10 rounded-tl-none"
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.text}</p>
                      </div>

                      {/* Timestamp */}
                      <span className="mt-0.5 text-[8px] text-[#9CA3AF]/60 px-1 font-mono">
                        {formatRelativeTime(msg.timestamp || msg.createdAt)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Typing Indicator */}
          {Object.keys(chatTypingUsers).length > 0 && (
            <div className="px-3 py-2 text-[9px] text-cyan-400 font-medium flex items-center gap-2">
              <div className="flex gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
              <span>
                {Object.values(chatTypingUsers).join(", ")}
                {Object.keys(chatTypingUsers).length === 1 ? " is typing" : " are typing"}
              </span>
            </div>
          )}

          {/* Emoji Picker */}
          {showEmojiPicker && (
            <div className="border-t border-white/10 bg-[#111827] p-2 grid grid-cols-5 gap-1">
              {QUICK_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => {
                    setMessageText((prev) => prev + emoji);
                    setShowEmojiPicker(false);
                  }}
                  className="h-7 text-lg hover:bg-[#1F2937] rounded transition-colors"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}

          {/* Input Box */}
          <form
            onSubmit={handleSend}
            className="border-t border-white/10 bg-[#111827] p-2 space-y-2"
          >
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={messageText}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                className="flex-1 rounded-lg border border-white/10 bg-[#0B0F19] px-3 py-2 text-xs text-white placeholder:text-[#9CA3AF]/50 outline-none focus:border-[#6366F1] focus:bg-[#111827]"
              />
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[#9CA3AF] hover:bg-[#1F2937] transition-colors"
                title="Add emoji"
              >
                <Smile size={16} />
              </button>
              <button
                type="submit"
                disabled={!messageText.trim()}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#6366F1] text-white hover:bg-[#6366F1]/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Send message (Enter)"
              >
                <Send size={14} />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab: Participants */}
      {activeTab === "participants" && (
        <div className="flex-1 overflow-y-auto">
          {activeParticipants.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center text-[#9CA3AF] opacity-50">
              <Users size={24} className="mb-2" />
              <p className="text-xs">No participants yet.</p>
            </div>
          ) : (
            <ParticipantsList participants={activeParticipants} />
          )}
        </div>
      )}
    </div>
  );
};

export default OutputPanel;