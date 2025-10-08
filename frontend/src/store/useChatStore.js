import { create } from "zustand";
import axiosInstance from "../lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";
import { isSameDay } from "../utils/dateUtils"; // ✅ Import date utility

export const useChatStore = create((set, get) => ({
  allContacts: [],
  chats: [],
  messages: [],
  messagesWithSeparators: [], // ✅ New field for processed messages
  activeTab: "chats",
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  isSoundEnabled: JSON.parse(localStorage.getItem("isSoundEnabled")) === true,

  // ✅ Function to add date separators to messages
  processMessagesWithDateSeparators: (messages) => {
    if (!messages || messages.length === 0) return [];

    const processedMessages = [];
    let lastDate = null;

    messages.forEach((message, index) => {
      const messageDate = new Date(message.createdAt);
      
      // Check if we need to add a date separator
      if (!lastDate || !isSameDay(lastDate, messageDate)) {
        processedMessages.push({
          type: 'date-separator',
          id: `date-${messageDate.toISOString()}`,
          date: messageDate.toISOString()
        });
        lastDate = messageDate;
      }

      // Add the actual message
      processedMessages.push({
        type: 'message',
        ...message
      });
    });

    return processedMessages;
  },

  toggleSound: () => {
    const currentSound = get().isSoundEnabled;
    localStorage.setItem("isSoundEnabled", JSON.stringify(!currentSound));
    set({ isSoundEnabled: !currentSound });
  },

  setActiveTab: (tab) => set({ activeTab: tab }),
  setSelectedUser: (selectedUser) => set({ selectedUser }),

  getAllContacts: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/contacts");
      console.log("📞 Contacts response:", res.data);
      set({ allContacts: res.data || [] });
    } catch (error) {
      console.error("Error fetching contacts:", error);
      toast.error(error.response?.data?.message || "Failed to fetch contacts");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMyChatPartners: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/chats");
      console.log("💬 Chats response:", res.data);
      set({ chats: res.data || [] });
    } catch (error) {
      console.error("Error fetching chats:", error);
      toast.error(error.response?.data?.message || "Failed to fetch chats");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  updateChatOrder: (userId) => {
    const { chats } = get();
    const chatIndex = chats.findIndex(chat => chat._id === userId);
    
    if (chatIndex > 0) {
      const updatedChats = [...chats];
      const [movedChat] = updatedChats.splice(chatIndex, 1);
      updatedChats.unshift({
        ...movedChat,
        lastMessageTime: new Date().toISOString()
      });
      
      set({ chats: updatedChats });
    }
  },

  getMessagesByUserId: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      console.log("📨 Messages response:", res.data);
      
      const messages = res.data || [];
      
      // ✅ Process messages with date separators
      const messagesWithSeparators = get().processMessagesWithDateSeparators(messages);
      
      set({ 
        messages: messages,
        messagesWithSeparators: messagesWithSeparators
      });
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error(error.response?.data?.message || "Failed to fetch messages");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    const { authUser } = useAuthStore.getState();

    if (!selectedUser) {
      toast.error("No user selected");
      return;
    }

    const tempId = `temp-${Date.now()}`;

    const optimisticMessage = {
      _id: tempId,
      senderId: authUser._id,
      receiverId: selectedUser._id,
      text: messageData.text || "",
      image: messageData.image || "",
      createdAt: new Date().toISOString(),
      isOptimistic: true,
    };

    // ✅ Update messages and reprocess with separators
    const newMessages = [...messages, optimisticMessage];
    const messagesWithSeparators = get().processMessagesWithDateSeparators(newMessages);
    
    set({ 
      messages: newMessages,
      messagesWithSeparators: messagesWithSeparators
    });

    try {
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
      
      const realMessage = res.data;
      console.log("📤 Send message response:", realMessage);
      
      // ✅ Replace optimistic message with real message
      const updatedMessages = get().messages.map(msg => 
        msg._id === tempId ? realMessage : msg
      );
      
      const updatedMessagesWithSeparators = get().processMessagesWithDateSeparators(updatedMessages);
      
      set({ 
        messages: updatedMessages,
        messagesWithSeparators: updatedMessagesWithSeparators
      });
      
      get().updateChatOrder(selectedUser._id);
      
    } catch (error) {
      console.error("Error sending message:", error);
      
      const filteredMessages = get().messages.filter(msg => msg._id !== tempId);
      const filteredMessagesWithSeparators = get().processMessagesWithDateSeparators(filteredMessages);
      
      set({ 
        messages: filteredMessages,
        messagesWithSeparators: filteredMessagesWithSeparators
      });
      
      toast.error(error.response?.data?.message || "Failed to send message");
    }
  },

  subscribeToMessages: () => {
    const { selectedUser, isSoundEnabled } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;
    
    if (!socket) {
      console.warn("Socket not available for message subscription");
      return;
    }

    socket.on("newMessage", (newMessage) => {
      console.log("📡 New message received:", newMessage);
      const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id;
      if (!isMessageSentFromSelectedUser) return;

      // ✅ Add new message and reprocess with separators
      const currentMessages = get().messages;
      const updatedMessages = [...currentMessages, newMessage];
      const messagesWithSeparators = get().processMessagesWithDateSeparators(updatedMessages);

      set({ 
        messages: updatedMessages,
        messagesWithSeparators: messagesWithSeparators
      });

      get().updateChatOrder(newMessage.senderId);

      if (isSoundEnabled) {
        const notificationSound = new Audio("/sounds/notification.mp3");
        notificationSound.currentTime = 0;
        notificationSound.play().catch((e) => console.log("Audio play failed:", e));
      }
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (socket) {
      socket.off("newMessage");
    }
  },
}));