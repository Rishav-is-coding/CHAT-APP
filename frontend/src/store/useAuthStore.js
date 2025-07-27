import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import {io} from "socket.io-client"
import JSEncrypt from "jsencrypt";
import CryptoJS from "crypto-js";

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
        set({ isCheckingAuth: true });
        try {
            const res = await axiosInstance.get("/auth/check")
            const authUser = res.data;
            // Only try to get the private key from local storage.
            const privateKey = localStorage.getItem(`privateKey_${authUser.email}`);

            // If the key exists locally, the user is fully authenticated.
            if (privateKey) {
                set({authUser : authUser , privateKey})
                get().connectSocket()
            } else {
                // If there's a session but no key, treat them as logged out from this device.
                // They will be prompted to log in, which will trigger the key restore flow.
                set({ authUser: null, privateKey: null });
            }
        }catch(error) {
            // No valid session cookie.
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
            
            // Encrypt the private key with the user's password
            const encryptedPrivateKey = CryptoJS.AES.encrypt(privateKey, data.password).toString();

            localStorage.setItem(`privateKey_${data.email}`, privateKey);

            const res = await axiosInstance.post("/auth/signup" , { ...data, publicKey, encryptedPrivateKey })
            set({authUser : res.data , privateKey})
            toast.success("Account created successfully")
            
            get().connectSocket()
        }catch(error) {
            toast.error(error.response?.data?.message || "An error occurred during sign up.");
        }finally {
            set({isSigningUp : false})
        }
    },

    logout : async () => {
        try{
            await axiosInstance.post("/auth/logout")
            // Do not remove the private key on logout. This allows the user to log back
            // in on the same device without needing to restore the key.
            // const { authUser } = get();
            // if (authUser) {
            //     localStorage.removeItem(`privateKey_${authUser.email}`);
            // }
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
            const authUser = res.data;
            let privateKey = localStorage.getItem(`privateKey_${authUser.email}`);
            
            // If private key is not in local storage, decrypt it from the server response
            if (!privateKey && authUser.encryptedPrivateKey) {
                try {
                    const bytes = CryptoJS.AES.decrypt(authUser.encryptedPrivateKey, data.password);
                    privateKey = bytes.toString(CryptoJS.enc.Utf8);

                    if (privateKey) {
                        localStorage.setItem(`privateKey_${authUser.email}`, privateKey);
                    } else {
                        throw new Error("Decryption failed. Please check your password.");
                    }
                } catch (error) {
                    toast.error("Could not restore keys. Incorrect password or corrupted data.");
                    set({ isLoggingIng: false });
                    return;
                }
            }
            
            set({authUser : authUser, privateKey})
            toast.success("logged in successfully")

            get().connectSocket()
        }catch(error){ 
            toast.error(error.response?.data?.message || "An error occurred during login.");
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