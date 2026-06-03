import { useChatStore } from "../store/useChatStore";
import { MessageSquare , User} from "lucide-react";

function ActiveTabSwitch() {
  const { activeTab, setActiveTab } = useChatStore();

  return (
    <div className="tabs  bg-transparent p-2 m-2 gap-7">
      <button
        onClick={() => setActiveTab("chats")}
        className={`tab rounded-full  ${
          activeTab === "chats" ? "bg-cyan-500/20 text-cyan-400" : "text-slate-400"
        }`}
      >
        <MessageSquare className="size-5 mr-2" />
        Chats
      </button>

      <button
        onClick={() => setActiveTab("contacts")}
          className={`tab rounded-full ${
          activeTab === "contacts" ? "bg-cyan-500/20 text-cyan-400" : "text-slate-400"
        }`}
      >
        <User className="size-5 mr-2" />
        Contacts
      </button>
    </div>
  );
}
export default ActiveTabSwitch;
