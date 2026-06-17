import { useEffect, useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";

import BorderAnimatedContainer from "../components/BorderAnimatedContainer";
import ProfileHeader from "../components/ProfileHeader";
import ActiveTabSwitch from "../components/ActiveTabSwitch";
import ChatsList from "../components/ChatsList";
import ContactList from "../components/ContactList";
import ChatContainer from "../components/ChatContainer";
import NoConversationPlaceholder from "../components/NoConversationPlaceholder";
import ForwardModal from "../components/ForwardModal";
import ProfileOverlay from "../components/ProfileOverlay";

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
  const { selectedUser, setSelectedUser, subscribeToMessages, unsubscribeFromMessages } =
    useChatStore();

  // const [swipeOffset, setSwipeOffset] = useState(0);
  // const touchStart = useRef({ x: 0, y: 0 });
  // const isSwipingBack = useRef(false);

  useEffect(() => {
    subscribeToMessages();
    return () => unsubscribeFromMessages();
  }, [subscribeToMessages, unsubscribeFromMessages]);

  // const handleBackTouchStart = (e) => {
  //   if (!selectedUser) return;
  //   const touch = e.touches[0];
  //   touchStart.current = { x: touch.clientX, y: touch.clientY, fromEdge: touch.clientX < 40 };
  //   isSwipingBack.current = true;
  // };

  // const handleBackTouchMove = (e) => {
  //   if (!isSwipingBack.current || !selectedUser) return;

  //   const touch = e.touches[0];
  //   const diffY = Math.abs(touch.clientY - touchStart.current.y);

  //   const dragX = touchStart.current.fromEdge
  //     ? touch.clientX - touchStart.current.x
  //     : touchStart.current.x - touch.clientX;

  //   if (diffY > Math.abs(dragX) && diffY > 25) {
  //     isSwipingBack.current = false;
  //     setSwipeOffset(0);
  //     return;
  //   }

  //   if (dragX > 0 && diffY < 50) {
  //     setSwipeOffset(Math.min(dragX, window.innerWidth * 0.45));
  //   }
  // };

  // const handleBackTouchEnd = () => {
  //   if (!isSwipingBack.current) return;

  //   if (swipeOffset > 80) {
  //     setSelectedUser(null);
  //   }

  //   setSwipeOffset(0);
  //   isSwipingBack.current = false;
  // };

  // const mobileTransform = selectedUser
  //   ? `translateX(calc(-50% + ${swipeOffset}px))`
  //   : "translateX(0)";

  return (
    <>
      <div className="md:hidden fixed inset-0 bg-slate-900 overflow-hidden">
       <div
       className="flex h-full w-[200%]"
       style={{
         transform: selectedUser ? "translateX(-50%)" : "translateX(0)",
         transition: "transform 300ms ease-in-out",
       }}
>
          <div className="w-1/2 h-full flex flex-col bg-slate-800">
            <ChatSidebar />
          </div>

          <div
            className="w-1/2 h-full flex flex-col bg-slate-900"
            // onTouchStart={handleBackTouchStart}
            // onTouchMove={handleBackTouchMove}
            // onTouchEnd={handleBackTouchEnd}
          >
            {selectedUser && <ChatContainer isMobile />}
          </div>
        </div>
      </div>

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
      <ProfileOverlay />
    </>
  );
}

export default ChatPage;
