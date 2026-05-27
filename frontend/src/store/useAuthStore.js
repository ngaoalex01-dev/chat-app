 import { create } from 'zustand';
 import { axiosInstance } from '../lib/axios';
 import toast from 'react-hot-toast';
 import { io } from 'socket.io-client';

 const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:3000" : "/";


 export const useAuthStore = create((set,get) => ({
  authUser: null,
  isCheckingAuth: true,//loading state to check if user is authenticated when app loads
  isSigningUp: false,
  isLoggingIn: false,
  isVerifyingEmail: false,
  socket: null,
  onlineUsers: [],

  checkAuth: async () => {
  try {
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data });
      get().connectSocket();
  } catch (error) {
    console.log("Error in authCheck:", error);
    set({ authUser: null });
  }finally {
    set({ isCheckingAuth: false });
  }
    },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      set({ authUser: res.data });

      toast.success("CODE SENT TO YOUR EMAIL!");

      get().connectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/Login", data);
      set({ authUser: res.data });

      toast.success("LOGGED IN SUCCESSFULLY ");

      get().connectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      toast.success("Logged out successfully");
      get().disconnectSocket();
    } catch (error) {
      toast.error("Error logging out");
      console.log("Logout error:", error);
    }
  },

  verifyEmail: async ( { code } ) => {
    set({ isVerifyingEmail: true });
    try {
      const res = await axiosInstance.post("/auth/verify-email", { code });
      set({ authUser: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isVerifyingEmail: false });
    }
  },

  updateProfile: async (data) => {
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data });
      toast.success("Profile updated successfully");
    } catch (error) {
      console.log("Error in update profile:", error);
      toast.error(error.response.data.message);
    }
  },

  connectSocket: () => {
    const { authUser } = get();
    if (!authUser || get().socket?.connected) return;

    const socket = io(BASE_URL,
      { withCredentials: true });// important to send cookies for authentication

      socket.connect();
      set({ socket });

      //listen for online users event from server
      socket.on("getOnlineUsers", (userIds) => {
        set({ onlineUsers: userIds });
      });
  },

  disconnectSocket: () => {
    if (get().socket?.connected) get().socket.disconnect();
  },
 }));
