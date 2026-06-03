"use client";

import { useState } from "react";

import Navbar from "@/components/Navbar";

import {
  useAdmin,
} from "@/context/AdminContext";

export default function StockPage() {

  const {
  products,
  setProducts,
} = useAdmin();

  const [showModal, setShowModal] =
    useState(false);

  const [editingId, setEditingId] =
    useState(null);

  const [name, setName] =
    useState("");

  const [category, setCategory] =
    useState("Sembako");

  const [stock, setStock] =
    useState("");

  const [price, setPrice] =
    useState("");

  const [qty, setQty] =
  useState("");

  const [image, setImage] =
  useState("");

  const getCategoryStyle = (
  category
) => {

  switch (category) {

    case "Sembako":
      return "bg-[#fff7e6] text-[#a05f00]";

    case "Minuman":
      return "bg-[#e8f4e8] text-[#2d6e22]";

    case "Snack":
      return "bg-[#feeaea] text-[#b52a2a]";

    case "Kebersihan":
      return "bg-[#f0eaff] text-[#6030b0]";

    case "Perawatan":
      return "bg-[#e6f2ff] text-[#1a5fa0]";

    case "Obat":
      return "bg-[#fff0f6] text-[#a0306a]";

    default:
      return "bg-[#eeeeee] text-[#555555]";
  }
};

  const resetForm = () => {

    setEditingId(null);

    setName("");

    setQty("");

    setCategory("Sembako");

    setStock("");

    setPrice("");

    setImage("");
  };

  const openAddModal = () => {

  resetForm();

  setEditingId(null);

  setName("");

  setQty("");

  setCategory(
    "Sembako"
  );

  setStock("");

  setPrice("");

  setImage("");

  setShowModal(true);
  };

  const openEditModal = (
  product
) => {

  setEditingId(
    product.id
  );

  setName(
    product.name || ""
  );

  setQty(
    product.qty || ""
  );

  setCategory(
    product.category || "Sembako"
  );

  setStock(
    product.stock || ""
  );

  setPrice(
    product.price || ""
  );

  setImage(
    product.image || ""
  );

  setShowModal(true);
};

  const saveProduct = () => {

    if (
      !name ||
      !stock ||
      !price
    ) {
      return;
    }

    if (editingId) {

      setProducts((prev) =>
        prev.map((item) =>
          item.id === editingId
            ? {
                ...item,
                name,
                qty,
                category,
                stock:
                  Number(stock),
                price:
                  Number(price),
                image,
              }
            : item
        )
      );

    } else {

      setProducts((prev) => [
        ...prev,

        {
          id: Date.now(),

          name,

          qty,

          category,

          stock:
            Number(stock),

          price:
            Number(price),

          image,
        },
      ]);

    }

    setShowModal(false);

    resetForm();
  };

  const deleteProduct = (
    id
  ) => {

    setProducts((prev) =>
      prev.filter(
        (item) =>
          item.id !== id
      )
    );
  };

  const increaseStock = (
    id
  ) => {

    setProducts((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              stock:
                item.stock + 1,
            }
          : item
      )
    );
  };

  const decreaseStock = (
    id
  ) => {

    setProducts((prev) =>
      prev.map((item) =>
        item.id === id &&
        item.stock > 0
          ? {
              ...item,
              stock:
                item.stock - 1,
            }
          : item
      )
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

        <div
          className="
            flex
            items-center
            justify-between
          "
        >

          <h1
            className="
              font-squadaOne
              text-[40px]

              text-[#6E822E]
            "
          >
            Stock
          </h1>

          <button
            onClick={
              openAddModal
            }

            className="
              rounded-xl

              bg-[#6E822E]

              px-4
              py-2

              font-signika
              font-semibold

              text-white
            "
          >
            + Tambah
          </button>

        </div>

      </div>

      {/* Product List */}
      <div
        className="
          mt-6

          px-4
        "
      >

        <div
          className="
            flex
            flex-col
            gap-4
          "
        >

          {products.map(
            (product) => {

              const lowStock =
                product.stock <= 5;

              return (

                <div
                  key={product.id}

                  className={`
                    rounded-3xl

                    border-2

                    bg-[#F5F5F5]

                    p-4

                    ${
                      lowStock
                        ? "border-red-400"
                        : "border-[#D6D6D6]"
                    }
                  `}
                >

                  <div
                    className="
                      flex
                      justify-between
                    "
                  >

                    <div>
                      {product.image && (

                        <img
                          src={product.image}
                          alt={product.name}

                          className="
                            mb-3

                            h-32
                            w-full

                            rounded-xl

                            object-cover
                          "
                        />

                      )}
                      <h2
                        className="
                          font-squadaOne
                          text-[26px]

                          text-[#4B4B4B]
                        "
                      >
                        {product.name}
                      </h2>

                      <div
                        className={`
                          mt-2

                          inline-flex

                          rounded-full

                          px-3
                          py-1

                          font-signika
                          text-sm
                          font-medium

                          ${getCategoryStyle(
                            product.category
                          )}
                        `}
                      >
                        {product.category}
                      </div>

                    </div>

                    {lowStock && (

                      <span
                        className="
                          h-fit

                          rounded-full

                          bg-red-100

                          px-3
                          py-1

                          text-sm
                          font-semibold

                          text-red-600
                        "
                      >
                        Stok Menipis
                      </span>

                    )}

                  </div>

                  <div
                    className="
                      mt-4

                      flex
                      justify-between
                    "
                  >

                    <div>

                      <p
                        className="
                          font-signika
                        "
                      >
                        Stok:
                        {" "}
                        {product.stock}
                      </p>

                      <p
                        className="
                          font-signika

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
                        flex
                        flex-wrap
                        gap-2

                        justify-end
                      "
                    >

                      <button
                        onClick={() =>
                          decreaseStock(
                            product.id
                          )
                        }

                        className="
                          rounded-lg

                          bg-[#E5E5E5]

                          px-3
                          py-2
                        "
                      >
                        -
                      </button>

                      <button
                        onClick={() =>
                          increaseStock(
                            product.id
                          )
                        }

                        className="
                          rounded-lg

                          bg-[#B6D04E]

                          px-3
                          py-2

                          text-white
                        "
                      >
                        +
                      </button>

                      <button
                        onClick={() =>
                          openEditModal(
                            product
                          )
                        }

                        className="
                          rounded-lg

                          bg-[#6E822E]

                          px-3
                          py-2

                          text-white
                        "
                      >
                        Edit
                      </button>

                      <button
                        onClick={() =>
                          deleteProduct(
                            product.id
                          )
                        }

                        className="
                          rounded-lg

                          bg-red-500

                          px-3
                          py-2

                          text-white
                        "
                      >
                        Hapus
                      </button>

                    </div>

                  </div>

                </div>

              );
            }
          )}

        </div>

      </div>

      {/* Modal */}
      {showModal && (

        <div
          className="
            fixed
            inset-0
            z-50

            flex
            items-center
            justify-center

            bg-black/40
          "
        >

          <div
            className="
              w-[90%]
              max-w-md

              rounded-3xl

              bg-white

              p-6
            "
          >

            <h2
              className="
                mb-4

                font-squadaOne
                text-[30px]

                text-[#6E822E]
              "
            >
              {editingId
                ? "Edit Produk"
                : "Tambah Produk"}
            </h2>

            <div
              className="
                flex
                flex-col
                gap-3
              "
            >

              <input
                type="text"
                placeholder="Nama Produk"
                value={name}
                onChange={(e) =>
                  setName(
                    e.target.value
                  )
                }
                className="
                  rounded-xl
                  border
                  border-[#D6D6D6]
                  p-3
                "
              />

              <input
              type="text"

              placeholder="Qty (contoh: 1 pcs)"

              value={qty}

              onChange={(e) =>
                setQty(
                  e.target.value
                )
              }

              className="
                rounded-xl
                border
                border-[#D6D6D6]
                p-3
              "
            />

              <select
                value={category}
                onChange={(e) =>
                  setCategory(
                    e.target.value
                  )
                }
                className="
                  rounded-xl
                  border
                  border-[#D6D6D6]
                  p-3
                "
              >
                <option>Sembako</option>
                <option>Minuman</option>
                <option>Snack</option>
                <option>Kebersihan</option>
                <option>Perawatan</option>
                <option>Obat</option>
              </select>

              <input
                type="number"
                placeholder="Stok"
                value={stock}
                onChange={(e) =>
                  setStock(
                    e.target.value
                  )
                }
                className="
                  rounded-xl
                  border
                  border-[#D6D6D6]
                  p-3
                "
              />

              <input
                type="number"
                placeholder="Harga"
                value={price}
                onChange={(e) =>
                  setPrice(
                    e.target.value
                  )
                }
                className="
                  rounded-xl
                  border
                  border-[#D6D6D6]
                  p-3
                "
              />
<input
  type="file"

  accept="image/*"

  onChange={(e) => {

    const file =
      e.target.files?.[0];

    if (!file) return;

    const preview =
      URL.createObjectURL(
        file
      );

    setImage(
      preview
    );
  }}

  className="
    rounded-xl
    border
    border-[#D6D6D6]
    p-3
  "
/>

{image && (

  <img
    src={image}
    alt="Preview"

    className="
      h-40
      w-full

      rounded-xl

      object-cover
    "
  />

)}

            </div>

            <div
              className="
                mt-6

                flex
                gap-3
              "
            >

              <button
                onClick={() =>
                  setShowModal(
                    false
                  )
                }

                className="
                  flex-1

                  rounded-xl

                  bg-gray-300

                  py-3
                "
              >
                Batal
              </button>

              <button
                onClick={
                  saveProduct
                }

                className="
                  flex-1

                  rounded-xl

                  bg-[#6E822E]

                  py-3

                  text-white
                "
              >
                Simpan
              </button>

            </div>

          </div>

        </div>

      )}

      <Navbar />

    </div>
  );
}