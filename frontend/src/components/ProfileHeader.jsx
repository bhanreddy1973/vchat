import { useState, useRef } from "react";
import { LogOutIcon, VolumeOffIcon, Volume2Icon } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import toast from "react-hot-toast"; // ✅ Add this import

const mouseClickSound = new Audio("/sounds/mouse-click.mp3");

function ProfileHeader() {
  const { logout, authUser, updateProfile, isUpdatingProfile } = useAuthStore();
  const { isSoundEnabled, toggleSound } = useChatStore();
  const [selectedImg, setSelectedImg] = useState(null);

  const fileInputRef = useRef(null);

  // ✅ Updated to handle up to 5MB
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // ✅ Check file size before processing (limit to 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
        toast.error('Image must be smaller than 5MB');
        return;
    }

    // ✅ Check file type
    if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
    }

    // ✅ Show loading state
    toast.loading('Uploading image...', { id: 'upload' });

    const reader = new FileReader();
    reader.onloadend = async () => {
        try {
            console.log('File read complete, data length:', reader.result.length);
            console.log('Original file size:', (file.size / 1024 / 1024).toFixed(2), 'MB');
            
            // ✅ Additional check after base64 conversion (base64 is ~33% larger)
            if (reader.result.length > 7000000) { // ~5MB base64 = ~7MB string
                toast.error('Image is too large after processing');
                toast.dismiss('upload');
                return;
            }
            
            // ✅ Set preview image immediately
            setSelectedImg(reader.result);
            
            await updateProfile({ 
                profilePic: reader.result
            });
            
            toast.success('Profile picture updated!');
            toast.dismiss('upload');
            
        } catch (error) {
            console.error('Profile update failed:', error);
            toast.error('Failed to update profile picture');
            toast.dismiss('upload');
            // ✅ Reset preview on error
            setSelectedImg(null);
        }
    };
    
    reader.readAsDataURL(file);
  };

  return (
    <div className="p-6 border-b border-slate-700/50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* AVATAR */}
          <div className="avatar online">
            <button
              className="size-14 rounded-full overflow-hidden relative group"
              onClick={() => fileInputRef.current.click()}
              disabled={isUpdatingProfile} // ✅ Disable during upload
            >
              <img
                src={selectedImg || authUser.profilePic || "/avatar.png"}
                alt="User image"
                className="size-full object-cover"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <span className="text-white text-xs">
                  {isUpdatingProfile ? 'Uploading...' : 'Change'} {/* ✅ Show upload state */}
                </span>
              </div>
            </button>

            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>

          {/* USERNAME & ONLINE TEXT */}
          <div>
            <h3 className="text-slate-200 font-medium text-base max-w-[180px] truncate">
              {authUser.fullname} {/* ✅ Fixed: should be fullname not fullname*/}
            </h3>

            <p className="text-slate-400 text-xs">Online</p>
          </div>
        </div>

        {/* BUTTONS */}
        <div className="flex gap-4 items-center">
          {/* LOGOUT BTN */}
          <button
            className="text-slate-400 hover:text-slate-200 transition-colors"
            onClick={logout}
          >
            <LogOutIcon className="size-5" />
          </button>

          {/* SOUND TOGGLE BTN */}
          <button
            className="text-slate-400 hover:text-slate-200 transition-colors"
            onClick={() => {
              mouseClickSound.currentTime = 0;
              mouseClickSound.play().catch((error) => console.log("Audio play failed:", error));
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