"use client";

import { useState } from "react";

import {
  useAdmin,
} from "@/context/AdminContext";

import Navbar from "@/components/Navbar";

import Link from "next/link";

import Button from "@/components/Button";

export default function CashierPage() {

  const {
  orders,
  setOrders,
  products,
  setProducts,
} = useAdmin();

  const [search, setSearch] =
    useState("");

  const [cart, setCart] =
    useState([]);

  const addProduct = (
    product
  ) => {

    const existing =
      cart.find(
        (item) =>
          item.id === product.id
      );

    if (existing) {

      setCart((prev) =>
        prev.map((item) =>
          item.id === product.id
            ? {
                ...item,
                qty:
                  item.qty + 1,
              }
            : item
        )
      );

      return;
    }

    setCart((prev) => [
      ...prev,
      {
        ...product,
        qty: 1,
      },
    ]);
  };

  const updateOrderStatus = (
    id
  ) => {

    setOrders((prev) =>
      prev.map((order) => {

        if (order.id !== id) {
          return order;
        }

        if (
          order.status ===
          "Pesanan Masuk"
        ) {

          return {
            ...order,
            status:
              "Sedang Disiapkan",
          };
        }

        if (
          order.status ===
          "Sedang Disiapkan"
        ) {

          return {
            ...order,
            status:
              "Sedang Diantar",
          };
        }

        if (
          order.status ===
          "Sedang Diantar"
        ) {

          return {
            ...order,
            status: "Selesai",
          };
        }

        return order;
      })
    );
  };

  const getButtonText = (
    status
  ) => {

    switch (status) {

      case "Pesanan Masuk":
        return "Terima Pesanan";

      case "Sedang Disiapkan":
        return "Antarkan";

      case "Sedang Diantar":
        return "Selesaikan";

      default:
        return null;

    }
  };

  const total =
    cart.reduce(
      (sum, item) =>
        sum +
        item.price *
          item.qty,
      0
    );

  const filteredProducts =
    products.filter(
      (product) =>
        product.name
          .toLowerCase()
          .includes(
            search.toLowerCase()
          )
    );

    const submitTransaction = () => {

  if (
    cart.length === 0
  ) {
    return;
  }

  const total =
    cart.reduce(
      (sum, item) =>
        sum +
        item.price *
          item.qty,
      0
    );

  const newOrder = {
    id:
      "#ORD" +
      Date.now(),

    customer:
      "Walk In Customer",

    total,

    items:
      cart.length,

    status:
      "Selesai",
  };

  setOrders(
    (prev) => [
      ...prev,
      newOrder,
    ]
  );

  setCart([]);

  alert(
    "Transaksi berhasil disimpan"
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
          Cashier
        </h1>

      </div>

      {/* Incoming Orders */}
      <div
        className="
          mt-6

          px-4
        "
      >

        <h2
          className="
            mb-3

            font-squadaOne
            text-[30px]

            text-[#6E822E]
          "
        >
          Pesanan Masuk
        </h2>

        <div
          className="
            flex
            flex-col
            gap-3
          "
        >

          {orders.map((order) => (

  <Link
    key={order.id}
    href={`/cashier/${order.id}`}
  >

    <div
      className="
        mb-4

        rounded-[20px]

        border-2
        border-[#D6D6D6]

        bg-white

        p-4

        transition-all
        duration-200

        hover:scale-[1.01]
      "
    >

      <div
        className="
          flex
          items-center
          justify-between
        "
      >

        <h3
          className="
            font-squadaOne
            text-[24px]

            text-[#6E822E]
          "
        >
          {order.id}
        </h3>

        <span
          className={`
            rounded-full

            px-3
            py-1

            text-xs
            font-semibold

            ${
              order.status ===
              "Selesai"
                ? "bg-green-100 text-green-700"
                : order.status ===
                  "Sedang Disiapkan"
                ? "bg-yellow-100 text-yellow-700"
                : "bg-blue-100 text-blue-700"
            }
          `}
        >
          {order.status}
        </span>

      </div>

      <p
        className="
          mt-2

          font-signika

          text-[#666]
        "
      >
        {order.customer}
      </p>

      <div
        className="
          mt-4

          flex
          items-center
          justify-between
        "
      >

        <span
          className="
            font-signika
            text-sm

            text-[#888]
          "
        >
          {order.items} item
        </span>

        <span
          className="
            font-squadaOne
            text-[22px]

            text-[#FF5C2B]
          "
        >
          Rp
          {order.total.toLocaleString(
            "id-ID"
          )}
        </span>

      </div>

    </div>

  </Link>

))}

        </div>

      </div>

      {/* Search Product */}
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
            text-[30px]

            text-[#6E822E]
          "
        >
          Kasir Manual
        </h2>

        <input
          type="text"

          placeholder="Cari produk..."

          value={search}

          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }

          className="
            w-full

            rounded-[18px]

            border-2
            border-[#D6D6D6]

            bg-white

            p-4

            outline-none
          "
        />

      </div>

      {/* Products */}
      <div
        className="
          mt-4

          px-4
        "
      >

        <div
          className="
            flex
            flex-col
            gap-3
          "
        >

          {filteredProducts.map(
            (product) => (

              <button
                key={product.id}

                onClick={() =>
                  addProduct(
                    product
                  )
                }

                className="
                  flex
                  items-center
                  justify-between

                  rounded-[18px]

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
                      text-[22px]

                      text-[#4B4B4B]
                    "
                  >
                    {
                      product.name
                    }
                  </h3>

                  <p
                    className="
                      text-[#FF5C2B]
                    "
                  >
                    Rp
                    {product.price.toLocaleString(
                      "id-ID"
                    )}
                  </p>

                </div>

                <div
                  className="
                    rounded-full

                    bg-[#B6D04E]

                    px-4
                    py-2

                    text-white
                  "
                >
                  +
                </div>

              </button>

            )
          )}

        </div>

      </div>

      {/* Cart */}
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
            text-[30px]

            text-[#6E822E]
          "
        >
          List Kasir
        </h2>

        <div
          className="
            rounded-3xl

            border-2
            border-[#D6D6D6]

            bg-[#F5F5F5]

            p-4
          "
        >

          {cart.length === 0 ? (

            <p
              className="
                text-center

                text-[#888]
              "
            >
              Belum ada produk
            </p>

          ) : (

            cart.map((item) => (

              <div
                key={item.id}

                className="
                  mb-3

                  flex
                  justify-between
                "
              >

                <span>
                  {item.name}
                  {" "}
                  x
                  {item.qty}
                </span>

                <span>
                  Rp
                  {(item.price *
                    item.qty)
                    .toLocaleString(
                      "id-ID"
                    )}
                </span>

              </div>

            ))

          )}

          <div
            className="
              mt-4

              border-t-2
              border-[#DDD]

              pt-4
            "
          >

            <div
              className="
                flex
                justify-between
              "
            >

              <h3
                className="
                  font-squadaOne
                  text-[28px]

                  text-[#FF5C2B]
                "
              >
                Total
              </h3>

              <h3
                className="
                  font-squadaOne
                  text-[28px]

                  text-[#FF5C2B]
                "
              >
                Rp
                {total.toLocaleString(
                  "id-ID"
                )}
              </h3>

            </div>

          </div>

        </div>

      </div>

      {/* Submit */}
      <div
        className="
          mt-6

          px-4
        "
      >
        <div className="
    flex
    justify-center
  ">
          <Button
  text="Submit Transaksi"

  onClick={
    submitTransaction
  }

  disabled={
    cart.length === 0
  }
/>
        </div>

      </div>

      <Navbar />

    </div>
  );
}