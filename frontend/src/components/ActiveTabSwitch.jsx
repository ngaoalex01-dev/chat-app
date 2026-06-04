import { useChatStore } from "../store/useChatStore";
import { ChatRegular, PersonRegular, PersonFilled , ChatFilled  } from "@fluentui/react-icons";

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
        {activeTab === "chats" ? (
          <ChatFilled className="size-5 mr-2" primaryFill="#22d3ee" />
        ) : (
          <ChatRegular className="size-5 mr-2" primaryFill="#94a3b8" />
        )

        }
        Chats
      </button>

      <button
        onClick={() => setActiveTab("contacts")}
          className={`tab rounded-full ${
          activeTab === "contacts" ? "bg-cyan-500/20 text-cyan-400" : "text-slate-400"
        }`}
      >
        { activeTab === "contacts" ? (
          <PersonFilled className="size-5 mr-2" primaryFill="#22d3ee" />
        ) : (
            <PersonRegular className="size-5 mr-2"  primaryFill="#94a3b8"/>
        )

        }
        Contacts
      </button>
    </div>
  );
}
export default ActiveTabSwitch;
