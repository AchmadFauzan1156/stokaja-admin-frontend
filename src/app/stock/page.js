"use client";

import { useState, useEffect, useCallback } from "react";
import Navbar from "@/components/Navbar";
import Button from "@/components/Button";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useToast } from "@/components/Toast";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api";

export default function StockPage() {
  const { showSuccess, showError } = useToast();

  const [activeTab, setActiveTab] = useState("produk"); // "produk" | "bahan-baku"
  
  const [products, setProducts] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [stock, setStock] = useState("");
  const [price, setPrice] = useState("");
  const [hargaModal, setHargaModal] = useState(""); // khusus bahan baku
  const [satuan, setSatuan] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      if (activeTab === "produk") {
        const res = await apiGet("/produk?limit=100");
        setProducts(res.data || []);
      } else {
        const res = await apiGet("/bahan-baku?limit=100");
        setMaterials(res.data || []);
      }
    } catch (error) {
      showError(`Gagal memuat ${activeTab === "produk" ? "produk" : "bahan baku"}`);
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, showError]);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await apiGet("/kategori");
      setCategories(res.data || []);
    } catch (error) {
      console.error("Gagal memuat kategori", error);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getCategoryStyle = (categoryName) => {
    switch (categoryName?.toLowerCase()) {
      case "sembako": return "bg-[#fff7e6] text-[#a05f00]";
      case "minuman": return "bg-[#e8f4e8] text-[#2d6e22]";
      case "snack": return "bg-[#feeaea] text-[#b52a2a]";
      case "kebersihan": return "bg-[#f0eaff] text-[#6030b0]";
      case "perawatan": return "bg-[#e6f2ff] text-[#1a5fa0]";
      case "obat": return "bg-[#fff0f6] text-[#a0306a]";
      default: return "bg-[#eeeeee] text-[#555555]";
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setSatuan("");
    if (categories.length > 0) setCategoryId(categories[0]._id);
    setStock("");
    setPrice("");
    setHargaModal("");
    setImageFile(null);
    setImagePreview("");
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (item) => {
    setEditingId(item._id);
    setName(activeTab === "produk" ? item.nama : item.namaBahan || "");
    setSatuan(item.satuan || "");
    if (activeTab === "produk") {
      setCategoryId(item.kategori?._id || (categories.length > 0 ? categories[0]._id : ""));
    }
    setStock(item.stok || 0);
    setPrice(activeTab === "produk" ? item.harga : item.hargaJual || 0);
    setHargaModal(item.hargaModal || 0);
    setImageFile(null);
    setImagePreview(item.gambar || "");
    setShowModal(true);
  };

  const saveData = async () => {
    if (!name || !satuan) {
      showError("Nama dan Satuan wajib diisi");
      return;
    }

    setIsSaving(true);
    try {
      const formData = new FormData();
      if (activeTab === "produk") {
        formData.append("nama", name);
        if (categoryId) formData.append("kategori", categoryId);
        formData.append("harga", price);
      } else {
        formData.append("namaBahan", name);
        formData.append("hargaJual", price);
        formData.append("hargaModal", hargaModal);
      }
      formData.append("stok", stock || 0);
      formData.append("satuan", satuan);
      
      if (imageFile) {
        formData.append("gambar", imageFile);
      }

      const endpoint = activeTab === "produk" ? "/produk" : "/bahan-baku";

      if (editingId) {
        await apiPut(`${endpoint}/${editingId}`, formData);
        showSuccess(`${activeTab === "produk" ? "Produk" : "Bahan Baku"} berhasil diperbarui`);
      } else {
        await apiPost(endpoint, formData);
        showSuccess(`${activeTab === "produk" ? "Produk" : "Bahan Baku"} berhasil ditambahkan`);
      }

      setShowModal(false);
      resetForm();
      fetchData();
    } catch (error) {
      showError(error.message || "Gagal menyimpan data");
    } finally {
      setIsSaving(false);
    }
  };

  const deleteData = async (id) => {
    if (!confirm(`Yakin ingin menghapus ${activeTab === "produk" ? "produk" : "bahan baku"} ini?`)) return;
    
    try {
      const endpoint = activeTab === "produk" ? "/produk" : "/bahan-baku";
      await apiDelete(`${endpoint}/${id}`);
      showSuccess("Data berhasil dihapus");
      fetchData();
    } catch (error) {
      showError(error.message || "Gagal menghapus data");
    }
  };

  const currentList = activeTab === "produk" ? products : materials;

  return (
    <div className="min-h-screen bg-[#F0E7D6] pb-44">
      {/* Header */}
      <div className="px-4 pt-14">
        <div className="flex items-center justify-between">
          <h1 className="font-squadaOne text-[40px] text-[#6E822E]">Stock</h1>
          <button
            onClick={openAddModal}
            className="rounded-xl bg-[#6E822E] px-4 py-2 font-signika font-semibold text-white"
          >
            + Tambah
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-4 px-4 flex border-b border-[#D6D6D6]">
        <button
          onClick={() => setActiveTab("produk")}
          className={`flex-1 pb-3 text-center font-signika text-lg font-semibold transition ${activeTab === "produk" ? "border-b-4 border-[#6E822E] text-[#6E822E]" : "text-[#888]"}`}
        >
          Produk
        </button>
        <button
          onClick={() => setActiveTab("bahan-baku")}
          className={`flex-1 pb-3 text-center font-signika text-lg font-semibold transition ${activeTab === "bahan-baku" ? "border-b-4 border-[#6E822E] text-[#6E822E]" : "text-[#888]"}`}
        >
          Bahan Baku
        </button>
      </div>

      {/* Product / Material List */}
      <div className="mt-6 px-4">
        {isLoading ? (
          <div className="flex justify-center mt-20"><LoadingSpinner size="lg" /></div>
        ) : currentList.length === 0 ? (
          <p className="text-center text-[#888] font-signika">Belum ada {activeTab === "produk" ? "produk" : "bahan baku"}.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {currentList.map((item) => {
              const lowStock = item.stok <= (item.stokMinimum || 5);
              const itemName = activeTab === "produk" ? item.nama : item.namaBahan;
              const itemPrice = activeTab === "produk" ? item.harga : item.hargaJual;
              
              return (
                <div
                  key={item._id}
                  className={`rounded-3xl border-2 bg-[#F5F5F5] p-4 ${lowStock ? "border-red-400" : "border-[#D6D6D6]"}`}
                >
                  <div className="flex justify-between">
                    <div>
                      {item.gambar && (
                        <img
                          src={item.gambar}
                          alt={itemName}
                          className="mb-3 h-32 w-full rounded-xl object-cover"
                        />
                      )}
                      <h2 className="font-squadaOne text-[26px] text-[#4B4B4B]">{itemName}</h2>
                      {activeTab === "produk" && item.kategori && (
                        <div className={`mt-2 inline-flex rounded-full px-3 py-1 font-signika text-sm font-medium ${getCategoryStyle(item.kategori.nama)}`}>
                          {item.kategori.nama}
                        </div>
                      )}
                    </div>
                    {lowStock && (
                      <span className="h-fit rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-600">
                        Stok Menipis
                      </span>
                    )}
                  </div>
                  <div className="mt-4 flex justify-between">
                    <div>
                      <p className="font-signika">Stok: {item.stok} {item.satuan}</p>
                      <p className="font-signika text-[#FF5C2B]">Rp{(itemPrice || 0).toLocaleString("id-ID")}</p>
                    </div>
                    <div className="flex flex-wrap gap-2 justify-end items-end">
                      <button
                        onClick={() => openEditModal(item)}
                        className="rounded-lg bg-[#6E822E] px-3 py-2 text-white font-signika"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteData(item._id)}
                        className="rounded-lg bg-red-500 px-3 py-2 text-white font-signika"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-[90%] max-w-md rounded-3xl bg-white p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="mb-4 font-squadaOne text-[30px] text-[#6E822E]">
              {editingId ? "Edit" : "Tambah"} {activeTab === "produk" ? "Produk" : "Bahan Baku"}
            </h2>
            <div className="flex flex-col gap-3">
              <input
                type="text"
                placeholder={activeTab === "produk" ? "Nama Produk" : "Nama Bahan Baku"}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-xl border border-[#D6D6D6] p-3 font-signika"
              />
              <input
                type="text"
                placeholder="Satuan (contoh: pcs, kg)"
                value={satuan}
                onChange={(e) => setSatuan(e.target.value)}
                className="rounded-xl border border-[#D6D6D6] p-3 font-signika"
              />
              {activeTab === "produk" && (
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="rounded-xl border border-[#D6D6D6] p-3 font-signika bg-white"
                >
                  <option value="" disabled>Pilih Kategori</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>{c.nama}</option>
                  ))}
                </select>
              )}
              <input
                type="number"
                placeholder="Stok"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="rounded-xl border border-[#D6D6D6] p-3 font-signika"
              />
              <input
                type="number"
                placeholder="Harga Jual"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="rounded-xl border border-[#D6D6D6] p-3 font-signika"
              />
              {activeTab === "bahan-baku" && (
                <input
                  type="number"
                  placeholder="Harga Modal"
                  value={hargaModal}
                  onChange={(e) => setHargaModal(e.target.value)}
                  className="rounded-xl border border-[#D6D6D6] p-3 font-signika"
                />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  if (file.size > 2 * 1024 * 1024) {
                    showError("Maksimal 2MB");
                    e.target.value = "";
                    return;
                  }
                  setImageFile(file);
                  setImagePreview(URL.createObjectURL(file));
                }}
                className="rounded-xl border border-[#D6D6D6] p-3 font-signika"
              />
              {imagePreview && (
                <img src={imagePreview} alt="Preview" className="h-40 w-full rounded-xl object-cover" />
              )}
            </div>
            <div className="mt-6 flex gap-3">
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
