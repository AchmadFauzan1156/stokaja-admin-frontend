"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api";
import Navbar from "@/components/Navbar";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useToast } from "@/components/Toast";

export default function UsersPage() {
  const router = useRouter();
  const { showSuccess, showError } = useToast();

  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State (Create)
  const [showModal, setShowModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("kasir");

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await apiGet("/users");
      setUsers(res.data || []);
    } catch (error) {
      showError("Gagal memuat pengguna");
    } finally {
      setIsLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const openAddModal = () => {
    setName("");
    setEmail("");
    setPassword("");
    setRole("kasir");
    setShowModal(true);
  };

  const saveUser = async () => {
    if (!name || !email || !password) {
      showError("Semua field wajib diisi");
      return;
    }

    setIsSaving(true);
    try {
      await apiPost("/users", { namaLengkap: name, email, password, role });
      showSuccess("Pengguna berhasil ditambahkan");
      setShowModal(false);
      fetchUsers();
    } catch (error) {
      showError(error.message || "Gagal menambah pengguna");
    } finally {
      setIsSaving(false);
    }
  };

  const changeRole = async (id, newRole) => {
    try {
      await apiPut(`/users/${id}/role`, { role: newRole });
      showSuccess("Role berhasil diubah");
      fetchUsers();
    } catch (error) {
      showError(error.message || "Gagal mengubah role");
    }
  };

  const deleteData = async (id) => {
    if (!confirm("Yakin ingin menghapus pengguna ini? Operasi ini tidak dapat dibatalkan.")) return;
    try {
      await apiDelete(`/users/${id}`);
      showSuccess("Pengguna berhasil dihapus");
      fetchUsers();
    } catch (error) {
      showError(error.message || "Gagal menghapus pengguna");
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
            <h1 className="font-squada text-[36px] text-[#6E822E]">Pengguna</h1>
          </div>
          <button
            onClick={openAddModal}
            className="rounded-xl bg-[#6E822E] px-4 py-2 font-signika font-semibold text-white shadow"
          >
            + Akun
          </button>
        </div>
      </div>

      {/* List */}
      <div className="mt-8 px-4">
        {isLoading ? (
          <div className="flex justify-center mt-20"><LoadingSpinner size="lg" /></div>
        ) : users.length === 0 ? (
          <p className="text-center font-signika text-[#888]">Belum ada pengguna.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {users.map((u) => (
              <div key={u._id} className="flex flex-col rounded-[20px] border-2 border-[#D6D6D6] bg-[#F5F5F5] p-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-squada text-[24px] text-[#4B4B4B]">{u.namaLengkap}</h2>
                  <span className={`rounded-full px-3 py-1 font-signika text-sm font-semibold 
                    ${u.role === 'admin' ? 'bg-red-100 text-red-700' : 
                      u.role === 'kasir' ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-700'}`}>
                    {(u.role || "").toUpperCase()}
                  </span>
                </div>
                <p className="mt-1 font-signika text-[#666]">{u.email}</p>
                <p className="mt-1 font-signika text-[#666] text-sm">Bergabung: {new Date(u.createdAt).toLocaleDateString("id-ID")}</p>
                
                <div className="mt-4 flex items-center justify-between">
                  <select 
                    value={u.role} 
                    onChange={(e) => changeRole(u._id, e.target.value)}
                    className="rounded-lg border border-[#D6D6D6] bg-white px-3 py-2 font-signika text-sm"
                  >
                    <option value="pelanggan">Pelanggan</option>
                    <option value="kasir">Kasir</option>
                    <option value="admin">Admin</option>
                  </select>

                  <button onClick={() => deleteData(u._id)} className="rounded-lg bg-red-500 px-4 py-2 font-signika text-sm font-semibold text-white">Hapus</button>
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
            <h2 className="mb-4 font-squada text-[28px] text-[#6E822E]">Tambah Pengguna</h2>
            
            <div className="flex flex-col gap-4">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-[#D6D6D6] p-3 font-signika"
                placeholder="Nama Lengkap"
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-[#D6D6D6] p-3 font-signika"
                placeholder="Email"
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-[#D6D6D6] p-3 font-signika"
                placeholder="Password Baru"
              />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full rounded-xl border border-[#D6D6D6] p-3 font-signika bg-white"
              >
                <option value="pelanggan">Pelanggan</option>
                <option value="kasir">Kasir</option>
                <option value="admin">Admin</option>
              </select>
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
                onClick={saveUser}
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
