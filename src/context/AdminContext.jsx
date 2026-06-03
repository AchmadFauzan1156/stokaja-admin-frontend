"use client";

import {
  createContext,
  useContext,
  useState,
} from "react";

const AdminContext =
  createContext();

export function AdminProvider({
  children,
}) {

  /* ───────── Products ───────── */

  const [
    products,
    setProducts,
  ] = useState([
    {
      id: 1,

      name: "Indomie Goreng",

      qty: "1 pcs",

      category: "Sembako",

      stock: 3,

      price: 3500,

      image:
        "/products/indomie.jpg",
    },

    {
      id: 2,

      name: "Aqua 600ml",

      qty: "600 ml",

      category: "Minuman",

      stock: 20,

      price: 4000,

      image:
        "/products/aqua.jpg",
    },

    {
      id: 3,

      name: "Chitato",

      qty: "68 gr",

      category: "Snack",

      stock: 5,

      price: 12000,

      image:
        "/products/chitato.jpg",
    },
  ]);

  /* ───────── Orders ───────── */

  const [
    orders,
    setOrders,
  ] = useState([
    {
      id: "#ORD001",

      customer:
        "Budi Santoso",

      total: 45000,

      items: 3,

      status:
        "Pesanan Masuk",
    },

    {
      id: "#ORD002",

      customer:
        "Siti Aisyah",

      total: 78000,

      items: 5,

      status:
        "Sedang Disiapkan",
    },

    {
      id: "#ORD003",

      customer:
        "Andi Wijaya",

      total: 125000,

      items: 7,

      status: "Selesai",
    },
  ]);

  /* ───────── Contacts ───────── */

  const [
    contacts,
    setContacts,
  ] = useState([
    {
      id: 1,

      name:
        "Budi Santoso",

      unread: 2,
    },

    {
      id: 2,

      name:
        "Siti Aisyah",

      unread: 0,
    },

    {
      id: 3,

      name:
        "Andi Wijaya",

      unread: 5,
    },
  ]);

  /* ───────── Dashboard Stats ───────── */

  const lowStockProducts =
    products.filter(
      (product) =>
        product.stock > 0 &&
        product.stock <= 5
    ).length;

  const outOfStockProducts =
    products.filter(
      (product) =>
        product.stock === 0
    ).length;

  const incomingOrders =
    orders.filter(
      (order) =>
        order.status ===
        "Pesanan Masuk"
    ).length;

  const activeOrders =
    orders.filter(
      (order) =>
        order.status !==
        "Selesai"
    ).length;

  const revenue =
    orders
      .filter(
        (order) =>
          order.status ===
          "Selesai"
      )
      .reduce(
        (sum, order) =>
          sum + order.total,
        0
      );

  const unreadMessages =
    contacts.reduce(
      (sum, contact) =>
        sum +
        contact.unread,
      0
    );

  return (
    <AdminContext.Provider
      value={{
        /* products */
        products,
        setProducts,

        /* orders */
        orders,
        setOrders,

        /* contacts */
        contacts,
        setContacts,

        /* dashboard */
        lowStockProducts,

        outOfStockProducts,

        incomingOrders,

        activeOrders,

        revenue,

        unreadMessages,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {

  const context =
    useContext(
      AdminContext
    );

  if (!context) {

    throw new Error(
      "useAdmin must be used inside AdminProvider"
    );
  }

  return context;
}