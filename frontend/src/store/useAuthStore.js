import { create } from "zustand";
import axiosInstance from "../lib/axios";
import toast from "react-hot-toast";

export const useAuthStore = create((set) => ({
    authUser: null,
    isCheckingAuth: true,
    isSigningUp: false,
    isLoggingIn: false,

    checkAuth: async () => {
        try {
            const res = await axiosInstance.get('/auth/check');
            set({ authUser: res.data.user, isCheckingAuth: false });
        } catch (error) {
            console.log("Auth check failed (normal if not logged in):", error.response?.status);
            set({ authUser: null, isCheckingAuth: false }); // ✅ Set authUser to null
        }
    },

    signup: async (data) => {
        set({ isSigningUp: true });
        try {
            console.log('Signup data being sent:', data); // ✅ Debug log
            
            const res = await axiosInstance.post('/auth/signup', {
                fullname: data.fullName, // ✅ Map fullName to fullname
                email: data.email,
                password: data.password
            });
            
            console.log('Signup response:', res.data); // ✅ Debug log
            
            set({ 
                authUser: res.data.user, 
                isSigningUp: false 
            });
            
            toast.success('Account created successfully!');
        } catch (error) {
            set({ isSigningUp: false });
            console.error('Signup error details:', error.response?.data); // ✅ Better error logging
            
            const errorMsg = error.response?.data?.message || 'Error creating account';
            toast.error(errorMsg);
        }
    },

    login: async (data) => {
        set({ isLoggingIn: true });
        try {
            const res = await axiosInstance.post('/auth/login', data);
            set({ 
                authUser: res.data.user, 
                isLoggingIn: false 
            });
            toast.success('Logged in successfully!');
        } catch (error) {
            set({ isLoggingIn: false });
            const errorMsg = error.response?.data?.message || 'Login failed';
            toast.error(errorMsg);
        }
    },

    logout: async () => {
        try {
            await axiosInstance.post('/auth/logout');
            set({ authUser: null });
            toast.success('Logged out successfully!');
        } catch (error) {
            console.error('Logout error:', error);
        }
    }
}));