import { useEffect, useRef, useState, useMemo } from "react";
import { ArrowDownRegular } from "@fluentui/react-icons";
import { Pin } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore, getMessagePreview } from "../store/useChatStore";
import ChatHeader from "./ChatHeader";
import NoChatHistoryPlaceholder from "./NoChatHistoryPlaceholder";
import MessageInput from "./MessageInput";
import MessagesLoadingSkeleton from "./MessagesLoadingSkeleton";
import ChatBackground from "./ChatBackground";
import MessageBubble from "./MessageBubble";
import { AnimatePresence, motion } from "framer-motion";

function ChatContainer({ isMobile }) {
  const {
    selectedUser,
    getMessagesByUserId,
    messages,
    isMessagesLoading,
    subscribeToMessages,
    unsubscribeFromMessages,
    newMessagesCount,
    dividerReadAt,
    searchText,
    searchDate,
    replyingTo,
    getPinnedMessage,
    pinnedMessages,
  } = useChatStore();

  const { authUser, typingUsers } = useAuthStore();

  const messageEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  const isSelectedUserTyping = selectedUser && typingUsers?.[selectedUser._id];
  const pinnedMessage = getPinnedMessage();
  const partnerId = selectedUser ? String(selectedUser._id) : "";

  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isUserNearBottom, setIsUserNearBottom] = useState(true);

  const filteredMessages = useMemo(() => {
    let result = messages;

    if (searchText.trim()) {
      const query = searchText.toLowerCase();
      result = result.filter((msg) => msg.text?.toLowerCase().includes(query));
    }

    if (searchDate) {
      result = result.filter((msg) => {
        const msgDate = new Date(msg.createdAt).toISOString().split("T")[0];
        return msgDate === searchDate;
      });
    }

    return result;
  }, [messages, searchText, searchDate]);

  const scrollToBottom = () => {
    const container = chatContainerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  };

  const getNewDividerIndex = () => {
    if (newMessagesCount <= 0 || !dividerReadAt) return -1;

    return filteredMessages.findIndex(
      (msg) =>
        String(msg.senderId?._id || msg.senderId) !== String(authUser._id) &&
        new Date(msg.createdAt) > new Date(dividerReadAt)
    );
  };

  const dividerIndex = getNewDividerIndex();

  useEffect(() => {
    if (searchText || searchDate) {
      const first = filteredMessages[0];
      if (first) {
        document.getElementById(`msg-${first._id}`)?.scrollIntoView({ block: "center" });
      }
    }
  }, [searchText, searchDate, filteredMessages]);

  useEffect(() => {
    getMessagesByUserId(selectedUser._id);
    subscribeToMessages();

    return () => unsubscribeFromMessages();
  }, [
    selectedUser,
    getMessagesByUserId,
    subscribeToMessages,
    unsubscribeFromMessages,
  ]);

  useEffect(() => {
    if (isUserNearBottom && chatContainerRef.current) {
      const container = chatContainerRef.current;
      container.scrollTop = container.scrollHeight;
    }
  }, [messages, isSelectedUserTyping, isUserNearBottom]);

  useEffect(() => {
    const container = chatContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const distanceFromBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight;

      setShowScrollButton(distanceFromBottom > 150);
      setIsUserNearBottom(distanceFromBottom < 50);
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollButtonBottom = replyingTo ? "bottom-44" : "bottom-24";

  return (
    <div className="relative flex flex-col h-full">
      <ChatHeader isMobile={isMobile} />

      {pinnedMessage && !searchText && !searchDate && (
        <div
          className="relative z-20 mx-4 mt-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-lg cursor-pointer hover:bg-cyan-500/20 transition-colors"
          onClick={() =>
            document
              .getElementById(`msg-${pinnedMessage._id}`)
              ?.scrollIntoView({ block: "center", behavior: "smooth" })
          }
        >
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-medium mb-1">
            <Pin className="w-3 h-3 fill-current" />
            Pinned message
          </div>
          <p className="text-sm text-slate-300 truncate">
            {getMessagePreview(pinnedMessage)}
          </p>
        </div>
      )}

      <div className="absolute inset-0 z-0">
        <ChatBackground />
      </div>

      <div
        ref={chatContainerRef}
        className="relative z-10 flex-1 px-6 overflow-y-auto py-8"
      >
        {(searchText || searchDate) && filteredMessages.length === 0 && messages.length > 0 && (
          <p className="text-center text-slate-400 text-sm py-8">No messages found</p>
        )}

        {messages.length > 0 && !isMessagesLoading ? (
          <div className="max-w-3xl mx-auto space-y-6">
            {filteredMessages.map((msg, index) => (
              <MessageBubble
                key={msg._id}
                message={msg}
                showNewDivider={index === dividerIndex && newMessagesCount > 0}
                newCount={newMessagesCount}
                isHighlighted={!!(searchText || searchDate)}
                isPinned={pinnedMessages[partnerId] === msg._id}
              />
            ))}

            <AnimatePresence>
              {isSelectedUserTyping && (
                <motion.div
                  className="chat chat-start"
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.25 }}
                >
                  <div className="chat-bubble bg-slate-800 text-slate-200">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                      <span
                        className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      />
                      <span
                        className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div ref={messageEndRef} />
          </div>
        ) : isMessagesLoading ? (
          <MessagesLoadingSkeleton />
        ) : (
          <NoChatHistoryPlaceholder name={selectedUser.fullName} />
        )}
      </div>

      {showScrollButton && (
        <button
          onClick={scrollToBottom}
          className={`absolute ${scrollButtonBottom} right-4 md:right-8 z-40 flex items-center justify-center rounded-full bg-cyan-600 text-white shadow-lg shadow-black/20 hover:scale-105 active:scale-95 transition-all duration-300 px-4 py-3`}
        >
          {isSelectedUserTyping ? (
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                <span
                  className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                />
                <span
                  className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                />
              </div>
              <ArrowDownRegular fontSize={16} />
            </div>
          ) : (
            <ArrowDownRegular fontSize={22} />
          )}
        </button>
      )}

      <MessageInput />
    </div>
  );
}

export default ChatContainer;
