"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { apiGet } from "@/lib/api";
import Navbar from "@/components/Navbar";
import LoadingSpinner from "@/components/LoadingSpinner";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    incomingOrders: 0,
    totalProducts: 0,
    revenue: 0,
    unreadMessages: 0,
  });
  const [lowStocks, setLowStocks] = useState([]);
  const [latestTransactions, setLatestTransactions] = useState([]);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        // 1. Pesanan masuk
        const resOrders = await apiGet("/transaksi?status=menunggu&limit=1");
        
        // 2. Produk total & low stock
        const resProducts = await apiGet("/produk?limit=100");
        const allProducts = resProducts.data || [];
        const low = allProducts.filter(p => p.stok > 0 && p.stok <= (p.stokMinimum || 5));
        
        // 3. Omzet dari Laporan
        const resLaporan = await apiGet("/laporan");
        
        // 4. Transaksi Terbaru
        const resLatest = await apiGet("/transaksi?limit=3");
        
        // 5. Data Grafik
        const resGrafik = await apiGet("/grafik");

        setStats({
          incomingOrders: resOrders.total || 0,
          totalProducts: resProducts.total || 0,
          revenue: resLaporan.totalPendapatan || 0,
          unreadMessages: 0, // Belum ada API untuk chat unread
        });

        setLowStocks(low);
        setLatestTransactions(resLatest.data || []);
        
        // Format chart data
        const formattedChart = (resGrafik.data || []).map(item => ({
          name: item._id, // Format YYYY-MM-DD
          Pendapatan: item.totalPendapatan,
          Keuntungan: item.totalKeuntungan
        }));
        setChartData(formattedChart);

      } catch (error) {
        console.error("Gagal memuat dashboard:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F0E7D6] flex justify-center items-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div
      className="
        min-h-screen

        bg-[#F0E7D6]

        pb-44
      "
    >

      {/* Header */}
      <div
        className="
          px-4
          pt-14
        "
      >

        <h1
          className="
            font-squadaOne
            text-[40px]

            text-[#6E822E]
          "
        >
          Dashboard
        </h1>

      </div>

      {/* Statistik */}
      <div
        className="
          mt-6

          grid
          grid-cols-2
          gap-3

          px-4
        "
      >

        <StatCard
          title="Pesanan"
          value={stats.incomingOrders}
        />

        <StatCard
          title="Produk"
          value={stats.totalProducts}
        />

        <StatCard
          title="Omzet"
          value={`Rp${stats.revenue.toLocaleString("id-ID")}`}
        />

        <StatCard
          title="Chat"
          value={stats.unreadMessages}
        />

      </div>

      {/* Manajemen Data */}
      <div className="mt-8 px-4">
        <h2 className="mb-3 font-squadaOne text-[30px] text-[#6E822E]">
          Manajemen Data
        </h2>
        <div className="grid grid-cols-3 gap-3">
          <button 
            onClick={() => router.push("/categories")}
            className="flex flex-col items-center justify-center rounded-2xl border-2 border-[#D6D6D6] bg-[#F5F5F5] p-3 transition hover:border-[#B6D04E]"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E5F0B6] text-2xl">📁</div>
            <span className="mt-2 text-center font-signika text-sm font-semibold text-[#444]">Kategori</span>
          </button>
          
          <button 
            onClick={() => router.push("/users")}
            className="flex flex-col items-center justify-center rounded-2xl border-2 border-[#D6D6D6] bg-[#F5F5F5] p-3 transition hover:border-[#B6D04E]"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E5F0B6] text-2xl">👥</div>
            <span className="mt-2 text-center font-signika text-sm font-semibold text-[#444]">Pengguna</span>
          </button>
          
          <button 
            onClick={() => router.push("/payments")}
            className="flex flex-col items-center justify-center rounded-2xl border-2 border-[#D6D6D6] bg-[#F5F5F5] p-3 transition hover:border-[#B6D04E]"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E5F0B6] text-2xl">💳</div>
            <span className="mt-2 text-center font-signika text-sm font-semibold text-[#444]">Metode Bayar</span>
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="mt-8 px-4">

        <h2
          className="
            mb-3

            font-squadaOne
            text-[30px]

            text-[#6E822E]
          "
        >
          Statistik Penjualan
        </h2>

        <div
          className="
            rounded-3xl

            border-2
            border-[#D6D6D6]

            bg-[#F5F5F5]

            p-5
          "
        >

          {chartData.length > 0 ? (
            <div className="h-64 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="Pendapatan" stroke="#6E822E" strokeWidth={3} />
                  <Line type="monotone" dataKey="Keuntungan" stroke="#FF5C2B" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div
              className="
                flex
                h-52
                items-center
                justify-center
                rounded-[18px]
                border-2
                border-dashed
                border-[#C8C8C8]
              "
            >
              <p className="text-center font-signika text-[18px] text-[#888]">
                Belum ada data grafik
              </p>
            </div>
          )}

        </div>

      </div>

      {/* Stok Menipis */}
      <div className="mt-8 px-4">

        <div
          className="
            mb-3

            flex
            items-center
            justify-between
          "
        >

          <h2
            className="
              font-squadaOne
              text-[30px]

              text-[#6E822E]
            "
          >
            Stok Menipis
          </h2>

          <button
            onClick={() =>
              router.push(
                "/stock"
              )
            }

            className="
              font-signika
              font-semibold

              text-[#FF5C2B]
            "
          >
            Lihat Semua
          </button>

        </div>

        <div
          className="
            flex
            flex-col
            gap-3
          "
        >

          {lowStocks.map(
            (item) => (

              <button
                key={item._id}

                onClick={() =>
                  router.push(
                    "/stock"
                  )
                }

                className="
                  flex
                  items-center
                  justify-between

                  rounded-[20px]

                  border-2
                  border-[#D6D6D6]

                  bg-[#F5F5F5]

                  p-4
                "
              >

                <div>

                  <h3
                    className="
                      font-squadaOne
                      text-[24px]

                      text-[#4B4B4B]
                    "
                  >
                    {item.nama}
                  </h3>

                  <p
                    className="
                      font-signika

                      text-[#666]
                    "
                  >
                    Sisa stok:
                    {" "}
                    {item.stok}
                  </p>

                </div>

                <div
                  className="
                    rounded-full

                    bg-red-100

                    px-3
                    py-1

                    font-signika
                    font-semibold

                    text-red-600
                  "
                >
                  Rendah
                </div>

              </button>

            )
          )}

        </div>

      </div>

      {/* Transaksi Terbaru */}
      <div className="mt-8 px-4">

        <div
          className="
            mb-3

            flex
            items-center
            justify-between
          "
        >

          <h2
            className="
              font-squadaOne
              text-[30px]

              text-[#6E822E]
            "
          >
            Transaksi Terbaru
          </h2>

          <button
            onClick={() =>
              router.push(
                "/cashier"
              )
            }

            className="
              font-signika
              font-semibold

              text-[#FF5C2B]
            "
          >
            Lihat Semua
          </button>

        </div>

        <div
          className="
            flex
            flex-col
            gap-3
          "
        >

          {latestTransactions.map(
            (trx) => (

              <button
                key={trx._id}

                onClick={() =>
                  router.push(
                    "/cashier"
                  )
                }

                className="
                  rounded-[20px]

                  border-2
                  border-[#D6D6D6]

                  bg-[#F5F5F5]

                  p-4

                  text-left
                "
              >

                <h3
                  className="
                    font-squadaOne
                    text-[24px]

                    text-[#4B4B4B]
                  "
                >
                  {trx.nomorResi}
                </h3>

                <p
                  className="
                    mt-1

                    font-signika

                    text-[#666]
                  "
                >
                  Pelanggan:
                  {" "}
                  {trx.pelangganId ? "Pelanggan Terdaftar" : "Pelanggan Offline"}
                </p>

                <p
                  className="
                    mt-1

                    font-signika

                    text-[#FF5C2B]
                  "
                >
                  Rp
                  {(trx.totalHarga || 0).toLocaleString("id-ID")}
                </p>

              </button>

            )
          )}

        </div>

      </div>

      {/* Navbar */}
      <Navbar />

    </div>
  );
}

function StatCard({
  title,
  value,
}) {

  return (
    <div
      className="
        rounded-[20px]

        border-2
        border-[#D6D6D6]

        bg-[#F5F5F5]

        p-4
      "
    >

      <p
        className="
          font-signika
          text-[16px]

          text-[#666]
        "
      >
        {title}
      </p>

      <h3
        className="
          mt-2

          font-squadaOne
          text-[32px]

          text-[#6E822E]
        "
      >
        {value}
      </h3>

    </div>
  );
}