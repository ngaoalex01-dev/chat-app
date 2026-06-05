import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  Reply,
  Trash2,
  Forward,
  CheckSquare,
  Copy,
  Pencil,
  Pin,
} from "lucide-react";

function MessageContextMenu({
  x,
  y,
  isOwnMessage,
  isPinned,
  hasText,
  onReply,
  onDelete,
  onForward,
  onSelect,
  onCopy,
  onEdit,
  onPin,
  onClose,
}) {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    };

    const handleEscape = (e) => {
      if (e.key === "Escape") onClose();
    };

    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }, 100);

    document.addEventListener("keydown", handleEscape);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  const menuStyle = {
    top: Math.min(y, window.innerHeight - 320),
    left: Math.min(x, window.innerWidth - 180),
  };

  const items = [
    { label: "Reply", icon: Reply, action: onReply },
    { label: "Copy", icon: Copy, action: onCopy, hidden: !hasText },
    { label: "Forward", icon: Forward, action: onForward },
    { label: "Pin", icon: Pin, action: onPin },
    { label: "Select", icon: CheckSquare, action: onSelect },
    ...(isOwnMessage && hasText
      ? [{ label: "Edit", icon: Pencil, action: onEdit }]
      : []),
    ...(isOwnMessage
      ? [{ label: "Delete", icon: Trash2, action: onDelete, danger: true }]
      : []),
  ].filter((item) => !item.hidden);

  return createPortal(
    <div
      ref={menuRef}
      className="fixed z-[9999] bg-slate-800 border border-slate-600 rounded-lg shadow-2xl py-1 min-w-[160px]"
      style={menuStyle}
      onContextMenu={(e) => e.preventDefault()}
    >
      {items.map(({ label, icon: Icon, action, danger }) => (
        <button
          key={label}
          onClick={() => {
            action();
            onClose();
          }}
          className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
            danger
              ? "text-red-400 hover:bg-red-500/10"
              : label === "Pin" && isPinned
                ? "text-cyan-400 hover:bg-cyan-500/10"
                : "text-slate-200 hover:bg-slate-700/50"
          }`}
        >
          <Icon className="w-4 h-4" />
          {label === "Pin" && isPinned ? "Unpin" : label}
        </button>
      ))}
    </div>,
    document.body
  );
}

export default MessageContextMenu;
