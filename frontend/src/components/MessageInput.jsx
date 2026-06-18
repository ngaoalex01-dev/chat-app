import { useRef, useState } from "react";
import useKeyboardSound from "../hooks/useKeyboardSound";
import { useChatStore, getMessagePreview } from "../store/useChatStore";
import toast from "react-hot-toast";
import { ImageIcon, SendIcon, XIcon, MicIcon, SquareIcon } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";

function MessageInput() {
  const { playRandomKeyStrokeSound } = useKeyboardSound();
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [audioPreview, setAudioPreview] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingTimerRef = useRef(null);
  const streamRef = useRef(null);

  const {
    sendMessage,
    isSoundEnabled,
    selectedUser,
    replyingTo,
    clearReplyingTo,
  } = useChatStore();

  const { socket } = useAuthStore();

  const stopRecordingStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const reader = new FileReader();
        reader.onloadend = () => setAudioPreview(reader.result);
        reader.readAsDataURL(blob);
        stopRecordingStream();
      };

      recorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime((t) => t + 1);
      }, 1000);
    } catch {
      toast.error("Microphone access denied");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    clearInterval(recordingTimerRef.current);
    setIsRecording(false);
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.onstop = null;
      mediaRecorderRef.current.stop();
    }
    clearInterval(recordingTimerRef.current);
    stopRecordingStream();
    audioChunksRef.current = [];
    setIsRecording(false);
    setRecordingTime(0);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview && !audioPreview) return;
    if (isSoundEnabled) playRandomKeyStrokeSound();

    if (selectedUser && socket) {
      socket.emit("stopTyping", { receiverId: selectedUser._id });
    }

    sendMessage({
      text: text.trim() || undefined,
      image: imagePreview || undefined,
      audio: audioPreview || undefined,
    });

    setText("");
    setImagePreview(null);
    setAudioPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file?.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  const canSend = text.trim() || imagePreview || audioPreview;

  return (
    <div className="p-2 md:p-4 pb-3 md:pb-4 pt-2 z-30">
{replyingTo && (
  <div className="max-w-3xl mx-auto mb-3 pr-14">
    <div className="
      flex items-center justify-between
      rounded-xl px-4 py-3
      bg-white/5 backdrop-blur-xl
      border border-purple-400/20
      shadow-[0_0_20px_rgba(168,85,247,0.15)]
      relative overflow-hidden
    ">

      {/* LEFT PURPLE ACCENT BAR */}
      <div className="absolute left-0 top-0 h-full w-1.5 bg-gradient-to-b from-purple-500 via-fuchsia-500 to-purple-700 shadow-[0_0_12px_rgba(168,85,247,0.4)]" />

      {/* subtle glow overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-fuchsia-500/10 to-transparent pointer-events-none" />

      <div className="relative min-w-0 flex-1 pl-2">
        <p className="text-xs text-purple-300 font-medium">
          Replying to
        </p>

        <p className="text-sm text-slate-200 truncate">
          {getMessagePreview(replyingTo)}
        </p>
      </div>

      <button
        onClick={clearReplyingTo}
        className="
          relative ml-3 shrink-0 p-1
          text-slate-300 hover:text-white
          hover:bg-purple-500/20
          rounded-full transition-all
        "
        type="button"
      >
        <XIcon className="w-5 h-5" />
      </button>
    </div>
  </div>
)}

      {imagePreview && (
        <div className="max-w-3xl mx-auto mb-3 flex items-center">
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-20 h-20 object-cover rounded-lg border border-slate-700"
            />
            <button
              onClick={removeImage}
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-slate-200 hover:bg-slate-700"
              type="button"
            >
              <XIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {audioPreview && !isRecording && (
        <div className="max-w-3xl mx-auto mb-3 flex items-center gap-3">
          <audio controls src={audioPreview} className="flex-1 max-w-xs" />
          <button
            onClick={() => setAudioPreview(null)}
            className="text-slate-400 hover:text-slate-200"
            type="button"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>
      )}

      {isRecording && (
        <div className="max-w-3xl mx-auto mb-3 flex items-center justify-between bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-2">
          <div className="flex items-center gap-2 text-red-400">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium">Recording {formatTime(recordingTime)}</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={cancelRecording}
              className="text-slate-400 hover:text-slate-200 text-sm px-2"
              type="button"
            >
              Cancel
            </button>
            <button
              onClick={stopRecording}
              className="bg-red-500 text-white rounded-lg px-3 py-1 text-sm flex items-center gap-1"
              type="button"
            >
              <SquareIcon className="w-3 h-3 fill-current" />
              Stop
            </button>
          </div>
        </div>
      )}

      <form
        onSubmit={handleSendMessage}
        className="w-full max-w-3xl mx-auto flex items-center gap-1.5 md:gap-2 px-1 md:px-0"
      >
        <input
          type="text"
          value={text}
          onChange={(e) => {
            setText(e.target.value);

            if (selectedUser && socket) {
              socket.emit("typing", { receiverId: selectedUser._id });
              clearTimeout(typingTimeoutRef.current);
              typingTimeoutRef.current = setTimeout(() => {
                socket.emit("stopTyping", { receiverId: selectedUser._id });
              }, 1000);
            }

            isSoundEnabled && playRandomKeyStrokeSound();
          }}
          className="flex-1 min-w-0 bg-slate-800/80 backdrop-blur-md border border-slate-700/30 rounded-2xl py-2.5 md:py-3 px-3 md:px-4 text-sm md:text-base shadow-lg shadow-black/10"
          placeholder="Type your message..."
        />

        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleImageChange}
          className="hidden"
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className={`shrink-0 bg-slate-800/80 backdrop-blur-md border border-slate-700/30 rounded-2xl p-2.5 md:px-3 shadow-lg shadow-black/10 transition-all ${
            imagePreview ? "text-cyan-500" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <ImageIcon className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={isRecording ? stopRecording : startRecording}
          disabled={!!audioPreview}
          className={`shrink-0 bg-slate-800/80 backdrop-blur-md border border-slate-700/30 rounded-2xl p-2.5 md:px-3 shadow-lg shadow-black/10 transition-all ${
            isRecording
              ? "text-red-400 animate-pulse"
              : audioPreview
                ? "text-cyan-500"
                : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <MicIcon className="w-5 h-5" />
        </button>

        <button
          type="submit"
          disabled={!canSend}
          className="shrink-0 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-2xl p-2.5 md:px-4 md:py-3 shadow-lg shadow-cyan-500/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <SendIcon className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}

export default MessageInput;
