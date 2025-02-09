import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import {io} from "socket.io-client"

const BASE_URL = "http://localhost:5001"
export const useAuthStore = create((set, get)=>({
    authUser: null,
    isSigningUp: false,
    isLoggingIn: false,
    isUpdatingProfile:false,
    isCheckingAuth: true,
    onlineUsers:[], 
    socket:null,

    checkAuth: async()=>{
        try {
            const res = await axiosInstance.get('/auth/check');
            
            set({authUser: res.data})
            get().connectSocket()
        } catch (error) {
            console.log("error in checkAuth ",error);
            
            set({authUser:null})
        }finally{
            set({isCheckingAuth:false})
        }
    },

    signup: async (data) =>{
        set({isSigningUp: true})
        try {
            const res = await axiosInstance.post("/auth/signup",data)
            
            set({authUser: res.data})
            toast.success("Account created")

            get().connectSocket()
        } catch (error) {
            toast.error(error.response.data.message)
        }finally{
            set({isSigningUp: false})
        }
    },

    login: async(data)=>{
        set({isLoggingIn: true})
        try {
            const res = await axiosInstance.post("/auth/login",data)
            set({authUser: res.data})
            
            toast.success("Logged In")
            get().connectSocket()
        } catch (error) {
            console.log(error);
            
            toast.error(error.response.data.message)
        }finally{
            set({isLoggingIn: false})
        }
    },

    logout: async()=>{
        try {
            const res = await axiosInstance.post("/auth/logout")
            toast.success("Logged Out")
            get().disConnectSocket()
        } catch (error) {
            toast.error(error.response.data.message)
        }finally{
            set({authUser: null})
        }
    },

    updateProfile: async(data) =>{
        set({isUpdatingProfile: true})
        try {
            const res = await axiosInstance.put("/auth/update-profile",data)

            set({authUser: res.data})

            toast.success("successfully updated")
        } catch (error) {
            console.log(error);
            toast.error(error.response.data.message)
            
        }finally{
            set({isUpdatingProfile: false})
        }
    },

    connectSocket: ()=>{
        const {authUser} = get()
        if(!authUser || get().socket?.connected) return

        
        const socket = io(BASE_URL,{
            query:{
                userId: authUser._id
            }
        }
        )
        socket.connect()
        set({ socket: socket });

        socket.on("getOnlineUsers" ,(userIds)=>{
            set({onlineUsers: userIds})
        })
    },
    disConnectSocket: ()=>{
        if(get().socket?.connected) socket.disconnect()
    }
}));

