import { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import UsersLoadingSkeleton from "./UsersLoadingSkeleton";
import NoChatsFound from "./NoChatsFound";
import { useAuthStore } from "../store/useAuthStore";

function ChatsList() {
  const { 
    getMyChatPartners, 
    chats, 
    isUsersLoading, 
    setSelectedUser,
    messages // ✅ Add messages to dependencies
  } = useChatStore();
  const { onlineUsers } = useAuthStore();

  useEffect(() => {
    getMyChatPartners();
  }, [getMyChatPartners]);

  // ✅ Re-fetch chats when messages change
  useEffect(() => {
    if (messages.length > 0) {
      getMyChatPartners();
    }
  }, [messages, getMyChatPartners]);

  if (isUsersLoading) return <UsersLoadingSkeleton />;
  if (!chats || chats.length === 0) return <NoChatsFound />;

  return (
    <>
      {chats.map((chat) => (
        <div
          key={chat._id}
          className="bg-cyan-500/10 p-4 rounded-lg cursor-pointer hover:bg-cyan-500/20 transition-colors"
          onClick={() => setSelectedUser(chat)}
        >
          <div className="flex items-center gap-3">
            {/* ✅ Add safety check for onlineUsers */}
            <div className={`avatar ${(onlineUsers || []).includes(chat._id) ? "online" : "offline"}`}>
              <div className="size-12 rounded-full">
                <img src={chat.profilePic || "/avatar.png"} alt={chat.fullname} />
              </div>
            </div>
            <div className="flex-1">
              <h4 className="text-slate-200 font-medium truncate">{chat.fullname}</h4>
              {/* ✅ Optional: Show last message preview */}
              {chat.lastMessage && (
                <p className="text-slate-400 text-sm truncate">
                  {chat.lastMessage.text || "📷 Image"}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </>
  );
}

export default ChatsList;