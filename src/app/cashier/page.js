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
  const [paymentMethod, setPaymentMethod] = useState("tunai");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      setIsLoadingOrders(true);
      // Fetch pesanan dengan status 'pending', 'diproses', 'dikirim' (yang belum selesai)
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
      const results = await Promise.allSettled([
        apiGet("/produk?limit=500"),
        apiGet("/bahan-baku?limit=500")
      ]);

      const resProduk = results[0].status === "fulfilled" ? results[0].value : [];
      const resBahan = results[1].status === "fulfilled" ? results[1].value : [];
      
      const produkList = Array.isArray(resProduk) ? resProduk : (resProduk.data || []);
      const bahanList = Array.isArray(resBahan) ? resBahan : (resBahan.data || []);

      const produkData = produkList.map(p => ({ 
        ...p, 
        tipeItem: 'Product' 
      }));
      
      const bahanData = bahanList.map(b => ({ 
        ...b, 
        tipeItem: 'RawMaterial', 
        nama: b.namaBahan, 
        harga: b.hargaJual 
      }));

      setProducts([...produkData, ...bahanData]);
    } catch (error) {
      console.error("Gagal memuat produk dan bahan baku", error);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    fetchProducts();
  }, [fetchOrders, fetchProducts]);

  const addProduct = (product) => {
    if (product.stok <= 0) {
      showError("Stok produk habis!");
      return;
    }
    const existing = cart.find((item) => item._id === product._id);
    if (existing) {
      if ((Number(existing.qty) || 0) + 1 > product.stok) {
        showError("Melebihi sisa stok!");
        return;
      }
      setCart((prev) =>
        prev.map((item) =>
          item._id === product._id ? { ...item, qty: (Number(item.qty) || 0) + 1 } : item
        )
      );
      return;
    }
    setCart((prev) => [...prev, { ...product, qty: 1 }]);
  };

  const removeProduct = (product) => {
    const existing = cart.find((item) => item._id === product._id);
    if (!existing) return;

    const currentQty = Number(existing.qty) || 0;
    if (currentQty <= 1) {
      setCart((prev) => prev.filter((item) => item._id !== product._id));
    } else {
      setCart((prev) =>
        prev.map((item) =>
          item._id === product._id ? { ...item, qty: currentQty - 1 } : item
        )
      );
    }
  };

  const updateProductQty = (product, newQty) => {
    if (newQty === "") {
      setCart((prev) =>
        prev.map((item) =>
          item._id === product._id ? { ...item, qty: "" } : item
        )
      );
      return;
    }
    
    const qty = parseInt(newQty, 10);
    if (isNaN(qty) || qty < 0) return;
    
    if (qty === 0) {
       setCart((prev) => prev.filter((item) => item._id !== product._id));
       return;
    }
    
    if (qty > product.stok) {
      showError("Melebihi sisa stok!");
      return;
    }
    
    setCart((prev) =>
      prev.map((item) =>
        item._id === product._id ? { ...item, qty } : item
      )
    );
  };

  const total = cart.reduce((sum, item) => sum + (item.harga || 0) * (Number(item.qty) || 0), 0);

  const filteredProducts = products.filter((product) =>
    (product.nama || "").toLowerCase().includes(search.toLowerCase())
  );

  const submitTransaction = async () => {
    if (cart.length === 0) return;
    setIsSubmitting(true);

    try {
      const validCart = cart.filter(c => Number(c.qty) > 0);
      
      if (validCart.length === 0) {
        showError("Keranjang tidak boleh kosong atau berisi kuantitas nol.");
        setIsSubmitting(false);
        return;
      }

      const payload = {
        isiKeranjang: validCart.map(c => ({
          produkId: c._id,
          jumlahBeli: Number(c.qty),
          tipeItem: c.tipeItem || 'Product'
        })),
        metodePembayaran: paymentMethod,
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
        <h1 className="font-squada text-[40px] text-[#6E822E]">Cashier</h1>
      </div>

      {/* Incoming Orders */}
      <div className="mt-6 px-4">
        <h2 className="mb-3 font-squada text-[30px] text-[#6E822E]">Daftar Pesanan</h2>
        
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
                    <h3 className="font-squada text-[24px] text-[#6E822E]">{order.nomorResi}</h3>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold
                      ${
                        order.statusPesanan === "selesai" ? "bg-green-100 text-green-700" :
                        order.statusPesanan === "batal" ? "bg-red-100 text-red-700" :
                        order.statusPesanan === "pending" ? "bg-yellow-100 text-yellow-700" :
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
                    <span className="font-squada text-[22px] text-[#FF5C2B]">
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
        <h2 className="mb-3 font-squada text-[30px] text-[#6E822E]">Kasir Manual</h2>
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
          {filteredProducts.map((product) => {
            const cartItem = cart.find(c => c._id === product._id);
            const inCart = !!cartItem;
            const qty = cartItem ? cartItem.qty : 0;
            return (
              <div
                key={product._id}
                className="flex items-center justify-between rounded-[18px] border-2 border-[#D6D6D6] bg-[#F5F5F5] p-4 text-left"
              >
                <div>
                  <h3 className="font-squada text-[22px] text-[#4B4B4B]">{product.nama}</h3>
                  <p className="text-[#FF5C2B] font-signika">Rp{(product.harga || 0).toLocaleString("id-ID")} <span className="text-sm text-[#888]">/ {product.satuan || "satuan"}</span></p>
                  <p className="text-xs text-[#888] font-signika">Sisa stok: {product.stok}</p>
                </div>
                <div className="flex items-center gap-2">
                  {inCart && (
                    <>
                      <button onClick={() => removeProduct(product)} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FF5C2B] text-white font-bold text-xl">-</button>
                      <input 
                        type="number"
                        value={qty}
                        onChange={(e) => updateProductQty(product, e.target.value)}
                        className="w-16 bg-white border-2 border-[#D6D6D6] rounded-xl text-center font-squada text-[22px] text-[#4B4B4B] outline-none"
                        min="0"
                      />
                    </>
                  )}
                  <button onClick={() => addProduct(product)} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#B6D04E] text-white font-bold text-xl">+</button>
                </div>
              </div>
            );
          })}
          {filteredProducts.length === 0 && (
            <p className="text-center font-signika text-[#888]">Produk tidak ditemukan</p>
          )}
        </div>
      </div>

      {/* Cart */}
      <div className="mt-8 px-4">
        <h2 className="mb-3 font-squada text-[30px] text-[#6E822E]">Keranjang</h2>
        <div className="rounded-3xl border-2 border-[#D6D6D6] bg-[#F5F5F5] p-4">
          {cart.length === 0 ? (
            <p className="text-center text-[#888] font-signika">Belum ada produk</p>
          ) : (
            cart.map((item) => (
              <div key={item._id} className="mb-3 flex justify-between items-center font-signika">
                <div className="flex items-center gap-3 flex-1">
                  <div className="flex items-center gap-2 bg-white rounded-full border border-[#D6D6D6] p-1 shrink-0">
                    <button onClick={() => removeProduct(item)} className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#FF5C2B] text-white font-bold">-</button>
                    <input 
                      type="number"
                      value={item.qty}
                      onChange={(e) => updateProductQty(item, e.target.value)}
                      className="w-12 bg-transparent text-center font-squada text-lg text-[#4B4B4B] outline-none"
                      min="0"
                    />
                    <button onClick={() => addProduct(item)} className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#B6D04E] text-white font-bold">+</button>
                  </div>
                  <span className="font-semibold text-[#4B4B4B] flex-1 truncate">{item.nama}</span>
                </div>
                <span className="font-bold text-[#FF5C2B] ml-2">Rp{((item.harga || 0) * (Number(item.qty) || 0)).toLocaleString("id-ID")}</span>
              </div>
            ))
          )}
          <div className="mt-4 border-t-2 border-[#DDD] pt-4">
            <div className="flex justify-between">
              <h3 className="font-squada text-[28px] text-[#FF5C2B]">Total</h3>
              <h3 className="font-squada text-[28px] text-[#FF5C2B]">Rp{total.toLocaleString("id-ID")}</h3>
            </div>
          </div>
          
          <div className="mt-4 border-t-2 border-[#DDD] pt-4">
            <h3 className="font-squada text-[20px] text-[#4B4B4B] mb-2">Metode Pembayaran</h3>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 font-signika">
                <input 
                  type="radio" 
                  name="paymentMethod" 
                  value="tunai" 
                  checked={paymentMethod === "tunai"} 
                  onChange={() => setPaymentMethod("tunai")} 
                />
                Tunai
              </label>
              <label className="flex items-center gap-2 font-signika">
                <input 
                  type="radio" 
                  name="paymentMethod" 
                  value="qris" 
                  checked={paymentMethod === "qris"} 
                  onChange={() => setPaymentMethod("qris")} 
                />
                QRIS
              </label>
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