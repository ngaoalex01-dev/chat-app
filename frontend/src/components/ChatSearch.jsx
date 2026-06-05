import { SearchRegular, DismissRegular, CalendarLtrRegular } from "@fluentui/react-icons";
import { useChatStore } from "../store/useChatStore";

function ChatSearch() {
  const {
    isSearchOpen,
    setSearchOpen,
    searchText,
    setSearchText,
    searchDate,
    setSearchDate,
    clearSearch,
  } = useChatStore();

  if (!isSearchOpen) {
    return (
      <button
        onClick={() => setSearchOpen(true)}
        className="text-slate-400 hover:text-cyan-200 transition-colors"
        aria-label="Search messages"
      >
        <SearchRegular className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2 flex-1 max-w-md ml-2">
      <div className="relative flex-1">
        <SearchRegular className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="Search messages..."
          autoFocus
          className="w-full bg-slate-700/50 border border-slate-600 rounded-lg py-1.5 pl-9 pr-3 text-sm text-slate-200 placeholder-slate-400 focus:outline-none focus:border-cyan-500"
        />
      </div>

      <div className="relative shrink-0">
        <CalendarLtrRegular className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          type="date"
          value={searchDate}
          onChange={(e) => setSearchDate(e.target.value)}
          className="bg-slate-700/50 border border-slate-600 rounded-lg py-1.5 pl-8 pr-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 [color-scheme:dark]"
        />
      </div>

      <button
        onClick={clearSearch}
        className="text-slate-400 hover:text-cyan-200 transition-colors shrink-0"
      >
        <DismissRegular className="w-5 h-5" />
      </button>
    </div>
  );
}

export default ChatSearch;
