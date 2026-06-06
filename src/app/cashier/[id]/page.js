"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { apiGet, apiPatch } from "@/lib/api";
import { useToast } from "@/components/Toast";
import LoadingSpinner from "@/components/LoadingSpinner";
import Button from "@/components/Button";

export default function OrderDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const { showSuccess, showError } = useToast();

  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setIsLoading(true);
        const res = await apiGet(`/transaksi/${id}`);
        if (res.data) {
          setOrder(res.data);
        } else {
          showError("Pesanan tidak ditemukan");
        }
      } catch (error) {
        showError("Gagal memuat detail pesanan");
      } finally {
        setIsLoading(false);
      }
    };
    if (id) fetchOrderDetails();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F0E7D6] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[#F0E7D6] px-4 pt-14 text-center">
        <button onClick={() => router.back()} className="mb-6 text-[#6E822E] block text-left">← Kembali</button>
        <p className="font-signika text-[#666]">Pesanan tidak ditemukan</p>
      </div>
    );
  }

  const updateStatus = async () => {
    setIsUpdating(true);
    let nextStatus = "selesai";

    if (order.statusPesanan === "pending") nextStatus = "diproses";
    else if (order.statusPesanan === "diproses") nextStatus = "dikirim";
    else if (order.statusPesanan === "dikirim") nextStatus = "selesai";

    try {
      const res = await apiPatch(`/transaksi/${id}/status`, { statusBaru: nextStatus });
      setOrder(res.transaksi || { ...order, statusPesanan: nextStatus });
      showSuccess(`Status diubah menjadi ${nextStatus.toUpperCase()}`);
    } catch (error) {
      showError(error.message || "Gagal mengubah status");
    } finally {
      setIsUpdating(false);
    }
  };

  const cancelOrder = async () => {
    if (!confirm("Yakin ingin membatalkan pesanan ini?")) return;
    setIsUpdating(true);
    try {
      const res = await apiPatch(`/transaksi/${id}/status`, { statusBaru: "batal" });
      setOrder(res.transaksi || { ...order, statusPesanan: "batal" });
      showSuccess("Pesanan dibatalkan");
    } catch (error) {
      showError(error.message || "Gagal membatalkan pesanan");
    } finally {
      setIsUpdating(false);
    }
  };

  const getButtonText = () => {
    switch (order.statusPesanan) {
      case "pending": return "Terima & Proses";
      case "diproses": return "Kirim Pesanan";
      case "dikirim": return "Selesaikan";
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#F0E7D6] px-4 pt-14 pb-32">
      <button onClick={() => router.back()} className="mb-6 text-[#6E822E] font-signika">
        ← Kembali
      </button>

      <h1 className="font-squadaOne text-[40px] text-[#6E822E]">Detail Pesanan</h1>

      <div className="mt-6 rounded-3xl border-2 border-[#D6D6D6] bg-white p-5">
        <h2 className="font-squadaOne text-[28px]">{order.nomorResi}</h2>
        <p className="mt-2 text-[#666] font-signika">
          {order.pelangganId ? "Pelanggan Terdaftar" : "Pelanggan Offline"}
        </p>

        <div className="mt-5 border-t border-[#EEE] pt-4">
          <p className="font-signika">Jumlah Item: {order.keranjang?.length || 0}</p>
          <p className="mt-2 font-signika">Status: <span className="font-bold">{(order.statusPesanan || "").toUpperCase()}</span></p>
          <p className="mt-2 font-signika text-[#FF5C2B] font-bold">
            Total Bayar: Rp{(order.totalHarga || 0).toLocaleString("id-ID")}
          </p>
        </div>

        <div className="mt-5 border-t border-[#EEE] pt-4">
          <h3 className="font-squadaOne text-[20px] text-[#6E822E] mb-2">Item Belanja:</h3>
          {order.keranjang?.map((item, idx) => (
            <div key={idx} className="flex justify-between mb-2 font-signika text-sm">
              <span>{item.produkId?.nama || item.produkId?.namaBahan || "Item Terhapus"} x{item.jumlahBeli}</span>
              <span>Rp{((item.hargaSatuan || 0) * item.jumlahBeli).toLocaleString("id-ID")}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 justify-center items-center">
        {order.statusPesanan !== "selesai" && order.statusPesanan !== "batal" && (
          <Button 
            text={isUpdating ? "Memproses..." : getButtonText()}
            onClick={updateStatus}
            disabled={isUpdating}
          />
        )}
        
        {order.statusPesanan !== "selesai" && order.statusPesanan !== "batal" && (
          <button 
            onClick={cancelOrder}
            disabled={isUpdating}
            className="text-red-500 font-signika mt-2 mb-2"
          >
            Batalkan Pesanan
          </button>
        )}

        <button 
          onClick={async () => {
            try {
              const token = localStorage.getItem("accessToken");
              const url = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1"}/transaksi/${id}/pdf`;
              const res = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
              if (!res.ok) throw new Error("Gagal export PDF");
              const blob = await res.blob();
              const downloadUrl = window.URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = downloadUrl;
              link.download = `Struk_${order.nomorResi}.pdf`;
              document.body.appendChild(link);
              link.click();
              link.remove();
            } catch (error) {
              showError("Gagal mengunduh PDF struk");
            }
          }}
          className="rounded-[20px] bg-[#6E822E] px-8 py-3 font-signika font-semibold text-white mt-4 w-full max-w-xs"
        >
          Cetak Struk PDF
        </button>
      </div>
    </div>
  );
}