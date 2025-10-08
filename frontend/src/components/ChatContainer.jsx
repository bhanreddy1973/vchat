import { useEffect, useRef } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import ChatHeader from "./ChatHeader";
import NoChatHistoryPlaceholder from "./NoChatHistoryPlaceholder";
import MessageInput from "./MessageInput";
import MessagesLoadingSkeleton from "./MessagesLoadingSkeleton";
import DateSeparator from "./DateSeparator"; // ✅ Import DateSeparator

function ChatContainer() {
  const {
    selectedUser,
    getMessagesByUserId,
    messagesWithSeparators, // ✅ Use messagesWithSeparators instead of messages
    isMessagesLoading,
    subscribeToMessages,
    unsubscribeFromMessages,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);

  useEffect(() => {
    // ✅ Add safety check for selectedUser
    if (selectedUser?._id) {
      getMessagesByUserId(selectedUser._id);
      subscribeToMessages();
    }

    // clean up
    return () => unsubscribeFromMessages();
  }, [selectedUser, getMessagesByUserId, subscribeToMessages, unsubscribeFromMessages]);

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messagesWithSeparators]); // ✅ Changed from messages to messagesWithSeparators

  // ✅ Add safety check for selectedUser
  if (!selectedUser) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-slate-400">Select a contact to start chatting</p>
      </div>
    );
  }

  return (
    <>
      <ChatHeader />
      <div className="flex-1 px-6 overflow-y-auto py-8">
        {messagesWithSeparators.length > 0 && !isMessagesLoading ? (
          <div className="max-w-3xl mx-auto space-y-4">
            {/* ✅ Render both date separators and messages */}
            {messagesWithSeparators.map((item) => {
              // ✅ Render DateSeparator for date-separator type
              if (item.type === 'date-separator') {
                return <DateSeparator key={item.id} date={item.date} />;
              } 
              // ✅ Render Message for message type
              else if (item.type === 'message') {
                return (
                  <div
                    key={item._id}
                    className={`chat ${item.senderId === authUser._id ? "chat-end" : "chat-start"}`}
                  >
                    <div
                      className={`chat-bubble relative ${
                        item.senderId === authUser._id
                          ? "bg-cyan-600 text-white"
                          : "bg-slate-800 text-slate-200"
                      }`}
                    >
                      {item.image && (
                        <img src={item.image} alt="Shared" className="rounded-lg h-48 object-cover" />
                      )}
                      {item.text && <p className="mt-2">{item.text}</p>}
                      <p className="text-xs mt-1 opacity-75 flex items-center gap-1">
                        {new Date(item.createdAt).toLocaleTimeString(undefined, {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                );
              }
              
              return null;
            })}
            {/* 👇 scroll target */}
            <div ref={messageEndRef} />
          </div>
        ) : isMessagesLoading ? (
          <MessagesLoadingSkeleton />
        ) : (
          <NoChatHistoryPlaceholder name={selectedUser.fullname} />
        )}
      </div>

      <MessageInput />
    </>
  );
}

export default ChatContainer;