import { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import UsersLoadingSkeleton from "./UsersLoadingSkeleton";
import NoChatsFound from "./NoChatsFound";
import { useAuthStore } from "../store/useAuthStore";
import { formatLastMessageTime } from "../lib/formatTime";
import { getMessagePreview } from "../store/useChatStore";

function ChatsList() {
  const { getMyChatPartners, chats, isUsersLoading, setSelectedUser, unreadCounts } =
    useChatStore();
  const { onlineUsers, typingUsers } = useAuthStore();

  useEffect(() => {
    getMyChatPartners();
  }, [getMyChatPartners]);

  if (isUsersLoading) return <UsersLoadingSkeleton />;
  if (chats.length === 0) return <NoChatsFound />;

  return (
    <>
      {chats.map((chat) => {
        const partnerId = String(chat.user._id);
        const unread = unreadCounts[partnerId] || 0;
        const lastMsg = chat.lastMessage;

        return (
          <div
            key={chat._id}
            className="bg-cyan-500/10 p-4 rounded-lg cursor-pointer hover:bg-cyan-500/20 transition-colors"
            onClick={() => setSelectedUser(chat.user)}
          >
            <div className="flex items-center gap-3">
              <div
                className={`avatar shrink-0 ${
                  onlineUsers.includes(chat.user._id) ? "avatar-online" : "avatar-offline"
                }`}
              >
                <div className="size-12 rounded-full">
                  <img
                    src={chat.user.profilePic || "/avatar.png"}
                    alt={chat.user.fullName}
                  />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-slate-200 font-medium truncate">
                    {chat.user.fullName}
                  </h4>
                  {lastMsg && (
                    <span className="text-xs text-slate-400 shrink-0">
                      {formatLastMessageTime(lastMsg.createdAt)}
                    </span>
                  )}
                </div>

                {typingUsers?.[chat.user._id] ? (
                  <span className="text-sm text-cyan-400">typing...</span>
                ) : lastMsg ? (
                  <p className="text-sm text-slate-400 truncate">
                    {getMessagePreview(lastMsg)}
                  </p>
                ) : null}
              </div>

              {unread > 0 && (
                <div className="shrink-0 min-w-[22px] h-[22px] flex items-center justify-center bg-cyan-500 text-white text-xs font-bold rounded-full px-1.5">
                  {unread > 99 ? "99+" : unread}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </>
  );
}

export default ChatsList;
