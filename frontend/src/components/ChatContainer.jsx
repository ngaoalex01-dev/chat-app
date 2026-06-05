import { useEffect, useRef, useState } from "react";
import { ArrowDownRegular } from "@fluentui/react-icons";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import ChatHeader from "./ChatHeader";
import NoChatHistoryPlaceholder from "./NoChatHistoryPlaceholder";
import MessageInput from "./MessageInput";
import MessagesLoadingSkeleton from "./MessagesLoadingSkeleton";
import ChatBackground from "./ChatBackground";
import { AnimatePresence, motion } from "framer-motion";

function ChatContainer() {
  const {
    selectedUser,
    getMessagesByUserId,
    messages,
    isMessagesLoading,
    subscribeToMessages,
    unsubscribeFromMessages,
  } = useChatStore();

  const { authUser, typingUsers } = useAuthStore();

  const messageEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  const isSelectedUserTyping = selectedUser && typingUsers?.[selectedUser._id];

  const [showScrollButton, setShowScrollButton] = useState(false);
  const [ isUserNearBottom, setIsUserNearBottom] = useState(true);

  const showTypingPill = showScrollButton &&isSelectedUserTyping;

  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Load messages + subscribe
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

  // Auto scroll on load/new messages
  useEffect(() => {
    if (isUserNearBottom && messageEndRef.current) {
      messageEndRef.current.scrollIntoView({
      });
    }
  }, [messages, isSelectedUserTyping]);

  // Detect scroll position
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

    //cleaner function
    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className="relative flex flex-col h-full">
      {/* Header */}
      <ChatHeader />

      {/* BACKGROUND LAYER */}
      <div className="absolute inset-0 z-0">
        <ChatBackground />
      </div>

      {/* CHAT AREA */}
      <div
        ref={chatContainerRef}
        className="relative z-10 flex-1 px-6 overflow-y-auto py-8"
      >
        {messages.length > 0 && !isMessagesLoading ? (
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.map((msg) => (
              <div
                key={msg._id}
                className={`chat ${
                  msg.senderId === authUser._id
                    ? "chat-end"
                    : "chat-start"
                }`}
              >
                <div
                  className={`chat-bubble relative ${
                    msg.senderId === authUser._id
                      ? "bg-cyan-600 text-white"
                      : "bg-slate-800 text-slate-200"
                  }`}
                >
                  {msg.image && (
                    <img
                      src={msg.image}
                      alt="Shared"
                      className="rounded-lg h-48 object-cover"
                    />
                  )}

                  {msg.text && <p className="mt-2">{msg.text}</p>}

                  <p className="text-xs mt-1 opacity-75 flex items-center gap-1">
                    {new Date(msg.createdAt).toLocaleTimeString(undefined, {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
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


            {/* scroll anchor */}
            <div ref={messageEndRef} />
          </div>
        ) : isMessagesLoading ? (
          <MessagesLoadingSkeleton />
        ) : (
          <NoChatHistoryPlaceholder name={selectedUser.fullName} />
        )}
      </div>

      {/* SCROLL TO BOTTOM BUTTON */}
      {showScrollButton && (
        <button
          onClick={scrollToBottom}
          className="
            fixed bottom-24 right-8 z-50
            flex items-center justify-center
            rounded-full
            bg-cyan-600 text-white
            shadow-lg shadow-black/20
            hover:scale-105 active:scale-95
            transition-all duration-300
            px-4 py-3
          "
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

      {/* INPUT */}
      <MessageInput />
    </div>
  );
}

export default ChatContainer;
