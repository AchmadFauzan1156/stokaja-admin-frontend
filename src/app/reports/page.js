"use client";

import { useState, useEffect, useCallback } from "react";
import Navbar from "@/components/Navbar";
import { apiGet, API_URL } from "@/lib/api";
import { useToast } from "@/components/Toast";
import LoadingSpinner from "@/components/LoadingSpinner";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

export default function ReportsPage() {
  const { showError } = useToast();
  
  const [filter, setFilter] = useState("semua"); // semua, daily, weekly, monthly
  const [isLoading, setIsLoading] = useState(true);
  
  const [reportData, setReportData] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalProfit, setTotalProfit] = useState(0);

  const fetchReports = useCallback(async () => {
    setIsLoading(true);
    try {
      let query = "";
      
      if (filter !== "semua") {
        const today = new Date();
        let startDate = new Date();
        
        if (filter === "daily") {
          startDate.setDate(today.getDate() - 1);
        } else if (filter === "weekly") {
          startDate.setDate(today.getDate() - 7);
        } else if (filter === "monthly") {
          startDate.setMonth(today.getMonth() - 1);
        }
        
        query = `?startDate=${startDate.toISOString().split('T')[0]}&endDate=${today.toISOString().split('T')[0]}`;
      }

      const resLaporan = await apiGet(`/laporan${query}`);
      setTotalRevenue(resLaporan.totalPendapatan || 0);
      setTotalProfit(resLaporan.totalKeuntunganBersih || 0);
      setReportData(resLaporan.rincian || []);

      // Untuk chart, ambil dari /grafik (jika filter "semua", default backend /grafik)
      const resGrafik = await apiGet("/grafik");
      const formattedChart = (resGrafik.data || []).map(item => ({
        name: item._id,
        Pendapatan: item.totalPendapatan,
        Keuntungan: item.totalKeuntungan
      }));
      setChartData(formattedChart);

    } catch (error) {
      showError("Gagal memuat laporan");
    } finally {
      setIsLoading(false);
    }
  }, [filter, showError]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const exportExcel = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      
      let query = "";
      if (filter !== "semua") {
        const today = new Date();
        let startDate = new Date();
        
        if (filter === "daily") {
          startDate.setDate(today.getDate() - 1);
        } else if (filter === "weekly") {
          startDate.setDate(today.getDate() - 7);
        } else if (filter === "monthly") {
          startDate.setMonth(today.getMonth() - 1);
        }
        
        query = `?startDate=${startDate.toISOString().split('T')[0]}&endDate=${today.toISOString().split('T')[0]}`;
      }

      const url = `${API_URL}/laporan/excel${query}`;
      
      // Fetch as blob
      const res = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) throw new Error("Gagal export");

      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `Laporan_StokAja_${Date.now()}.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      showError("Gagal mengunduh Excel");
    }
  };

  const exportPDF = () => {
    import("jspdf").then(({ default: jsPDF }) => {
      import("jspdf-autotable").then(() => {
        const doc = new jsPDF();
        
        doc.setFontSize(20);
        doc.text("Laporan Penjualan StokAja", 14, 22);
        
        doc.setFontSize(11);
        doc.text(`Periode: ${filter.charAt(0).toUpperCase() + filter.slice(1)}`, 14, 30);
        doc.text(`Tanggal Cetak: ${new Date().toLocaleString("id-ID")}`, 14, 36);

        const tableColumn = ["No", "Tanggal", "Resi", "Status", "Pajak (Rp)", "Total Harga (Rp)", "Untung Bersih (Rp)"];
        const tableRows = [];

        reportData.forEach((row, index) => {
          const rowData = [
            index + 1,
            new Date(row.createdAt).toLocaleDateString("id-ID"),
            row.nomorResi,
            (row.statusPesanan || "").toUpperCase(),
            (row.pajak || 0).toLocaleString("id-ID"),
            (row.totalHarga || 0).toLocaleString("id-ID"),
            (row.marginKeuntungan || 0).toLocaleString("id-ID"),
          ];
          tableRows.push(rowData);
        });

        doc.autoTable({
          startY: 45,
          head: [tableColumn],
          body: tableRows,
          theme: 'grid',
          headStyles: { fillColor: [110, 130, 46] }
        });

        const finalY = doc.lastAutoTable.finalY || 45;
        doc.setFontSize(12);
        doc.text(`Total Omzet: Rp ${totalRevenue.toLocaleString("id-ID")}`, 14, finalY + 10);
        doc.text(`Total Profit: Rp ${totalProfit.toLocaleString("id-ID")}`, 14, finalY + 18);

        doc.save(`Laporan_StokAja_${Date.now()}.pdf`);
      });
    });
  };

  return (
    <div className="min-h-screen bg-[#F0E7D6] pb-44">
      <div className="px-4 pt-14">
        <h1 className="font-squada text-[40px] text-[#6E822E]">Reports</h1>
      </div>

      {isLoading ? (
        <div className="flex justify-center mt-20"><LoadingSpinner size="lg" /></div>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-2 gap-3 px-4">
            <SummaryCard title="Pendapatan" value={`Rp${totalRevenue.toLocaleString("id-ID")}`} />
            <SummaryCard title="Profit" value={`Rp${totalProfit.toLocaleString("id-ID")}`} />
          </div>

          <div className="mt-8 px-4">
            <div className="rounded-3xl border-2 border-[#D6D6D6] bg-[#F5F5F5] p-5">
              <h2 className="mb-4 font-squada text-[28px] text-[#6E822E]">Statistik Penjualan</h2>
              {chartData.length > 0 ? (
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Area type="monotone" dataKey="Pendapatan" stroke="#6E822E" fill="#B6D04E" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex h-64 items-center justify-center rounded-[18px] border-2 border-dashed border-[#C8C8C8]">
                  <p className="text-center font-signika text-[18px] text-[#888]">Belum ada data</p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 px-4">
            <h2 className="mb-3 font-squada text-[28px] text-[#6E822E]">Filter Laporan</h2>
            <div className="flex gap-2 flex-wrap">
              <FilterButton label="Semua" active={filter === "semua"} onClick={() => setFilter("semua")} />
              <FilterButton label="Harian" active={filter === "daily"} onClick={() => setFilter("daily")} />
              <FilterButton label="Mingguan" active={filter === "weekly"} onClick={() => setFilter("weekly")} />
              <FilterButton label="Bulanan" active={filter === "monthly"} onClick={() => setFilter("monthly")} />
            </div>
          </div>

          <div className="mt-8 px-4">
            <h2 className="mb-3 font-squada text-[28px] text-[#6E822E]">Data Penjualan</h2>
            <div className="overflow-x-auto rounded-3xl border-2 border-[#D6D6D6] bg-[#F5F5F5]">
              <table className="w-full min-w-[500px]">
                <thead>
                  <tr className="border-b-2 border-[#D6D6D6]">
                    <th className="p-3 text-left font-signika">Tanggal</th>
                    <th className="p-3 text-left font-signika">Resi</th>
                    <th className="p-3 text-left font-signika">Status</th>
                    <th className="p-3 text-left font-signika">Omzet</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.map((row) => (
                    <tr key={row._id} className="border-b border-[#E5E5E5]">
                      <td className="p-3 font-signika text-sm">{new Date(row.createdAt).toLocaleDateString("id-ID")}</td>
                      <td className="p-3 font-signika text-sm">{row.nomorResi}</td>
                      <td className="p-3">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold
                          ${
                            row.statusPesanan === "selesai" ? "bg-green-100 text-green-700" :
                            row.statusPesanan === "batal" ? "bg-red-100 text-red-700" :
                            "bg-blue-100 text-blue-700"
                          }
                        `}>
                          {row.statusPesanan}
                        </span>
                      </td>
                      <td className="p-3 font-signika">Rp{(row.totalHarga || 0).toLocaleString("id-ID")}</td>
                    </tr>
                  ))}
                  {reportData.length === 0 && (
                    <tr>
                      <td colSpan="4" className="p-3 text-center text-[#888] font-signika">Belum ada transaksi</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-8 px-4">
            <div className="flex gap-3">
              <button onClick={exportPDF} className="flex-1 rounded-[20px] bg-[#FF5C2B] py-4 font-signika font-semibold text-white">
                Export PDF
              </button>
              <button onClick={exportExcel} className="flex-1 rounded-[20px] bg-[#6E822E] py-4 font-signika font-semibold text-white">
                Export Excel
              </button>
            </div>
          </div>
        </>
      )}

      <Navbar />
    </div>
  );
}

function SummaryCard({ title, value }) {
  return (
    <div className="rounded-[20px] border-2 border-[#D6D6D6] bg-[#F5F5F5] p-4">
      <p className="font-signika text-[16px] text-[#666]">{title}</p>
      <h3 className="mt-2 font-squada text-[32px] text-[#6E822E] break-words">{value}</h3>
    </div>
  );
}

function FilterButton({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-5 py-2 font-signika font-semibold transition-all
        ${active ? "bg-[#6E822E] text-white" : "bg-[#F5F5F5] text-[#666]"}
      `}
    >
      {label}
    </button>
  );
}