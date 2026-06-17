import { createPortal } from "react-dom";
import { useRef, useState, useEffect } from "react";
import { X, Camera, Gem } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { isUserOnline } from "../lib/onlineStatus";

function ProfileOverlay() {
  const { profileView, closeProfileView } = useChatStore();
  const { authUser, updateProfile, onlineUsers } = useAuthStore();

  const [fullName, setFullName] = useState("");
  const [previewImg, setPreviewImg] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef(null);

  const isSelf = profileView?.type === "self";
  const user = isSelf ? authUser : profileView?.user;
  const online = isUserOnline(user?._id, onlineUsers);

  useEffect(() => {
    if (profileView?.type === "self" && authUser) {
      setFullName(authUser.fullName || "");
      setPreviewImg(null);
    }
  }, [profileView, authUser]);

  if (!profileView || !user) return null;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setPreviewImg(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!isSelf) return;
    setIsSaving(true);
    try {
      const payload = {};
      if (fullName.trim() && fullName.trim() !== authUser.fullName) {
        payload.fullName = fullName.trim();
      }
      if (previewImg) payload.profilePic = previewImg;
      if (Object.keys(payload).length > 0) {
        await updateProfile(payload);
      }
      closeProfileView();
    } finally {
      setIsSaving(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={closeProfileView}
      />

      <div className="relative w-full max-w-md rounded-2xl overflow-hidden border border-purple-500/30 shadow-2xl shadow-purple-900/40">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-950 via-black to-purple-900/80" />

        <div className="relative p-6">
          <button
            onClick={closeProfileView}
            className="absolute top-4 right-4 p-2 rounded-lg text-purple-300/70 hover:text-purple-100 hover:bg-purple-500/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col items-center text-center pt-4">
            <div className="relative mb-4">
              <div
                className={`rounded-full p-1 ${
                  online
                    ? "bg-gradient-to-r from-purple-400 to-purple-600 shadow-[0_0_20px_rgba(168,85,247,0.5)]"
                    : "bg-purple-900/60"
                }`}
              >
                <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-purple-500/40 bg-black">
                  <img
                    src={previewImg || user.profilePic || "/avatar.png"}
                    alt={user.fullName}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {isSelf && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-1 right-1 p-2 rounded-full bg-purple-600 text-white shadow-lg hover:bg-purple-500 transition-colors"
                >
                  <Camera className="w-4 h-4" />
                </button>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </div>

            <div className="flex items-center gap-2 mb-1">
              <Gem className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-semibold uppercase tracking-widest text-purple-400/90">
                {isSelf ? "My Profile" : "Contact Profile"}
              </span>
            </div>

            {isSelf ? (
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full max-w-xs mt-3 bg-purple-950/50 border border-purple-500/30 rounded-xl px-4 py-2.5 text-center text-lg font-medium text-purple-50 placeholder-purple-400/50 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-500/40"
                placeholder="Your name"
              />
            ) : (
              <h2 className="text-2xl font-semibold text-purple-50 mt-2">
                {user.fullName}
              </h2>
            )}

            <p className="text-sm text-purple-300/70 mt-2">{user.email}</p>

            <div
              className={`mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
                online
                  ? "bg-purple-500/20 text-purple-300 border border-purple-400/30"
                  : "bg-black/40 text-slate-400 border border-slate-700/50"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  online ? "bg-purple-400 animate-pulse" : "bg-slate-500"
                }`}
              />
              {online ? "Online" : "Offline"}
            </div>
          </div>

          {isSelf && (
            <div className="mt-8 flex gap-3">
              <button
                onClick={closeProfileView}
                className="flex-1 py-2.5 rounded-xl border border-purple-500/30 text-purple-300 hover:bg-purple-500/10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 text-white font-medium hover:from-purple-500 hover:to-purple-400 transition-all disabled:opacity-50 shadow-lg shadow-purple-900/30"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

export default ProfileOverlay;
