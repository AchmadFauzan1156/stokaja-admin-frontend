"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Button from "@/components/Button";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useToast } from "@/components/Toast";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api";

export default function StockPage() {
  const { showSuccess, showError } = useToast();

  const [products, setProducts] = useState([]);
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
  const [satuan, setSatuan] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const res = await apiGet("/produk?limit=100");
      setProducts(res.data || []);
    } catch (error) {
      showError("Gagal memuat produk");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await apiGet("/kategori");
      setCategories(res.data || []);
      if (res.data?.length > 0) {
        setCategoryId(res.data[0]._id);
      }
    } catch (error) {
      console.error("Gagal memuat kategori", error);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

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
    setImageFile(null);
    setImagePreview("");
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (product) => {
    setEditingId(product._id);
    setName(product.nama || "");
    setSatuan(product.satuan || "");
    setCategoryId(product.kategori?._id || (categories.length > 0 ? categories[0]._id : ""));
    setStock(product.stok || 0);
    setPrice(product.harga || 0);
    setImageFile(null);
    setImagePreview(product.gambar || "");
    setShowModal(true);
  };

  const saveProduct = async () => {
    if (!name || !price || !satuan) {
      showError("Nama, Harga, dan Satuan wajib diisi");
      return;
    }

    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append("nama", name);
      if (categoryId) formData.append("kategori", categoryId);
      formData.append("harga", price);
      formData.append("stok", stock || 0);
      formData.append("satuan", satuan);
      
      if (imageFile) {
        formData.append("gambar", imageFile);
      }

      if (editingId) {
        await apiPut(`/produk/${editingId}`, formData);
        showSuccess("Produk berhasil diperbarui");
      } else {
        await apiPost("/produk", formData);
        showSuccess("Produk berhasil ditambahkan");
      }

      setShowModal(false);
      resetForm();
      fetchProducts();
    } catch (error) {
      showError(error.message || "Gagal menyimpan produk");
    } finally {
      setIsSaving(false);
    }
  };

  const deleteProduct = async (id) => {
    if (!confirm("Yakin ingin menghapus produk ini?")) return;
    
    try {
      await apiDelete(`/produk/${id}`);
      showSuccess("Produk berhasil dihapus");
      fetchProducts();
    } catch (error) {
      showError(error.message || "Gagal menghapus produk");
    }
  };

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

      {/* Product List */}
      <div className="mt-6 px-4">
        {isLoading ? (
          <div className="flex justify-center mt-20"><LoadingSpinner size="lg" /></div>
        ) : products.length === 0 ? (
          <p className="text-center text-[#888] font-signika">Belum ada produk.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {products.map((product) => {
              const lowStock = product.stok <= (product.stokMinimum || 5);
              return (
                <div
                  key={product._id}
                  className={`rounded-3xl border-2 bg-[#F5F5F5] p-4 ${lowStock ? "border-red-400" : "border-[#D6D6D6]"}`}
                >
                  <div className="flex justify-between">
                    <div>
                      {product.gambar && (
                        <img
                          src={product.gambar}
                          alt={product.nama}
                          className="mb-3 h-32 w-full rounded-xl object-cover"
                        />
                      )}
                      <h2 className="font-squadaOne text-[26px] text-[#4B4B4B]">{product.nama}</h2>
                      {product.kategori && (
                        <div className={`mt-2 inline-flex rounded-full px-3 py-1 font-signika text-sm font-medium ${getCategoryStyle(product.kategori.nama)}`}>
                          {product.kategori.nama}
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
                      <p className="font-signika">Stok: {product.stok} {product.satuan}</p>
                      <p className="font-signika text-[#FF5C2B]">Rp{product.harga.toLocaleString("id-ID")}</p>
                    </div>
                    <div className="flex flex-wrap gap-2 justify-end items-end">
                      <button
                        onClick={() => openEditModal(product)}
                        className="rounded-lg bg-[#6E822E] px-3 py-2 text-white font-signika"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteProduct(product._id)}
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
              {editingId ? "Edit Produk" : "Tambah Produk"}
            </h2>
            <div className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="Nama Produk"
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
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="rounded-xl border border-[#D6D6D6] p-3 font-signika bg-white"
              >
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>{c.nama}</option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Stok Awal"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="rounded-xl border border-[#D6D6D6] p-3 font-signika"
              />
              <input
                type="number"
                placeholder="Harga"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="rounded-xl border border-[#D6D6D6] p-3 font-signika"
              />
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
                onClick={saveProduct}
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