import { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";

import BorderAnimatedContainer from "../components/BorderAnimatedContainer";
import ProfileHeader from "../components/ProfileHeader";
import ActiveTabSwitch from "../components/ActiveTabSwitch";
import ChatsList from "../components/ChatsList";
import ContactList from "../components/ContactList";
import ChatContainer from "../components/ChatContainer";
import NoConversationPlaceholder from "../components/NoConversationPlaceholder";
import ForwardModal from "../components/ForwardModal";

function ChatSidebar() {
  const { activeTab } = useChatStore();

  return (
    <>
      <ProfileHeader />
      <ActiveTabSwitch />
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {activeTab === "chats" ? <ChatsList /> : <ContactList />}
      </div>
    </>
  );
}

function ChatPage() {
  const { selectedUser, subscribeToMessages } = useChatStore();

  useEffect(() => {
    subscribeToMessages();
  }, [subscribeToMessages]);

  return (
    <>
      {/* Mobile: WhatsApp-style slide navigation */}
      <div className="md:hidden fixed inset-0 bg-slate-900 overflow-hidden">
        <div
          className="flex h-full w-[200%] transition-transform duration-300 ease-in-out"
          style={{
            transform: selectedUser ? "translateX(-50%)" : "translateX(0)",
          }}
        >
          <div className="w-1/2 h-full flex flex-col bg-slate-800">
            <ChatSidebar />
          </div>

          <div className="w-1/2 h-full flex flex-col bg-slate-900">
            {selectedUser && <ChatContainer isMobile />}
          </div>
        </div>
      </div>

      {/* Desktop: existing two-column layout */}
      <div className="hidden md:block relative w-full max-w-6xl h-[800px]">
        <BorderAnimatedContainer>
          <div className="w-80 bg-slate-800/50 backdrop-blur-sm flex flex-col">
            <ChatSidebar />
          </div>

          <div className="flex-1 flex flex-col bg-slate-900/50 backdrop-blur-sm">
            {selectedUser ? <ChatContainer /> : <NoConversationPlaceholder />}
          </div>
        </BorderAnimatedContainer>
      </div>

      <ForwardModal />
    </>
  );
}

export default ChatPage;
