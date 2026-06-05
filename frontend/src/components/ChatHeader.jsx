import { ArrowLeftRegular, DismissRegular } from "@fluentui/react-icons";
import { useChatStore } from "../store/useChatStore";
import { useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useIsMobile } from "../hooks/useIsMobile";
import ChatSearch from "./ChatSearch";

function ChatHeader({ isMobile: isMobileProp }) {
  const {
    selectedUser,
    setSelectedUser,
    isSelectMode,
    exitSelectMode,
    selectedMessageIds,
    deleteSelectedMessages,
    messages,
    openForwardModal,
    isSearchOpen,
  } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const isMobileHook = useIsMobile();
  const isMobile = isMobileProp ?? isMobileHook;
  const isOnline = onlineUsers.includes(selectedUser._id);

  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === "Escape") {
        if (isSelectMode) {
          exitSelectMode();
        } else {
          setSelectedUser(null);
        }
      }
    };

    window.addEventListener("keydown", handleEscKey);
    return () => window.removeEventListener("keydown", handleEscKey);
  }, [setSelectedUser, isSelectMode, exitSelectMode]);

  if (isSelectMode) {
    return (
      <div className="flex justify-between items-center bg-slate-800/50 border-b border-slate-700/50 max-h-[84px] px-6 flex-1 z-20">
        <button
          onClick={exitSelectMode}
          className="text-slate-400 hover:text-cyan-200 transition-colors"
        >
          <DismissRegular className="w-7 h-7" />
        </button>
        <span className="text-slate-200 font-medium">
          {selectedMessageIds.length} selected
        </span>
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              const msg = messages.find((m) => m._id === selectedMessageIds[0]);
              if (msg) openForwardModal(msg);
            }}
            className="text-cyan-400 hover:text-cyan-300 text-sm font-medium"
          >
            Forward
          </button>
          <button
            onClick={deleteSelectedMessages}
            className="text-red-400 hover:text-red-300 text-sm font-medium"
          >
            Delete
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-between items-center bg-slate-800/50 border-b border-slate-700/50 min-h-[84px] px-4 md:px-6  z-20 gap-2">
      {!isSearchOpen && (
        <div className="flex items-center space-x-3 shrink-0">
          {isMobile && (
            <button
              onClick={() => setSelectedUser(null)}
              className="text-slate-400 hover:text-cyan-200 transition-colors"
            >
              <ArrowLeftRegular className="w-7 h-7" />
            </button>
          )}

          <div className={`avatar ${isOnline ? "avatar-online" : "offline"}`}>
            <div className="w-12 rounded-full">
              <img
                src={selectedUser.profilePic || "/avatar.png"}
                alt={selectedUser.fullName}
              />
            </div>
          </div>

          <div>
            <h3 className="text-slate-200 font-medium">{selectedUser.fullName}</h3>
            <p className="text-slate-400 text-sm">{isOnline ? "Online" : "Offline"}</p>
          </div>
        </div>
      )}

      <div className={`flex items-center gap-2 ${isSearchOpen ? "flex-1" : ""}`}>
        <ChatSearch />
        {!isMobile && !isSearchOpen && (
          <button onClick={() => setSelectedUser(null)}>
            <DismissRegular className="w-7 h-7 text-slate-400 hover:text-cyan-200 transition-colors cursor-pointer" />
          </button>
        )}
      </div>
    </div>
  );
}

export default ChatHeader;
