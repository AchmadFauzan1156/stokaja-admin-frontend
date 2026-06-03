"use client";

import {
  useParams,
  useRouter,
} from "next/navigation";

import {
  useAdmin,
} from "@/context/AdminContext";

export default function OrderDetailPage() {

  const router =
    useRouter();

  const { id } =
    useParams();

  const {
    orders,
    setOrders,
  } = useAdmin();

  const order =
    orders.find(
      (o) => o.id === id
    );

  if (!order) {

    return (
      <div
        className="
          min-h-screen

          flex
          items-center
          justify-center
        "
      >
        Pesanan tidak ditemukan
      </div>
    );
  }

  const updateStatus =
    () => {

      setOrders(
        (prev) =>
          prev.map((o) => {

            if (
              o.id !== order.id
            ) {
              return o;
            }

            if (
              o.status ===
              "Pesanan Masuk"
            ) {

              return {
                ...o,

                status:
                  "Sedang Disiapkan",
              };
            }

            if (
              o.status ===
              "Sedang Disiapkan"
            ) {

              return {
                ...o,

                status:
                  "Sedang Diantar",
              };
            }

            if (
              o.status ===
              "Sedang Diantar"
            ) {

              return {
                ...o,

                status:
                  "Selesai",
              };
            }

            return o;
          })
      );
    };

  const getButtonText =
    () => {

      switch (
        order.status
      ) {

        case
          "Pesanan Masuk":
          return "Terima Pesanan";

        case
          "Sedang Disiapkan":
          return "Antarkan";

        case
          "Sedang Diantar":
          return "Selesaikan";

        default:
          return null;
      }
    };

  return (
    <div
      className="
        min-h-screen

        bg-[#F0E7D6]

        px-4
        pt-14
      "
    >

      <button
        onClick={() =>
          router.back()
        }

        className="
          mb-6

          text-[#6E822E]
        "
      >
        ← Kembali
      </button>

      <h1
        className="
          font-squadaOne
          text-[40px]

          text-[#6E822E]
        "
      >
        Detail Pesanan
      </h1>

      <div
        className="
          mt-6

          rounded-3xl

          border-2
          border-[#D6D6D6]

          bg-white

          p-5
        "
      >

        <h2
          className="
            font-squadaOne
            text-[28px]
          "
        >
          {order.id}
        </h2>

        <p
          className="
            mt-2

            text-[#666]
          "
        >
          {order.customer}
        </p>

        <div
          className="
            mt-5
          "
        >

          <p>
            Jumlah Item:
            {" "}
            {order.items}
          </p>

          <p
            className="
              mt-2
            "
          >
            Status:
            {" "}
            {order.status}
          </p>

          <p
            className="
              mt-2

              font-bold

              text-[#FF5C2B]
            "
          >
            Rp
            {order.total.toLocaleString(
              "id-ID"
            )}
          </p>

        </div>

      </div>

      {order.status !==
        "Selesai" && (

        <div
          className="
            mt-6

            flex
            justify-center
          "
        >

          <button
            onClick={
              updateStatus
            }

            className="
              rounded-2xl

              bg-[#6E822E]

              px-6
              py-3

              font-semibold

              text-white
            "
          >
            {
              getButtonText()
            }
          </button>

        </div>

      )}

    </div>
  );
}