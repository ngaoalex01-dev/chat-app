import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";

const LAST_READ_KEY = "chatLastReadAt";
const PINNED_KEY = "chatPinnedMessages";

const loadLastReadAt = () => {// look into the local storage and get the last read at timestamps for each chat partner, if it fails return an empty object
  try {
    return JSON.parse(localStorage.getItem(LAST_READ_KEY)) || {};
  } catch {
    return {};
  }
};

const saveLastReadAt = (lastReadAt) => {// store the updated timestamps fro each chat partner in the local storage
  localStorage.setItem(LAST_READ_KEY, JSON.stringify(lastReadAt));
};

const loadPinnedMessages = () => {
  try {
    return JSON.parse(localStorage.getItem(PINNED_KEY)) || {};
  } catch {
    return {};
  }
};

const savePinnedMessages = (pinned) => {
  localStorage.setItem(PINNED_KEY, JSON.stringify(pinned));
};

const getSenderId = (message) =>
  String(message.senderId?._id || message.senderId);

const getPartnerId = (id) => String(id?._id || id);

const getMessagePreview = (msg) => {
  if (msg.text) return msg.text;
  if (msg.image) return " Photo";
  if (msg.audio) return " Voice note";
  return "";
};

export const useChatStore = create((set, get) => ({
  allContacts: [],
  chats: [],
  messages: [],
  activeTab: "chats",
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  isSoundEnabled: JSON.parse(localStorage.getItem("isSoundEnabled")) === true,
  unreadCounts: {},
  lastReadAt: loadLastReadAt(),
  dividerReadAt: null,
  newMessagesCount: 0,
  replyingTo: null,
  editingMessage: null,
  selectedMessageIds: [],
  isSelectMode: false,
  isForwardModalOpen: false,
  forwardMessageData: null,
  pinnedMessages: loadPinnedMessages(),
  isSearchOpen: false,
  searchText: "",
  searchDate: "",
  isDeletingMessages: false,

  toggleSound: () => {
    localStorage.setItem("isSoundEnabled", !get().isSoundEnabled);
    set({ isSoundEnabled: !get().isSoundEnabled });
  },

  setActiveTab: (tab) => set({ activeTab: tab }),

  setSearchOpen: (isSearchOpen) =>
    set({ isSearchOpen, searchText: isSearchOpen ? get().searchText : "", searchDate: isSearchOpen ? get().searchDate : "" }),

  setSearchText: (searchText) => set({ searchText }),
  setSearchDate: (searchDate) => set({ searchDate }),
  clearSearch: () => set({ searchText: "", searchDate: "", isSearchOpen: false }),

  updateChatListWithMessage: (partnerId, message) => {
    const pid = getPartnerId(partnerId);
    const { chats } = get();

    const updatedChats = chats.map((chat) => {
      if (getPartnerId(chat.user._id) === pid) {
        return { ...chat, lastMessage: message };
      }
      return chat;
    });

    const exists = updatedChats.some((c) => getPartnerId(c.user._id) === pid);
    if (!exists) {
      get().getMyChatPartners();
      return;
    }

    set({
      chats: updatedChats.sort(
        (a, b) =>
          new Date(b.lastMessage?.createdAt || 0) -
          new Date(a.lastMessage?.createdAt || 0)
      ),
    });
  },

  setSelectedUser: (selectedUser) => {
    if (!selectedUser) {
      set({
        selectedUser: null,
        newMessagesCount: 0,
        dividerReadAt: null,
        replyingTo: null,
        editingMessage: null,
        isSearchOpen: false,
        searchText: "",
        searchDate: "",
      });
      return;
    }

    const { lastReadAt, unreadCounts } = get();
    const userId = getPartnerId(selectedUser._id);
    const count = unreadCounts[userId] || 0;//keeps count of unread messages for the selected user, if it exists
    const previousReadAt = lastReadAt[userId] || null;//when was the last time the user read messages from this chat partner, if it exists

    const updatedLastRead = { ...lastReadAt, [userId]: new Date().toISOString() };
    saveLastReadAt(updatedLastRead);

    const updatedUnread = { ...unreadCounts };
    delete updatedUnread[userId];

    set({
      selectedUser,
      newMessagesCount: count,
      dividerReadAt: previousReadAt,
      lastReadAt: updatedLastRead,
      unreadCounts: updatedUnread,
      replyingTo: null,
      editingMessage: null,
      selectedMessageIds: [],
      isSelectMode: false,
      isSearchOpen: false,
      searchText: "",
      searchDate: "",
    });
  },

  getAllContacts: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/contacts");
      set({ allContacts: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMyChatPartners: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/chats");
      const { lastReadAt, unreadCounts } = get();
      const { authUser } = useAuthStore.getState();
      const computedUnread = { ...unreadCounts };

      res.data.forEach((chat) => {
        const partnerId = getPartnerId(chat.user._id);
        if (partnerId in computedUnread) return;

        const lastMsg = chat.lastMessage;
        if (!lastMsg || getSenderId(lastMsg) === String(authUser?._id)) return;

        const readAt = lastReadAt[partnerId];
        if (!readAt || new Date(lastMsg.createdAt) > new Date(readAt)) {
          computedUnread[partnerId] = 1;
        }
      });

      set({ chats: res.data, unreadCounts: computedUnread });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessagesByUserId: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      const { dividerReadAt, newMessagesCount } = get();
      const { authUser } = useAuthStore.getState();

      const messages = res.data;

      const dividerCount = dividerReadAt
      ? messages.filter ((msg) => {
        const isFromOtherUser =
        getSenderId(msg) != String(authUser._id);

        const isAfterRead =
        new Date(msg.createdAt) > new Date(dividerReadAt);

        return isFromOtherUser && isAfterRead;
      }).length
      : 0;

      set({
        messages: messages,
        newMessagesCount: dividerCount,
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages, replyingTo } = get();
    const { authUser } = useAuthStore.getState();

    const tempId = `temp-${Date.now()}`;
    const payload = {
      ...messageData,
      replyTo: replyingTo?._id || null,
    };

    const optimisticMessage = {
      _id: tempId,
      senderId: authUser._id,
      receiverId: selectedUser._id,
      text: messageData.text,
      image: messageData.image,
      audio: messageData.audio,
      replyTo: replyingTo,
      createdAt: new Date().toISOString(),
      isOptimistic: true,
    };

    set({ messages: [...messages, optimisticMessage], replyingTo: null });
    get().updateChatListWithMessage(selectedUser._id, optimisticMessage);

    try {
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, payload);
      const current = get().messages.filter((msg) => msg._id !== tempId);
      set({ messages: [...current, res.data] });
      get().updateChatListWithMessage(selectedUser._id, res.data);
    } catch (error) {
      set({ messages: get().messages.filter((msg) => msg._id !== tempId) });
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  },

  editMessage: async (messageId, text) => {
    try {
      const res = await axiosInstance.put(`/messages/${messageId}`, { text });
      set({
        messages: get().messages.map((msg) =>
          msg._id === messageId ? res.data : msg
        ),
        editingMessage: null,
      });
      toast.success("Message updated");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to edit message");
    }
  },

  setEditingMessage: (message) => set({ editingMessage: message, replyingTo: null }),
  clearEditingMessage: () => set({ editingMessage: null }),

  pinMessage: (message) => {
    const { selectedUser, pinnedMessages } = get();
    if (!selectedUser) return;

    const partnerId = getPartnerId(selectedUser._id);
    const updated = { ...pinnedMessages };
    const currentPin = updated[partnerId];

    if (currentPin === message._id) {
      delete updated[partnerId];
      toast.success("Message unpinned");
    } else {
      updated[partnerId] = message._id;
      toast.success("Message pinned");
    }

    savePinnedMessages(updated);
    set({ pinnedMessages: updated });
  },

  getPinnedMessage: () => {
    const { selectedUser, pinnedMessages, messages } = get();
    if (!selectedUser) return null;
    const pinId = pinnedMessages[getPartnerId(selectedUser._id)];
    return messages.find((m) => m._id === pinId) || null;
  },

  deleteMessage: async (messageId, silent = false) => {
    try {
      await axiosInstance.delete(`/messages/${messageId}`);
      set({
        messages: get().messages.filter((msg) => msg._id !== messageId),
        selectedMessageIds: get().selectedMessageIds.filter((id) => id !== messageId),
      });
      if (!silent) toast.success("Message deleted");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete message");
    }
  },

  deleteSelectedMessages: async () => {

    set({ isDeletingMessages: true });

    try {

    const { selectedMessageIds } = get();

    for (const id of selectedMessageIds) {
      await get().deleteMessage(id, true);
    }

    set({ selectedMessageIds: [], isSelectMode: false });
    toast.success(`${selectedMessageIds.length} message(s) deleted`);


    } finally{
      set({ isDeletingMessages: false });
    }

  },

  setReplyingTo: (message) =>
    set({ replyingTo: message, isSelectMode: false, selectedMessageIds: [], editingMessage: null }),

  clearReplyingTo: () => set({ replyingTo: null }),

  toggleMessageSelection: (messageId) => {
    const { selectedMessageIds } = get();
    const updated = selectedMessageIds.includes(messageId)
      ? selectedMessageIds.filter((id) => id !== messageId)
      : [...selectedMessageIds, messageId];
    set({ selectedMessageIds: updated, isSelectMode: updated.length > 0 });
  },

  enterSelectMode: (messageId) => {
    set({ isSelectMode: true, selectedMessageIds: [messageId], replyingTo: null, editingMessage: null });
  },

  exitSelectMode: () => set({ isSelectMode: false, selectedMessageIds: [] }),

  openForwardModal: (message) => {
    set({ isForwardModalOpen: true, forwardMessageData: message });
  },

  closeForwardModal: () => set({ isForwardModalOpen: false, forwardMessageData: null }),

  forwardMessage: async (contact) => {
    const { forwardMessageData } = get();
    if (!forwardMessageData || !contact) return;

    try {
      await axiosInstance.post(`/messages/send/${contact._id}`, {
        text: forwardMessageData.text
          ? `Forwarded: ${forwardMessageData.text}`
          : undefined,
        image: forwardMessageData.image || undefined,
        audio: forwardMessageData.audio || undefined,
      });
      toast.success(`Forwarded to ${contact.fullName}`);
      get().closeForwardModal();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to forward message");
    }
  },

  handleIncomingMessage: (newMessage) => {
    const { selectedUser, isSoundEnabled } = get();
    const { authUser } = useAuthStore.getState();
    const senderId = getSenderId(newMessage);

    if (senderId === String(authUser._id)) return;

    const isFromSelectedUser =
      selectedUser && senderId === getPartnerId(selectedUser._id);//determine if current selected user is the sender of the incoming message

      if (isFromSelectedUser) {
       const currentMessages = get().messages;

       if (!currentMessages.some((m) => m._id === newMessage._id)) {
         set({ messages: [...currentMessages, newMessage] });
       }

       const { lastReadAt } = get();

       const updatedLastRead = {
         ...lastReadAt,
         [senderId]: newMessage.createdAt,
       };

       saveLastReadAt(updatedLastRead);

       set({
         lastReadAt: updatedLastRead,
       });
 } else {
      set((state) => ({
        unreadCounts: {
          ...state.unreadCounts,
          [senderId]: (state.unreadCounts[senderId] || 0) + 1,
        },
      }));
    }

    set((state) => {
      const updatedChats = state.chats.map((chat) => {
        if (getPartnerId(chat.user._id) === senderId) {
          return { ...chat, lastMessage: newMessage };
        }
        return chat;
      });

      const chatExists = updatedChats.some(
        (c) => getPartnerId(c.user._id) === senderId
      );

      if (!chatExists) {
        get().getMyChatPartners();
        return state;
      }

      return {
        chats: updatedChats.sort(
          (a, b) =>
            new Date(b.lastMessage?.createdAt || 0) -
            new Date(a.lastMessage?.createdAt || 0)
        ),
      };
    });

    if (isSoundEnabled) {
      const notificationSound = new Audio("/sounds/notification.mp3");
      notificationSound.currentTime = 0;
      notificationSound.play().catch((e) => console.log("Audio play failed:", e));
    }
  },

  subscribeToMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.off("newMessage");
    socket.on("newMessage", (newMessage) => {
      get().handleIncomingMessage(newMessage);
    });

  socket.off("messageDeleted");
  socket.on("messageDeleted", ({ messageId }) => {
  const filteredMessages = get().messages.filter(
    (msg) => msg._id !== messageId
  );

  const { dividerReadAt } = get();
  const { authUser } = useAuthStore.getState();

  const dividerCount = dividerReadAt
    ? filteredMessages.filter((msg) => {
        const isFromOtherUser =
          getSenderId(msg) !== String(authUser._id);

        const isAfterRead =
          new Date(msg.createdAt) > new Date(dividerReadAt);

        return isFromOtherUser && isAfterRead;
      }).length
    : 0;

  set({
    messages: filteredMessages,
    newMessagesCount: dividerCount,
  });
 });

    socket.off("messageUpdated");
    socket.on("messageUpdated", (updatedMessage) => {
      set({
        messages: get().messages.map((msg) =>
          msg._id === updatedMessage._id ? updatedMessage : msg
        ),
      });
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;
    socket.off("newMessage");
    socket.off("messageDeleted");
    socket.off("messageUpdated");
  },
}));

export { getMessagePreview };

