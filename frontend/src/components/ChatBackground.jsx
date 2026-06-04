function ChatBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* base soft gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950" />

      {/* faint cyan glow blobs */}
      <div className="absolute -top-20 -left-20 w-96 h-96 bg-cyan-500/10 blur-3xl rounded-full" />
      <div className="absolute top-1/3 -right-32 w-[28rem] h-[28rem] bg-cyan-400/10 blur-3xl rounded-full" />
      <div className="absolute bottom-0 left-1/3 w-[32rem] h-[32rem] bg-cyan-600/10 blur-3xl rounded-full" />

      {/* subtle "graffiti-like" chat pattern */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.04]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="chatPattern"
            width="120"
            height="120"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M20 60c0-20 20-40 40-40s40 20 40 40-20 40-40 40-40-20-40-40z"
              fill="none"
              stroke="cyan"
              strokeWidth="2"
            />
            <circle cx="60" cy="60" r="6" fill="cyan" opacity="0.2" />
          </pattern>
        </defs>

        <rect width="100%" height="100%" fill="url(#chatPattern)" />
      </svg>

      {/* diagonal light streaks */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute -rotate-12 w-[200%] h-[2px] bg-cyan-300 top-1/4" />
        <div className="absolute -rotate-12 w-[200%] h-[2px] bg-cyan-300 top-2/4" />
        <div className="absolute -rotate-12 w-[200%] h-[2px] bg-cyan-300 top-3/4" />
      </div>
    </div>
  );
}

export default ChatBackground;
