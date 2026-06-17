import {
  SearchRegular,
  DismissCircleFilled ,
  CalendarLtrRegular,
  Search12Filled,
} from "@fluentui/react-icons";
import { useChatStore } from "../store/useChatStore";
import { useState } from "react";

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

  const [isHovered, setIsHovered] = useState(false);

  if (!isSearchOpen) {
    return (
      <button
        onClick={() => setSearchOpen(true)}
        className="text-slate-400 hover:text-cyan-200 transition-colors"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        aria-label="Search messages"
      >
        {isHovered ? (
          <Search12Filled className="w-6 h-6" />
        ) : (
          <SearchRegular className="w-6 h-6" />
        )}
      </button>
    );
  }

  return (
    <div className="flex items-center w-full">
      {/* LEFT: search controls */}
      <div className="flex items-center gap-3 flex-1 max-w-md ml-2">

        {/* search input */}
        <div className="relative flex-1">
          <SearchRegular className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />

          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search messages..."
            autoFocus
            className="w-full bg-slate-700/50 border border-slate-600 rounded-lg py-1.5 pl-9 pr-3 text-sm text-slate-200 placeholder-slate-400 focus:outline-none focus:border-cyan-500 "
          />
        </div>

        {/* date picker */}
        <div className="relative shrink-0">
          <CalendarLtrRegular className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />

          <input
            type="date"
            value={searchDate}
            onChange={(e) => setSearchDate(e.target.value)}
            className="bg-slate-700/50 border border-slate-600 rounded-lg py-1.5 pl-8 pr-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 [color-scheme:dark]"
          />
        </div>
      </div>

      {/* RIGHT: dismiss button */}
      <div className="ml-auto">
        <button
          onClick={clearSearch}
          className="text-slate-400 hover:text-cyan-200 transition-colors shrink-0"
        >
          <DismissCircleFilled className="w-7 h-7" />
        </button>
      </div>
    </div>
  );
}

export default ChatSearch;
