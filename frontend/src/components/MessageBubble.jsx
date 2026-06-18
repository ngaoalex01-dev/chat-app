import { useRef, useState } from "react";
import { Reply, Pin } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import MessageContextMenu from "./MessageContextMenu";
import toast from "react-hot-toast";

const LONG_PRESS_MS = 500;

function MessageBubble({ message, showNewDivider, newCount, isHighlighted, isPinned }) {
  const { authUser } = useAuthStore();
  const {
    setReplyingTo,
    deleteMessage,
    openForwardModal,
    enterSelectMode,
    isSelectMode,
    selectedMessageIds,
    toggleMessageSelection,
    setEditingMessage,
    pinMessage,
    pinnedMessage,
    editMessage,
    editingMessage,
    clearEditingMessage,
  } = useChatStore();

  const isOwn =
    String(message.senderId?._id || message.senderId) === String(authUser._id);
  const isSelected = selectedMessageIds.includes(message._id);
  const isEditing = editingMessage?._id === message._id;
  const messageIsPinned = pinnedMessage?._id === message._id || isPinned;

  const [contextMenu, setContextMenu] = useState(null);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [editText, setEditText] = useState(message.text || "");
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const touchPos = useRef({ x: 0, y: 0 });
  const isSwiping = useRef(false);
  const longPressTimer = useRef(null);
  const longPressTriggered = useRef(false);

  const openContextMenu = (x, y) => {
    setContextMenu({ x, y });
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    openContextMenu(e.clientX, e.clientY);
  };

  const clearLongPress = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleTouchStart = (e) => {
    longPressTriggered.current = false;
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    touchPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    isSwiping.current = true;

    clearLongPress();
    longPressTimer.current = setTimeout(() => {
      longPressTriggered.current = true;
      isSwiping.current = false;
      if (navigator.vibrate) navigator.vibrate(30);
      openContextMenu(touchPos.current.x, touchPos.current.y);
    }, LONG_PRESS_MS);
  };

  const handleTouchMove = (e) => {
    const currentX = e.touches[0].clientX;
    const diffX = currentX - touchStartX.current;
    const diffY = Math.abs(e.touches[0].clientY - touchStartY.current);

    if (diffY > 10 || Math.abs(diffX) > 10) {
      clearLongPress();
    }

    if (!isSwiping.current || longPressTriggered.current) return;

    if (diffX > 0 && diffY < 30) {
      setSwipeOffset(Math.min(diffX, 80));
    }
  };

  const handleTouchEnd = () => {
    clearLongPress();

    if (!longPressTriggered.current && swipeOffset > 50) {
      setReplyingTo(message);
    }

    setSwipeOffset(0);
    isSwiping.current = false;
  };

  const handleCopy = () => {
    const text = message.text || "";
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => toast.success("Copied"));
  };

  const handleSaveEdit = () => {
    if (!editText.trim()) return;
    editMessage(message._id, editText.trim());
  };

  const replyPreview = message.replyTo;

  return (
    <>
      {showNewDivider && (
        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-cyan-500/40" />
          <span className="text-xs font-medium text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full">
            {newCount} new message{newCount !== 1 ? "s" : ""}
          </span>
          <div className="flex-1 h-px bg-cyan-500/40" />
        </div>
      )}

      <div
        id={`msg-${message._id}`}
        className={`chat ${isOwn ? "chat-end" : "chat-start"} ${
          isSelected ? "opacity-80" : ""
        } ${isHighlighted ? "ring-2 ring-cyan-400/50 rounded-lg" : ""}`}
      >
        <div
          className="relative select-none"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onContextMenu={handleContextMenu}
          style={{
            transform: `translateX(${swipeOffset}px)`,
            transition: swipeOffset ? "none" : "transform 0.2s",
          }}
        >
          {swipeOffset > 20 && (
            <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 text-cyan-400">
              <Reply className="w-5 h-5" />
            </div>
          )}

          {isSelectMode && (
            <button
              onClick={() => toggleMessageSelection(message._id)}
              className={`absolute ${isOwn ? "-left-8" : "-right-8"} top-1/2 -translate-y-1/2 w-5 h-5 rounded border-2 flex items-center justify-center ${
                isSelected
                  ? "bg-cyan-500 border-cyan-500"
                  : "border-slate-500"
              }`}
            >
              {isSelected && (
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                </svg>
              )}
            </button>
          )}

          <div
            className={`chat-bubble relative px-4 py-2.5 rounded-2xl shadow-sm ${
              isOwn
                ? "bg-cyan-600 text-white rounded-br-md"
                : "bg-slate-800 text-slate-200 rounded-bl-md"
            } ${isSelected ? "ring-2 ring-cyan-400/50" : ""} ${
              messageIsPinned ? "ring-1 ring-cyan-300/60" : ""
            }`}
            onClick={() => isSelectMode && toggleMessageSelection(message._id)}
            onContextMenu={handleContextMenu}
          >
            {messageIsPinned && (
              <Pin className="absolute -top-2 -right-2 w-4 h-4 text-cyan-400 fill-cyan-400" />
            )}

{replyPreview && (
  <div
    className={`mb-2 pl-3 pr-2 py-2 rounded-lg relative overflow-hidden
      bg-white/5 backdrop-blur-md
      border border-purple-400/20
      shadow-[0_0_15px_rgba(168,85,247,0.15)]
    `}
  >

    {/* LEFT GLOW BAR */}
    <div className={`absolute left-0 top-0 h-full w-1
      ${isOwn ? "bg-gradient-to-b from-purple-400 via-fuchsia-500 to-purple-600"
              : "bg-gradient-to-b from-purple-500 via-purple-400 to-fuchsia-500"}
      shadow-[0_0_12px_rgba(168,85,247,0.4)]`}
    />

    {/* soft glow overlay */}
    <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-fuchsia-500/10 to-transparent pointer-events-none" />

    <div className="relative text-xs opacity-90 text-slate-200 pl-2">
      <p className="font-medium text-purple-300">
        {String(replyPreview.senderId?._id || replyPreview.senderId) ===
        String(authUser._id)
          ? "You"
          : "Reply"}
      </p>

      <p className="truncate max-w-[200px]">
        {replyPreview.text ||
          (replyPreview.audio ? "🎤 Voice note" : "📷 Image")}
      </p>
    </div>
  </div>
)}

            {message.image && (
              <img
                src={message.image}
                alt="Shared"
                className="rounded-lg h-48 object-cover pointer-events-none"
                draggable={false}
              />
            )}

            {message.audio && (
              <audio
                controls
                src={message.audio}
                className="w-full max-w-xs mt-1"
                preload="metadata"
              />
            )}

            {isEditing ? (
              <div className="mt-2 space-y-2">
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-600 rounded-lg p-2 text-sm text-slate-200 resize-none"
                  rows={2}
                  autoFocus
                />
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={clearEditingMessage}
                    className="text-xs text-slate-400 hover:text-slate-200 px-2 py-1"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    className="text-xs bg-cyan-500 text-white px-3 py-1 rounded-lg hover:bg-cyan-600"
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              message.text && <p className="mt-2">{message.text}</p>
            )}

            <p className="text-xs mt-1 opacity-75 flex items-center gap-1">
              {new Date(message.createdAt).toLocaleTimeString(undefined, {
                hour: "2-digit",
                minute: "2-digit",
              })}
              {message.isEdited && <span className="italic">edited</span>}
            </p>
          </div>
        </div>
      </div>

      {contextMenu && (
        <MessageContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          isOwnMessage={isOwn}
          isPinned={messageIsPinned}
          hasText={!!message.text}
          onReply={() => setReplyingTo(message)}
          onDelete={() => deleteMessage(message._id)}
          onForward={() => openForwardModal(message)}
          onSelect={() => enterSelectMode(message._id)}
          onCopy={handleCopy}
          onEdit={() => {
            setEditText(message.text || "");
            setEditingMessage(message);
          }}
          onPin={() => pinMessage(message)}
          onClose={() => setContextMenu(null)}
        />
      )}
    </>
  );
}

export default MessageBubble;
