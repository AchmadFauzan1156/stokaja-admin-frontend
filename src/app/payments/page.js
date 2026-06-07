"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api";
import Navbar from "@/components/Navbar";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useToast } from "@/components/Toast";

export default function PaymentsPage() {
  const router = useRouter();
  const { showSuccess, showError } = useToast();

  const [payments, setPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [isActive, setIsActive] = useState(true);

  const fetchPayments = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await apiGet("/metode-bayar");
      setPayments(res.data || []);
    } catch (error) {
      showError("Gagal memuat metode pembayaran");
    } finally {
      setIsLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const openAddModal = () => {
    setEditingId(null);
    setName("");
    setIsActive(true);
    setShowModal(true);
  };

  const openEditModal = (pay) => {
    setEditingId(pay._id);
    setName(pay.nama);
    setIsActive(pay.aktif !== false);
    setShowModal(true);
  };

  const saveData = async () => {
    if (!name) {
      showError("Nama metode pembayaran wajib diisi");
      return;
    }

    setIsSaving(true);
    try {
      const payload = { nama: name, aktif: isActive };

      if (editingId) {
        await apiPut(`/metode-bayar/${editingId}`, payload);
        showSuccess("Metode pembayaran berhasil diperbarui");
      } else {
        await apiPost("/metode-bayar", payload);
        showSuccess("Metode pembayaran berhasil ditambahkan");
      }

      setShowModal(false);
      fetchPayments();
    } catch (error) {
      showError(error.message || "Gagal menyimpan metode pembayaran");
    } finally {
      setIsSaving(false);
    }
  };

  const deleteData = async (id) => {
    if (!confirm("Yakin ingin menghapus metode pembayaran ini?")) return;
    try {
      await apiDelete(`/metode-bayar/${id}`);
      showSuccess("Metode pembayaran berhasil dihapus");
      fetchPayments();
    } catch (error) {
      showError(error.message || "Gagal menghapus metode pembayaran");
    }
  };

  return (
    <div className="min-h-screen bg-[#F0E7D6] pb-44">
      {/* Header */}
      <div className="px-4 pt-14">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push("/dashboard")} className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#6E822E] shadow">
              <span className="text-xl font-bold">{"<"}</span>
            </button>
            <h1 className="font-squada text-[30px] leading-tight text-[#6E822E]">Metode<br/>Pembayaran</h1>
          </div>
          <button
            onClick={openAddModal}
            className="rounded-xl bg-[#6E822E] px-4 py-2 font-signika font-semibold text-white shadow"
          >
            + Tambah
          </button>
        </div>
      </div>

      {/* List */}
      <div className="mt-8 px-4">
        {isLoading ? (
          <div className="flex justify-center mt-20"><LoadingSpinner size="lg" /></div>
        ) : payments.length === 0 ? (
          <p className="text-center font-signika text-[#888]">Belum ada metode pembayaran.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {payments.map((pay) => (
              <div key={pay._id} className="flex flex-col rounded-[20px] border-2 border-[#D6D6D6] bg-[#F5F5F5] p-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-squada text-[24px] text-[#4B4B4B] capitalize">{pay.nama}</h2>
                  <span className={`rounded-full px-3 py-1 font-signika text-sm font-semibold ${pay.aktif ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {pay.aktif ? "Aktif" : "Nonaktif"}
                  </span>
                </div>
                
                <div className="mt-4 flex justify-end gap-2">
                  <button onClick={() => openEditModal(pay)} className="rounded-lg bg-[#6E822E] px-4 py-2 font-signika text-sm font-semibold text-white">Edit</button>
                  <button onClick={() => deleteData(pay._id)} className="rounded-lg bg-red-500 px-4 py-2 font-signika text-sm font-semibold text-white">Hapus</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6">
            <h2 className="mb-4 font-squada text-[28px] text-[#6E822E]">{editingId ? "Edit" : "Tambah"} Metode</h2>
            
            <div className="flex flex-col gap-4">
              <div>
                <label className="mb-1 block font-signika text-[#666]">Nama Metode</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-[#D6D6D6] p-3 font-signika"
                  placeholder="Misal: QRIS, Tunai, Transfer BCA"
                />
              </div>

              <div className="flex items-center gap-3 mt-2">
                <input 
                  type="checkbox" 
                  checked={isActive} 
                  onChange={(e) => setIsActive(e.target.checked)}
                  id="aktifPay"
                  className="h-5 w-5 rounded border-gray-300 text-[#6E822E]"
                />
                <label htmlFor="aktifPay" className="font-signika text-[#444] cursor-pointer">Metode Aktif</label>
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 rounded-xl border border-[#D6D6D6] py-3 font-signika text-[#666]"
                disabled={isSaving}
              >
                Batal
              </button>
              <button
                onClick={saveData}
                className="flex-1 rounded-xl bg-[#6E822E] py-3 font-signika text-white"
                disabled={isSaving}
              >
                {isSaving ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}

      <Navbar />
    </div>
  );
}
