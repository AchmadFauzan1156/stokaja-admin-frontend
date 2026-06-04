"use client";

import { useEffect } from "react";
import { getSocket } from "@/lib/socket";
import { useToast } from "@/components/Toast";
import { useAuth } from "@/context/AuthContext";
import { usePathname } from "next/navigation";

export default function GlobalSocketListener() {
  const { showSuccess, showError } = useToast();
  const { user } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    // Hanya berjalan jika user sudah login
    if (!user) return;

    const socket = getSocket();
    if (!socket) return;

    // Join room role admin/kasir (jika diperlukan di backend, tapi socket.js kita udah konek)
    // socket.emit('join_room', 'admin_room'); // Jika backend pakai room

    const handleAlert = (data) => {
      // Misalnya { tipe: 'STOK_MENIPIS', pesan: '...' }
      if (data.tipe === "STOK_MENIPIS") {
        showError(data.pesan || "Peringatan Stok Menipis!");
      } else {
        showSuccess(data.pesan || "Pemberitahuan Baru");
      }
    };

    const handleNewMessage = (data) => {
      // Jangan tampilkan toast jika user sedang berada di halaman chat
      if (pathname && pathname.startsWith("/chat")) return;

      // Jika pesan bukan dari diri sendiri (kasir/admin), tampilkan notifikasi
      if (data.pengirim !== user.id) {
        showSuccess(`Pesan baru dari Pelanggan: ${data.isiPesan}`);
      }
    };

    socket.on("alertAdmin", handleAlert);
    socket.on("receive_message", handleNewMessage);

    return () => {
      socket.off("alertAdmin", handleAlert);
      socket.off("receive_message", handleNewMessage);
    };
  }, [user, pathname, showSuccess, showError]);

  return null;
}
