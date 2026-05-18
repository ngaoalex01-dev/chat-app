 import { create } from 'zustand';
 import { axiosInstance } from '../lib/axios';
 import toast from 'react-hot-toast';

 export const useAuthStore = create((set) => ({
  authUser: null,
  isCheckingAuth: true,//loading state to check if user is authenticated when app loads
  isSigningUp: false,
  isLoggingIn: false,
  isVerifyingEmail: false,

  checkAuth: async () => {
  try {
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data });
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
      // get().connectSocket();
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
      // get().connectSocket();
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
 }));
