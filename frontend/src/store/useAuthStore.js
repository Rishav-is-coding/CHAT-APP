import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import {io} from "socket.io-client"
import JSEncrypt from "jsencrypt";

const BASE_URL = "http://localhost:5001"

export const useAuthStore = create((set , get) => ({
    authUser : null,
    privateKey: null,
    isSigningUp : false,
    isLoggingIng : false,
    isUpdatingProfile : false,

    isCheckingAuth : true,
    onlineUsers : [],
    socket : null,

    checkAuth : async() => {
        try {
            const res = await axiosInstance.get("/auth/check")
            const privateKey = localStorage.getItem(`privateKey_${res.data.email}`);
            set({authUser : res.data , privateKey})
            get().connectSocket()
        }catch(error) {
            console.log("error in checkAuth : " , error)
            set({authUser : null , privateKey: null})
        }finally{
            set({isCheckingAuth : false})
        }
    },

    signup : async (data) => {
        set({isSigningUp : true})
        try{
            const encrypt = new JSEncrypt({ default_key_size: 2048 });
            const privateKey = encrypt.getPrivateKey();
            const publicKey = encrypt.getPublicKey();

            localStorage.setItem(`privateKey_${data.email}`, privateKey);

            const res = await axiosInstance.post("/auth/signup" , { ...data, publicKey })
            set({authUser : res.data , privateKey})
            toast.success("Account created successfully")
            
            get().connectSocket()
        }catch(error) {
            toast.error(error.response.data.message)
        }finally {
            set({isSigningUp : false})
        }
    },

    logout : async () => {
        try{
            const { authUser } = get();
            await axiosInstance.post("/auth/logout")

            if (authUser) {
                localStorage.removeItem(`privateKey_${authUser.email}`);
            }

            set({authUser : null , privateKey: null})
            toast.success("logged out successfully")
            get().disconnectSocket()
        }catch(error) {
            toast.error(error.response.data.message)
        }
    },

    login : async (data) => {
        set({isLoggingIng : true})
        try{
            const res = await axiosInstance.post("/auth/login" , data)
            
            const privateKey = localStorage.getItem(`privateKey_${res.data.email}`);
            
            set({authUser : res.data  , privateKey})
            toast.success("logged in successfully")

            get().connectSocket()
        }catch(error){ 
            toast.error(error.response.data.message)
        }finally{
            set({isLoggingIng : false})
        }
    },

    updateProfile : async (data) => {
        set({isUpdatingProfile : true})
        try{
            const res = await axiosInstance.put("/auth/update-profile" , data)
            set({authUser : res.data})
            toast.success("profile updated successfully")
        }catch(error) {
            console.log("error in update profile : " , error)
            toast.error(error.response.data.message)
        }finally{
            set({isUpdatingProfile : false})
        }
    },

    connectSocket : () => {
        const {authUser} = get()
        if(!authUser || get().socket?.connected) return;

        const socket = io(BASE_URL , {
            query : {
                userId : authUser._id,
            }
        })
        socket.connect()

        set({socket : socket})

        socket.on("getOnlineUsers" , (userIds) => {
            set({onlineUsers : userIds})
        })
    },

    disconnectSocket : () => {
        if(get().socket?.connected) get().socket.disconnect();
    }
}))