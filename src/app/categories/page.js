"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api";
import Navbar from "@/components/Navbar";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useToast } from "@/components/Toast";

export default function CategoriesPage() {
  const router = useRouter();
  const { showSuccess, showError } = useToast();

  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);

  const fetchCategories = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await apiGet("/kategori");
      setCategories(res.data || []);
    } catch (error) {
      showError("Gagal memuat kategori");
    } finally {
      setIsLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const openAddModal = () => {
    setEditingId(null);
    setName("");
    setDescription("");
    setIsActive(true);
    setShowModal(true);
  };

  const openEditModal = (cat) => {
    setEditingId(cat._id);
    setName(cat.nama);
    setDescription(cat.deskripsi || "");
    setIsActive(cat.aktif !== false);
    setShowModal(true);
  };

  const saveData = async () => {
    if (!name) {
      showError("Nama kategori wajib diisi");
      return;
    }

    setIsSaving(true);
    try {
      const payload = { nama: name, deskripsi: description, aktif: isActive };

      if (editingId) {
        await apiPut(`/kategori/${editingId}`, payload);
        showSuccess("Kategori berhasil diperbarui");
      } else {
        await apiPost("/kategori", payload);
        showSuccess("Kategori berhasil ditambahkan");
      }

      setShowModal(false);
      fetchCategories();
    } catch (error) {
      showError(error.message || "Gagal menyimpan kategori");
    } finally {
      setIsSaving(false);
    }
  };

  const deleteData = async (id) => {
    if (!confirm("Yakin ingin menghapus kategori ini? Data produk mungkin terdampak.")) return;
    try {
      await apiDelete(`/kategori/${id}`);
      showSuccess("Kategori berhasil dihapus");
      fetchCategories();
    } catch (error) {
      showError(error.message || "Gagal menghapus kategori");
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
            <h1 className="font-squada text-[36px] text-[#6E822E]">Kategori</h1>
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
        ) : categories.length === 0 ? (
          <p className="text-center font-signika text-[#888]">Belum ada kategori.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {categories.map((cat) => (
              <div key={cat._id} className="flex flex-col rounded-[20px] border-2 border-[#D6D6D6] bg-[#F5F5F5] p-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-squada text-[24px] text-[#4B4B4B]">{cat.nama}</h2>
                  <span className={`rounded-full px-3 py-1 font-signika text-sm font-semibold ${cat.aktif ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {cat.aktif ? "Aktif" : "Nonaktif"}
                  </span>
                </div>
                {cat.deskripsi && <p className="mt-1 font-signika text-[#666]">{cat.deskripsi}</p>}
                
                <div className="mt-4 flex justify-end gap-2">
                  <button onClick={() => openEditModal(cat)} className="rounded-lg bg-[#6E822E] px-4 py-2 font-signika text-sm font-semibold text-white">Edit</button>
                  <button onClick={() => deleteData(cat._id)} className="rounded-lg bg-red-500 px-4 py-2 font-signika text-sm font-semibold text-white">Hapus</button>
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
            <h2 className="mb-4 font-squada text-[28px] text-[#6E822E]">{editingId ? "Edit" : "Tambah"} Kategori</h2>
            
            <div className="flex flex-col gap-4">
              <div>
                <label className="mb-1 block font-signika text-[#666]">Nama Kategori</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-[#D6D6D6] p-3 font-signika"
                  placeholder="Misal: Minuman"
                />
              </div>
              
              <div>
                <label className="mb-1 block font-signika text-[#666]">Deskripsi (Opsional)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-xl border border-[#D6D6D6] p-3 font-signika"
                  rows="3"
                  placeholder="Deskripsi singkat..."
                />
              </div>

              <div className="flex items-center gap-3 mt-2">
                <input 
                  type="checkbox" 
                  checked={isActive} 
                  onChange={(e) => setIsActive(e.target.checked)}
                  id="aktifCat"
                  className="h-5 w-5 rounded border-gray-300 text-[#6E822E]"
                />
                <label htmlFor="aktifCat" className="font-signika text-[#444] cursor-pointer">Kategori Aktif</label>
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
