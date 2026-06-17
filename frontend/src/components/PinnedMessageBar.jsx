import { Pin, PinOff } from "lucide-react";
import { getMessagePreview } from "../store/useChatStore";

function PinnedMessageBar({ message, onScrollTo, onUnpin }) {
  if (!message) return null;

  return (
    <div className="relative z-30 mx-3 mt-2 mb-1">
      <div
        role="button"
        tabIndex={0}
        onClick={onScrollTo}
        onKeyDown={(e) => e.key === "Enter" && onScrollTo()}
        className="group flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer
          bg-purple-950/40 backdrop-blur-xl border border-purple-500/30
          shadow-lg shadow-purple-900/20
          hover:bg-purple-900/50 hover:border-purple-400/40 transition-all duration-200"
      >
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-400/30 shrink-0">
          <Pin className="w-4 h-4 text-purple-300 fill-purple-400/60" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-purple-300/90 mb-0.5">
            Pinned message
          </p>
          <p className="text-sm text-purple-100/90 truncate">
            {getMessagePreview(message)}
          </p>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onUnpin();
          }}
          className="shrink-0 p-2 rounded-lg text-purple-300/70 hover:text-purple-100 hover:bg-purple-500/20 transition-colors"
          aria-label="Unpin message"
        >
          <PinOff className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default PinnedMessageBar;
