/**
 * Mapper layer — Translasi field antara backend (Indonesia) dan frontend (English).
 * Backend tetap stabil, frontend pakai nama field yang konsisten.
 */

// ============= BACKEND → FRONTEND =============

/** Map 1 produk dari backend ke format frontend */
export function mapProduct(p) {
  if (!p) return null;
  return {
    id: p._id,
    name: p.nama,
    description: p.deskripsi || "",
    category: p.kategori?.nama || p.kategori || "",
    categoryId: p.kategori?._id || p.kategori || null,
    price: p.harga,
    stock: p.stok,
    minStock: p.stokMinimum || 5,
    maxStock: p.stokMaksimum || 100,
    unit: p.satuan,
    qty: `${p.stok} ${p.satuan}`,
    costPrice: p.hargaModal || 0,
    image: p.gambar || null,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  };
}

/** Map array produk */
export function mapProducts(products) {
  return (products || []).map(mapProduct);
}

/** Map 1 kategori dari backend ke frontend */
export function mapCategory(c) {
  if (!c) return null;
  return {
    id: c._id,
    name: c.nama,
    description: c.deskripsi || "",
    order: c.urutan || 0,
    active: c.aktif !== false,
  };
}

/** Map array kategori */
export function mapCategories(categories) {
  return (categories || []).map(mapCategory);
}

/** Map 1 user/profil dari backend ke frontend */
export function mapUser(u) {
  if (!u) return null;
  return {
    id: u._id,
    fullName: u.namaLengkap || "",
    email: u.email,
    phone: u.noHP || "",
    addresses: (u.alamat || []).map((a) => ({
      id: a._id,
      label: a.label,
      address: a.alamatDetail,
      lat: a.lat,
      lng: a.lng,
    })),
    avatar: u.avatar || null,
    role: u.role,
    createdAt: u.createdAt,
  };
}

/** Map 1 transaksi/pesanan dari backend ke frontend */
export function mapTransaction(t) {
  if (!t) return null;
  return {
    id: t._id,
    receiptNumber: t.nomorResi,
    customerId: t.pelangganId,
    items: (t.keranjang || []).map((item) => ({
      productId: item.produkId?._id || item.produkId,
      type: item.tipeItem === "Product" ? "produk" : "bahanBaku",
      name: item.produkId?.nama || item.produkId?.namaBahan || "Item",
      image: item.produkId?.gambar || null,
      qty: item.jumlahBeli,
      price: item.hargaSatuan,
      subtotal: item.jumlahBeli * item.hargaSatuan,
      note: item.catatan || "",
    })),
    paymentMethod: t.metodePembayaran,
    amountPaid: t.jumlahDibayar,
    change: t.kembalian,
    tax: t.pajak,
    total: t.totalHarga,
    profit: t.marginKeuntungan,
    status: t.statusPesanan,
    location: t.lokasiPengiriman
      ? {
          lat: t.lokasiPengiriman.lat,
          lng: t.lokasiPengiriman.lng,
          address: t.lokasiPengiriman.alamatDetail,
        }
      : null,
    date: t.createdAt,
  };
}

/** Map array transaksi */
export function mapTransactions(transactions) {
  return (transactions || []).map(mapTransaction);
}

/** Map metode pembayaran */
export function mapPaymentMethod(m) {
  if (!m) return null;
  return {
    id: m._id,
    name: m.nama,
    active: m.aktif !== false,
  };
}

/** Map array metode pembayaran */
export function mapPaymentMethods(methods) {
  return (methods || []).map(mapPaymentMethod);
}

/** Map chat message */
export function mapMessage(msg) {
  if (!msg) return null;
  return {
    id: msg._id,
    sender: msg.pengirim?._id || msg.pengirim,
    senderName: msg.pengirim?.namaLengkap || "Unknown",
    senderRole: msg.pengirim?.role || "pelanggan",
    senderAvatar: msg.pengirim?.avatar || null,
    receiver: msg.penerima?._id || msg.penerima,
    message: msg.isiPesan,
    read: msg.dibaca,
    time: msg.createdAt,
  };
}

/** Map array messages */
export function mapMessages(messages) {
  return (messages || []).map(mapMessage);
}

// ============= FRONTEND → BACKEND =============

/** Bangun payload checkout dari cart items frontend */
export function unmapCheckout({ items, address, paymentMethod, tax = 0, amountPaid = 0 }) {
  return {
    isiKeranjang: items.map((item) => ({
      produkId: item.id,
      jumlahBeli: item.cartQty,
      tipe: item.type || "produk",
      catatan: item.note || "",
    })),
    lokasiPengiriman: address
      ? {
          lat: address.lat || null,
          lng: address.lng || null,
          alamatDetail: address.address || address.label || "",
        }
      : null,
    persentasePajak: tax,
    metodePembayaran: paymentMethod || "tunai",
    jumlahDibayar: amountPaid,
  };
}

/** Map profil update frontend → backend */
export function unmapProfileUpdate({ fullName, phone, email, oldPassword, newPassword }) {
  const data = {};
  if (fullName !== undefined) data.namaLengkap = fullName;
  if (phone !== undefined) data.noHP = phone;
  if (email !== undefined) data.email = email;
  if (oldPassword) data.passwordLama = oldPassword;
  if (newPassword) data.passwordBaru = newPassword;
  return data;
}
