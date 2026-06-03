"use client";

import { useRouter } from "next/navigation";

import {
  useAdmin,
}
from "@/context/AdminContext";

import Navbar from "@/components/Navbar";

export default function DashboardPage() {

  const router = useRouter();

  const {
  products,
  orders,
  contacts,

  lowStockProducts,

  incomingOrders,

  revenue,

  unreadMessages,
} = useAdmin();

  const lowStocks =
  products.filter(
    (product) =>
      product.stock > 0 &&
      product.stock <= 5
  );

  const latestTransactions =
  orders.slice(-3).reverse();

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
  value={incomingOrders}
/>

<StatCard
  title="Produk"
  value={products.length}
/>

<StatCard
  title="Omzet"
  value={`Rp${revenue.toLocaleString(
    "id-ID"
  )}`}
/>

<StatCard
  title="Chat"
  value={unreadMessages}
/>

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

            <p
              className="
                text-center

                font-signika
                text-[18px]

                text-[#888]
              "
            >
              Chart akan muncul
              setelah integrasi backend
            </p>

          </div>

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
                key={item.id}

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
                    {item.name}
                  </h3>

                  <p
                    className="
                      font-signika

                      text-[#666]
                    "
                  >
                    Sisa stok:
                    {" "}
                    {item.stock}
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
                key={trx.id}

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
                  {trx.id}
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
                  {trx.customer}
                </p>

                <p
                  className="
                    mt-1

                    font-signika

                    text-[#FF5C2B]
                  "
                >
                  Rp
                  {trx.total.toLocaleString(
                    "id-ID"
                  )}
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