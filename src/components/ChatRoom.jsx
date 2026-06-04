"use client";

import { useState, useEffect, useRef } from "react";
import Navbar from "@/components/Navbar";
import ChatHeader from "@/components/ChatHeader";
import ChatBubble from "@/components/ChatBubble";
import ChatInput from "@/components/ChatInput";
import ChatDate from "@/components/ChatDate";
import { apiGet, apiPatch } from "@/lib/api";
import { getSocket } from "@/lib/socket";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useAuth } from "@/context/AuthContext";

export default function ChatRoom({ userId }) {
  const { user } = useAuth();
  const [chats, setChats] = useState([]);
  const [contactName, setContactName] = useState("Pelanggan");
  const [isLoading, setIsLoading] = useState(true);
  const chatEndRef = useRef(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setIsLoading(true);
        // Fetch contacts to get name
        apiGet("/chat/contacts").then(res => {
          const contact = (res.data || []).find(c => c._id === userId);
          if (contact) setContactName(contact.nama || contact.email || "Pelanggan");
        }).catch(err => console.error("Gagal load kontak", err));

        const res = await apiGet(`/chat/history?userId=${userId}`);
        
        const formattedChats = (res.data || []).map((msg) => {
          const dateObj = new Date(msg.createdAt);
          return {
            id: msg._id,
            // Jika admin, message dari kasir/admin ditandai sender "user" di komponen frontend agar di sebelah kanan
            // Jika senderId = user.id (kasir/admin), maka "user", else "admin" (di komponen ChatBubble, "admin" itu kiri)
            // Wait, komponen `ChatBubble` menerima sender="user" (kanan) atau "admin" (kiri).
            // Di frontend pelanggan, "user" itu kanan (pelanggan), "admin" itu kiri (admin).
            // Di frontend admin, "user" itu kanan (admin), "admin" itu kiri (pelanggan).
            // Maka, kita balik. Jika role pengirim adalah 'pelanggan', maka sender="admin" (kiri). Jika role pengirim adalah 'admin' atau 'kasir', maka sender="user" (kanan).
            sender: (msg.pengirim?.role === 'pelanggan') ? "admin" : "user",
            message: msg.isiPesan || msg.pesan,
            time: dateObj.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
            date: dateObj.toISOString().split("T")[0],
          };
        });

        setChats(formattedChats);

        // Mark all as read
        await apiPatch(`/chat/pelanggan/${userId}/read-all`);

      } catch (error) {
        console.error("Gagal memuat history chat", error);
      } finally {
        setIsLoading(false);
        setTimeout(() => scrollToBottom(), 100);
      }
    };

    if (userId) {
      fetchHistory();
    }

    const socket = getSocket();
    if (socket && userId) {
      // Not actually joining room by userId since we are admin, we receive all in `receiveMessage`.
      // But we can filter incoming messages to only this userId.
      
      const handleReceive = (data) => {
        // Jika pesan datang dari pelanggan ini (userId) atau kita yang kirim
        if (data.pengirim === userId || data.penerima === userId) {
          const dateObj = new Date(data.createdAt || Date.now());
          const newChat = {
            id: data._id || Date.now(),
            sender: data.pengirim === userId ? "admin" : "user",
            message: data.isiPesan,
            time: dateObj.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
            date: dateObj.toISOString().split("T")[0],
          };

          setChats((prev) => [...prev, newChat]);
          scrollToBottom();

          // Mark this new message as read if it's from customer
          if (data.pengirim === userId && data._id) {
            apiPatch(`/chat/${data._id}/read`);
          }
        }
      };

      socket.on("receive_message", handleReceive);

      return () => {
        socket.off("receive_message", handleReceive);
      };
    }
  }, [userId, user]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = (message) => {
    const socket = getSocket();
    if (socket) {
      // Emit ke backend
      socket.emit("sendMessage", {
        penerimaId: userId,
        pesan: message
      });

      // Optimistic update
      const now = new Date();
      const newChat = {
        id: Date.now(),
        sender: "user", // Kanan
        message,
        time: now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
        date: now.toISOString().split("T")[0],
      };

      setChats((prev) => [...prev, newChat]);
      scrollToBottom();
    }
  };

  return (
    <div className="h-screen overflow-hidden bg-[#F6F3EA]">
      {/* Header */}
      <ChatHeader title={contactName} subtitle="Online" />

      {/* Chat Area */}
      <div className="h-full overflow-y-auto px-4 pt-32 pb-72">
        {isLoading ? (
          <div className="flex justify-center mt-20"><LoadingSpinner /></div>
        ) : (
          <div className="flex flex-col gap-4">
            {chats.map((chat, index) => {
              const showDate = index === 0 || chats[index - 1].date !== chat.date;
              return (
                <div key={chat.id}>
                  {showDate && <ChatDate date={chat.date} />}
                  <ChatBubble sender={chat.sender} message={chat.message} time={chat.time} />
                </div>
              );
            })}
            <div ref={chatEndRef} />
          </div>
        )}
      </div>

      {/* Chat Input */}
      <ChatInput onSend={handleSend} />

      {/* Navbar */}
      <Navbar />
    </div>
  );
}