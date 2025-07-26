import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios.js";
import { useAuthStore } from "./useAuthStore.js";
import JSEncrypt from "jsencrypt"

export const useChatStore = create((set, get) => ({ 
    messages: [],
    users: [],
    selectedUser: null,
    isUsersLoading: false,
    isMessagesLoading: false,

    //functions
    getUsers: async () => {
        set({ isUsersLoading: true });
        try {
            const res = await axiosInstance.get("/messages/users");
            
            set({ users: Array.isArray(res.data.filteredUsers) ? res.data.filteredUsers : [] });
        } catch (error) {
            toast.error(error.response.data.message);
        } finally {
            set({ isUsersLoading: false });
        }
    },
    
    getMessages: async (userId) => {
        set({ isMessagesLoading: true });
        try {
            const res = await axiosInstance.get(`/messages/${userId}`);
            const { privateKey } = useAuthStore.getState();
            
            const decrypt = new JSEncrypt();
            decrypt.setPrivateKey(privateKey);

            const decryptedMessages = res.data.map(msg => {
                if (!msg.text) return msg;
                const decryptedText = decrypt.decrypt(msg.text);
                return {
                    ...msg,
                    text: decryptedText === false ? "⚠️ Could not decrypt message" : decryptedText
                };
            });
            set({ messages: Array.isArray(decryptedMessages) ? decryptedMessages : [] });
        } catch (error) {
            toast.error(error.response.data.message);
        } finally {
            set({ isMessagesLoading: false });
        }
    },

    sendMessage: async (messageData) => {
        const { selectedUser, messages } = get();
        try {
            const encrypt = new JSEncrypt();
            encrypt.setPublicKey(selectedUser.publicKey);
            const encryptedText = encrypt.encrypt(messageData.text);
            
            const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, {...messageData , text: encryptedText});

            const newMessageForSender = {
                ...res.data,
                text: messageData.text // Use the original, unencrypted text
            };

            set({ messages: [...messages, newMessageForSender] });
        } catch (error) {
            toast.error(error.response.data.message);
        }
    },

    subscribeToMessages: () => {
        const {selectedUser} = get()
        if(!selectedUser) return;

        const socket = useAuthStore.getState().socket

        socket.on("newMessage" , (newMessage) => {
            const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id
            if(!isMessageSentFromSelectedUser) return;

            const { privateKey } = useAuthStore.getState();
            const decrypt = new JSEncrypt();
            decrypt.setPrivateKey(privateKey);
            const decryptedText = decrypt.decrypt(newMessage.text);
            set({
                messages : [...get().messages , { 
                    ...newMessage, 
                    text: decryptedText === false ? "⚠️ Could not decrypt message" : decryptedText 
                }]
            })
        })
    },

    unsubscribeFromMessages: () => {
        const socket = useAuthStore.getState().socket
        socket.off("newMessage")
    },

    setSelectedUser: (selectedUser) => set({ selectedUser }),
}));