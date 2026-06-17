import { LogOutIcon, VolumeOffIcon, Volume2Icon, Gem } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";

const mouseClickSound = new Audio("/sounds/mouse-click.mp3");

function ProfileHeader() {
  const { logout, authUser } = useAuthStore();
  const { isSoundEnabled, toggleSound, openMyProfile } = useChatStore();

  return (
    <div className="p-6 border-b border-slate-700/50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="avatar avatar-online">
            <div className="size-14 rounded-full overflow-hidden">
              <img
                src={authUser.profilePic || "/avatar.png"}
                alt={authUser.fullName}
                className="size-full object-cover"
              />
            </div>
          </div>

          <div>
            <h3 className="text-slate-200 font-medium text-base max-w-[140px] truncate">
              {authUser.fullName}
            </h3>
            <p className="text-slate-400 text-xs">Online</p>
          </div>
        </div>

        <div className="flex gap-3 items-center">
          <button
            onClick={openMyProfile}
            className="p-2 rounded-lg text-purple-400 hover:text-purple-300 hover:bg-purple-500/15 transition-all"
            title="Edit profile"
            aria-label="Edit profile"
          >
            <Gem className="size-5" />
          </button>

          <button
            className="text-slate-400 hover:text-slate-200 transition-colors"
            onClick={logout}
          >
            <LogOutIcon className="size-5" />
          </button>

          <button
            className="text-slate-400 hover:text-slate-200 transition-colors"
            onClick={() => {
              mouseClickSound.currentTime = 0;
              mouseClickSound.play().catch(() => {});
              toggleSound();
            }}
          >
            {isSoundEnabled ? (
              <Volume2Icon className="size-5" />
            ) : (
              <VolumeOffIcon className="size-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProfileHeader;
