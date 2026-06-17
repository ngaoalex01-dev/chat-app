import { useEffect } from "react";
import { X } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { isUserOnline } from "../lib/onlineStatus";

function ForwardModal() {
  const {
    isForwardModalOpen,
    closeForwardModal,
    forwardMessage,
    allContacts,
    getAllContacts,
  } = useChatStore();
  const { onlineUsers } = useAuthStore();

  useEffect(() => {
    if (isForwardModalOpen && allContacts.length === 0) {
      getAllContacts();
    }
  }, [isForwardModalOpen, allContacts.length, getAllContacts]);

  if (!isForwardModalOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-800 rounded-xl w-full max-w-md mx-4 max-h-[70vh] flex flex-col border border-slate-700">
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h3 className="text-slate-200 font-medium">Forward to</h3>
          <button
            onClick={closeForwardModal}
            className="text-slate-400 hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-2 space-y-1">
          {allContacts.map((contact) => (
            <button
              key={contact._id}
              onClick={() => forwardMessage(contact)}
              className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-slate-700/50 transition-colors"
            >
              <div
                className={`avatar ${
                  isUserOnline(contact._id, onlineUsers) ? "avatar-online" : "avatar-offline"
                }`}
              >
                <div className="size-10 rounded-full">
                  <img
                    src={contact.profilePic || "/avatar.png"}
                    alt={contact.fullName}
                  />
                </div>
              </div>
              <span className="text-slate-200 text-sm">{contact.fullName}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ForwardModal;
