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

/*  local date formatter  */
function formatMessageGroupDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();

  const isToday = date.toDateString() === now.toDateString();

  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  if (isToday) return "Today";
  if (isYesterday) return "Yesterday";

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function ChatContainer({ isMobile }) {
  const {
    selectedUser,
    getMessagesByUserId,
    messages,
    isMessagesLoading,
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

  const isSelectedUserTyping =
    selectedUser && typingUsers?.[selectedUser._id];

  const pinnedMessage = getPinnedMessage();
  const partnerId = selectedUser ? String(selectedUser._id) : "";

  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isUserNearBottom, setIsUserNearBottom] = useState(true);

  const filteredMessages = useMemo(() => {
    let result = messages;

    if (searchText.trim()) {
      const query = searchText.toLowerCase();
      result = result.filter((msg) =>
        msg.text?.toLowerCase().includes(query)
      );
    }

    if (searchDate) {
      result = result.filter((msg) => {
        const msgDate = new Date(msg.createdAt)
          .toISOString()
          .split("T")[0];
        return msgDate === searchDate;
      });
    }

    return result;
  }, [messages, searchText, searchDate]);

  const groupedMessages = useMemo(() => {
    const groups = [];

    filteredMessages.forEach((msg) => {
      const label = formatMessageGroupDate(msg.createdAt);

      const lastGroup = groups[groups.length - 1];

      if (!lastGroup || lastGroup.label !== label) {
        groups.push({
          label,
          messages: [msg],
        });
      } else {
        lastGroup.messages.push(msg);
      }
    });

    return groups;
  }, [filteredMessages]);

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
        String(msg.senderId?._id || msg.senderId) !==
          String(authUser._id) &&
        new Date(msg.createdAt) > new Date(dividerReadAt)
    );
  };

  const dividerIndex = getNewDividerIndex();

  useEffect(() => {
    if (searchText || searchDate) {
      const first = filteredMessages[0];
      if (first) {
        document
          .getElementById(`msg-${first._id}`)
          ?.scrollIntoView({ block: "center" });
      }
    }
  }, [searchText, searchDate, filteredMessages]);

  useEffect(() => {
    getMessagesByUserId(selectedUser._id);
  }, [selectedUser, getMessagesByUserId]);

  useEffect(() => {
    if (!chatContainerRef.current || messages.length === 0) return;

    const container = chatContainerRef.current;
    const latestMessage = messages[messages.length - 1];

    const isMyMessage =
      String(latestMessage.senderId?._id || latestMessage.senderId) ===
      String(authUser._id);

    if (isMyMessage) {
      container.scrollTop = container.scrollHeight;
      return;
    }

    if (isUserNearBottom) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    const container = chatContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const distanceFromBottom =
        container.scrollHeight -
        container.scrollTop -
        container.clientHeight;

      setShowScrollButton(distanceFromBottom > 150);
      setIsUserNearBottom(distanceFromBottom < 50);
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
  if (!chatContainerRef.current) return;
  if (!isUserNearBottom) return;

  requestAnimationFrame(() => {
    if (isUserNearBottom) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  });
}, [isSelectedUserTyping]);

  const scrollButtonBottom = replyingTo ? "bottom-44" : "bottom-24";

  return (
    <div className="relative flex flex-col h-full">
      <ChatHeader isMobile={isMobile} />

      <div className="absolute inset-0 z-0">
        <ChatBackground />
      </div>

      <div
        ref={chatContainerRef}
        className="relative z-10 flex-1 px-6 overflow-y-auto py-8 "
      >
        {messages.length > 0 && !isMessagesLoading ? (
          <div className="max-w-3xl mx-auto space-y-6">

            {groupedMessages.map((group, groupIndex) => (
              <div key={groupIndex} className="space-y-4">

                {/* Sticky Date Divider */}
                <div className="flex justify-center sticky top-2 z-20">
                  <div className="bg-slate-800/70 backdrop-blur-md px-3 py-1 rounded-full text-xs text-slate-300 border border-slate-700/40 shadow">
                    {group.label}
                  </div>
                </div>

                {/* Messages with ANIMATION ONLY ADDED */}
                {group.messages.map((msg) => (
<motion.div
  key={msg._id}
  initial={{ opacity: 0, y: 10, scale: 0.98 }}
  whileInView={{ opacity: 1, y: 0, scale: 1 }}
  viewport={{  amount: 0.3, once: false  }}
  transition={{ duration: 0.25, ease: "easeOut" }}
>
    <MessageBubble
      message={msg}
      showNewDivider={
        filteredMessages.findIndex((m) => m._id === msg._id) ===
          dividerIndex && newMessagesCount > 0
      }
      newCount={newMessagesCount}
      isHighlighted={!!(searchText || searchDate)}
      isPinned={pinnedMessages[partnerId] === msg._id}
    />
  </motion.div>
))}

              </div>
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
