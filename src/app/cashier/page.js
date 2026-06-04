"use client";

import { useState, useEffect, useCallback } from "react";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import Button from "@/components/Button";
import { apiGet, apiPost } from "@/lib/api";
import { useToast } from "@/components/Toast";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function CashierPage() {
  const { showSuccess, showError } = useToast();
  
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      setIsLoadingOrders(true);
      // Fetch pesanan dengan status 'menunggu', 'diproses', 'dikirim' (yang belum selesai)
      // Kasir di frontend ini hanya butuh list pesanan.
      // Kita fetch list transaksi limit 20
      const res = await apiGet("/transaksi?limit=20");
      // Filter yang statusnya belum selesai (optional, atau tampilkan semua dengan badge)
      setOrders(res.data || []);
    } catch (error) {
      console.error("Gagal memuat pesanan", error);
    } finally {
      setIsLoadingOrders(false);
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await apiGet("/produk?limit=100");
      setProducts(res.data || []);
    } catch (error) {
      console.error("Gagal memuat produk", error);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    fetchProducts();
  }, [fetchOrders, fetchProducts]);

  const addProduct = (product) => {
    const existing = cart.find((item) => item._id === product._id);
    if (existing) {
      setCart((prev) =>
        prev.map((item) =>
          item._id === product._id ? { ...item, qty: item.qty + 1 } : item
        )
      );
      return;
    }
    setCart((prev) => [...prev, { ...product, qty: 1 }]);
  };

  const total = cart.reduce((sum, item) => sum + (item.harga || 0) * item.qty, 0);

  const filteredProducts = products.filter((product) =>
    (product.nama || "").toLowerCase().includes(search.toLowerCase())
  );

  const submitTransaction = async () => {
    if (cart.length === 0) return;
    setIsSubmitting(true);

    try {
      const payload = {
        isiKeranjang: cart.map(c => ({
          produkId: c._id,
          jumlahBeli: c.qty
        })),
        metodePembayaran: 'tunai',
        jumlahDibayar: total
      };

      await apiPost("/checkout", payload);
      showSuccess("Transaksi berhasil disimpan");
      setCart([]);
      fetchOrders(); // Refresh order list just in case
    } catch (error) {
      showError(error.message || "Gagal checkout");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0E7D6] pb-44">
      {/* Header */}
      <div className="px-4 pt-14">
        <h1 className="font-squadaOne text-[40px] text-[#6E822E]">Cashier</h1>
      </div>

      {/* Incoming Orders */}
      <div className="mt-6 px-4">
        <h2 className="mb-3 font-squadaOne text-[30px] text-[#6E822E]">Daftar Pesanan</h2>
        
        {isLoadingOrders ? (
          <div className="flex justify-center my-4"><LoadingSpinner /></div>
        ) : orders.length === 0 ? (
          <p className="text-[#666] font-signika">Belum ada pesanan.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {orders.map((order) => (
              <Link key={order._id} href={`/cashier/${order._id}`}>
                <div className="mb-4 rounded-[20px] border-2 border-[#D6D6D6] bg-white p-4 transition-all duration-200 hover:scale-[1.01]">
                  <div className="flex items-center justify-between">
                    <h3 className="font-squadaOne text-[24px] text-[#6E822E]">{order.nomorResi}</h3>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold
                      ${
                        order.statusPesanan === "selesai" ? "bg-green-100 text-green-700" :
                        order.statusPesanan === "batal" ? "bg-red-100 text-red-700" :
                        order.statusPesanan === "menunggu" ? "bg-yellow-100 text-yellow-700" :
                        "bg-blue-100 text-blue-700"
                      }
                    `}>
                      {(order.statusPesanan || "").toUpperCase()}
                    </span>
                  </div>
                  <p className="mt-2 font-signika text-[#666]">
                    {order.pelangganId ? "Pelanggan Terdaftar" : "Pelanggan Offline"}
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="font-signika text-sm text-[#888]">
                      {order.keranjang?.length || 0} item
                    </span>
                    <span className="font-squadaOne text-[22px] text-[#FF5C2B]">
                      Rp{(order.totalHarga || 0).toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Search Product */}
      <div className="mt-8 px-4">
        <h2 className="mb-3 font-squadaOne text-[30px] text-[#6E822E]">Kasir Manual</h2>
        <input
          type="text"
          placeholder="Cari produk..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-[18px] border-2 border-[#D6D6D6] bg-white p-4 font-signika outline-none"
        />
      </div>

      {/* Products */}
      <div className="mt-4 px-4 max-h-[400px] overflow-y-auto">
        <div className="flex flex-col gap-3">
          {filteredProducts.map((product) => (
            <button
              key={product._id}
              onClick={() => addProduct(product)}
              className="flex items-center justify-between rounded-[18px] border-2 border-[#D6D6D6] bg-[#F5F5F5] p-4 text-left"
            >
              <div>
                <h3 className="font-squadaOne text-[22px] text-[#4B4B4B]">{product.nama}</h3>
                <p className="text-[#FF5C2B] font-signika">Rp{(product.harga || 0).toLocaleString("id-ID")}</p>
                <p className="text-xs text-[#888] font-signika">Sisa: {product.stok}</p>
              </div>
              <div className="rounded-full bg-[#B6D04E] px-4 py-2 text-white font-bold">+</div>
            </button>
          ))}
          {filteredProducts.length === 0 && (
            <p className="text-center font-signika text-[#888]">Produk tidak ditemukan</p>
          )}
        </div>
      </div>

      {/* Cart */}
      <div className="mt-8 px-4">
        <h2 className="mb-3 font-squadaOne text-[30px] text-[#6E822E]">Keranjang</h2>
        <div className="rounded-3xl border-2 border-[#D6D6D6] bg-[#F5F5F5] p-4">
          {cart.length === 0 ? (
            <p className="text-center text-[#888] font-signika">Belum ada produk</p>
          ) : (
            cart.map((item) => (
              <div key={item._id} className="mb-3 flex justify-between font-signika">
                <span>{item.nama} x{item.qty}</span>
                <span>Rp{((item.harga || 0) * item.qty).toLocaleString("id-ID")}</span>
              </div>
            ))
          )}
          <div className="mt-4 border-t-2 border-[#DDD] pt-4">
            <div className="flex justify-between">
              <h3 className="font-squadaOne text-[28px] text-[#FF5C2B]">Total</h3>
              <h3 className="font-squadaOne text-[28px] text-[#FF5C2B]">Rp{total.toLocaleString("id-ID")}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Submit */}
      <div className="mt-6 px-4">
        <div className="flex justify-center">
          <Button
            text={isSubmitting ? "Memproses..." : "Submit Transaksi"}
            onClick={submitTransaction}
            disabled={cart.length === 0 || isSubmitting}
          />
        </div>
      </div>

      <Navbar />
    </div>
  );
}