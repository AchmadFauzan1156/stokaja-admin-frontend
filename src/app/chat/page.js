"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import SearchBar from "@/components/SearchBar";
import { apiGet } from "@/lib/api";
import { getSocket } from "@/lib/socket";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function ChatPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [contacts, setContacts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        setIsLoading(true);
        const res = await apiGet("/chat/contacts");
        setContacts(res.data || []);
      } catch (error) {
        console.error("Gagal memuat kontak", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchContacts();

    const socket = getSocket();
    if (socket) {
      socket.on("receive_message", () => {
        // Refresh contacts to update unread badge and last message when new message arrives
        fetchContacts();
      });

      return () => {
        socket.off("receive_message");
      };
    }
  }, []);

  const filteredContacts = contacts.filter((contact) =>
    (contact.pelanggan?.namaLengkap || contact.pelanggan?.email || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F0E7D6] pb-40">
      <div className="px-4 pt-14">
        <h1 className="font-squadaOne text-[40px] text-[#6E822E]">Chat</h1>
      </div>

      <div className="mt-4 flex justify-center px-4">
        <SearchBar value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="mt-5 px-4 flex flex-col">
        {isLoading ? (
          <div className="flex justify-center mt-10"><LoadingSpinner /></div>
        ) : filteredContacts.length === 0 ? (
          <p className="text-center text-[#888] font-signika mt-10">Belum ada obrolan.</p>
        ) : (
          filteredContacts.map((contact) => (
            <button
              key={contact.pelanggan?._id || Math.random().toString()}
              onClick={() => router.push(`/chat/${contact.pelanggan?._id}`)}
              className="flex items-center gap-4 border-b-2 border-[#D9D9D9] py-5 text-left"
            >
              <div className="flex h-15 w-15 shrink-0 items-center justify-center rounded-full bg-[#D9D9D9]">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="h-8 w-8">
                  <path d="M12 12a5 5 0 100-10 5 5 0 000 10zm0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5z"/>
                </svg>
              </div>

              <div className="flex-1 overflow-hidden">
                <h2 className="truncate font-signika text-[20px] font-semibold text-[#6E822E]">
                  {contact.pelanggan?.namaLengkap || contact.pelanggan?.email || "Pelanggan"}
                </h2>
                <p className="mt-1 truncate font-signika text-[16px] text-[#888]">
                  {contact.pesanTerakhir}
                </p>
              </div>

              {contact.belumDibaca > 0 && (
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#6E822E] font-signika text-sm font-bold text-white">
                  {contact.belumDibaca}
                </div>
              )}
            </button>
          ))
        )}
      </div>

      <Navbar />
    </div>
  );
}