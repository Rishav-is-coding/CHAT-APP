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
            const { privateKey, authUser } = useAuthStore.getState();
            
            if (!privateKey) {
                set({ messages: [], isMessagesLoading: false });
                return;
            }

            const decrypt = new JSEncrypt();
            decrypt.setPrivateKey(privateKey);

            const decryptedMessages = res.data.map(msg => {
                let decryptedText = "";
                // If I am the sender, decrypt the text meant for me
                if (msg.senderId === authUser._id && msg.textForSender) {
                    decryptedText = decrypt.decrypt(msg.textForSender);
                // If I am the receiver, decrypt the text meant for me
                } else if (msg.receiverId === authUser._id && msg.textForReceiver) {
                    decryptedText = decrypt.decrypt(msg.textForReceiver);
                }

                return {
                    ...msg,
                    text: decryptedText === false ? "⚠️ Could not decrypt message" : decryptedText
                };
            });
            set({ messages: Array.isArray(decryptedMessages) ? decryptedMessages : [] });
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to fetch messages.");
        } finally {
            set({ isMessagesLoading: false });
        }
    },

    sendMessage: async (messageData) => {
        const { selectedUser, messages } = get();
        const { authUser } = useAuthStore.getState();
        try {
            const encrypt = new JSEncrypt();

            // Encrypt for the receiver
            encrypt.setPublicKey(selectedUser.publicKey);
            const textForReceiver = encrypt.encrypt(messageData.text);

            // Encrypt for the sender
            encrypt.setPublicKey(authUser.publicKey);
            const textForSender = encrypt.encrypt(messageData.text);
            
            const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, {
                ...messageData, 
                textForSender, 
                textForReceiver
            });

            const newMessageForSender = {
                ...res.data,
                text: messageData.text 
            };

            set({ messages: [...messages, newMessageForSender] });
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to send message.");
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
            const decryptedText = decrypt.decrypt(newMessage.textForReceiver);
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