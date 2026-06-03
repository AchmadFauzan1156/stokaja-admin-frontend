"use client";

import { useState } from "react";

import {
  useAdmin,
} from "@/context/AdminContext";

import * as XLSX
from "xlsx";

import Navbar from "@/components/Navbar";

export default function ReportsPage() {

  const [filter, setFilter] =
    useState("monthly");

  const {
  orders,
} = useAdmin();

  const reportData =
  orders.map(
    (order) => ({
      period: order.id,

      transactions: order.items,

      revenue: order.total,

      status: order.status,
    })
  );

  const totalRevenue =
  orders.reduce(
    (sum, order) =>
      sum + order.total,
    0
  );

  const totalProfit =
  Math.floor(
    totalRevenue * 0.25
  );

  const exportExcel = () => {

  const worksheet =
    XLSX.utils.json_to_sheet(
      reportData
    );

  const workbook =
    XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    "Reports"
  );

  XLSX.writeFile(
    workbook,
    "stokaja-report.xlsx"
  );
};

const exportPDF = () => {

  alert(
    "Export PDF akan diintegrasikan nanti"
  );
};

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
          Reports
        </h1>

      </div>

      {/* Summary Cards */}
      <div
        className="
          mt-6

          grid
          grid-cols-2
          gap-3

          px-4
        "
      >

        <SummaryCard
          title="Pendapatan"
          value={`Rp${totalRevenue.toLocaleString(
            "id-ID"
          )}`}
        />

        <SummaryCard
          title="Profit"
          value={`Rp${totalProfit.toLocaleString(
            "id-ID"
          )}`}
        />

      </div>

      {/* Chart */}
      <div className="mt-8 px-4">

        <div
          className="
            rounded-3xl

            border-2
            border-[#D6D6D6]

            bg-[#F5F5F5]

            p-5
          "
        >

          <h2
            className="
              mb-4

              font-squadaOne
              text-[28px]

              text-[#6E822E]
            "
          >
            Statistik Penjualan
          </h2>

          <div
            className="
              flex
              h-64

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
              Area Chart
              <br />
              (Integrasi Recharts /
              Chart.js)
            </p>

          </div>

        </div>

      </div>

      {/* Filters */}
      <div
        className="
          mt-8

          px-4
        "
      >

        <h2
          className="
            mb-3

            font-squadaOne
            text-[28px]

            text-[#6E822E]
          "
        >
          Filter Laporan
        </h2>

        <div
          className="
            flex
            gap-2
          "
        >

          <FilterButton
            label="Harian"
            active={
              filter === "daily"
            }
            onClick={() =>
              setFilter(
                "daily"
              )
            }
          />

          <FilterButton
            label="Mingguan"
            active={
              filter === "weekly"
            }
            onClick={() =>
              setFilter(
                "weekly"
              )
            }
          />

          <FilterButton
            label="Bulanan"
            active={
              filter === "monthly"
            }
            onClick={() =>
              setFilter(
                "monthly"
              )
            }
          />

        </div>

      </div>

      {/* Data Table */}
      <div
        className="
          mt-8

          px-4
        "
      >

        <h2
          className="
            mb-3

            font-squadaOne
            text-[28px]

            text-[#6E822E]
          "
        >
          Data Penjualan
        </h2>

        <div
          className="
            overflow-hidden

            rounded-3xl

            border-2
            border-[#D6D6D6]

            bg-[#F5F5F5]
          "
        >

          <table
            className="
              w-full
            "
          >

            <thead>

              <tr
                className="
                  border-b-2
                  border-[#D6D6D6]
                "
              >

                <th
                  className="
                    p-3

                    text-left

                    font-signika
                  "
                >
                  Periode
                </th>

                <th
                  className="
                    p-3

                    text-left

                    font-signika
                  "
                >
                  Transaksi
                </th>

                <th
  className="
    p-3

    text-left

    font-signika
  "
>
  Status
</th>

<th
  className="
    p-3

    text-left

    font-signika
  "
>
  Omzet
</th>

              </tr>

            </thead>

            <tbody>

              {reportData.map(
                (row) => (

                  <tr
                    key={
                      row.period
                    }

                    className="
                      border-b
                      border-[#E5E5E5]
                    "
                  >

                    <td
  className="
    p-3
  "
>

  <span
    className={`
      rounded-full

      px-3
      py-1

      text-xs
      font-semibold

      ${
        row.status === "Selesai"
          ? "bg-green-100 text-green-700"
          : row.status ===
            "Sedang Disiapkan"
          ? "bg-yellow-100 text-yellow-700"
          : "bg-blue-100 text-blue-700"
      }
    `}
  >
    {row.status}
  </span>

</td>

<td
  className="
    p-3

    font-signika
  "
>
  Rp
  {row.revenue.toLocaleString(
    "id-ID"
  )}
</td>

                  </tr>

                )
              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* Export */}
      <div
        className="
          mt-8

          px-4
        "
      >

        <div
          className="
            flex
            gap-3
          "
        >

          <button
  onClick={exportPDF}
  className="
    flex-1

    rounded-[20px]

    bg-[#FF5C2B]

    py-4

    font-signika
    font-semibold

    text-white
  "
>
  Export PDF
</button>

<button
  onClick={exportExcel}
  className="
    flex-1

    rounded-[20px]

    bg-[#6E822E]

    py-4

    font-signika
    font-semibold

    text-white
  "
>
  Export Excel
</button>

        </div>

      </div>

      <Navbar />

    </div>
  );
}

function SummaryCard({
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

function FilterButton({
  label,
  active,
  onClick,
}) {

  return (
    <button
      onClick={onClick}

      className={`
        rounded-full

        px-5
        py-2

        font-signika
        font-semibold

        transition-all

        ${
          active
            ? "bg-[#6E822E] text-white"
            : "bg-[#F5F5F5] text-[#666]"
        }
      `}
    >
      {label}
    </button>
  );
}