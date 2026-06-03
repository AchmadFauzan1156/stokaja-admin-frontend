"use client";

import { useState } from "react";

import { useRouter }
from "next/navigation";

import {
  useAdmin,
} from "@/context/AdminContext";

import Navbar from "@/components/Navbar";
import SearchBar from "@/components/SearchBar";

export default function ChatPage() {

  const router =
    useRouter();

  const [search, setSearch] =
    useState("");

  const {
  contacts,
} = useAdmin();

  const filteredContacts =
    contacts.filter((contact) =>
      contact.name
        .toLowerCase()
        .includes(
          search.toLowerCase()
        )
    );

  return (
    <div
      className="
        min-h-screen

        bg-[#F0E7D6]

        pb-40
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
          Chat
        </h1>

      </div>

      {/* Search */}
      <div
        className="
          mt-4
          flex
          justify-center
        "
      >

        <SearchBar
          value={search}
          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }
        />

      </div>

      {/* Contact List */}
      <div
        className="
          mt-5

          px-4

          flex
          flex-col
        "
      >

        {filteredContacts.map(
          (contact) => (

            <button
              key={contact.id}

              onClick={() =>
                router.push(
                  `/chat/${contact.id}`
                )
              }

              className="
                flex
                items-center
                gap-4

                border-b-2
                border-[#D9D9D9]

                py-5

                text-left
              "
            >

              {/* Avatar */}
              <div
                className="
                  flex
                  h-15
                  w-15

                  shrink-0

                  items-center
                  justify-center

                  rounded-full

                  bg-[#D9D9D9]
                "
              >

                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="white"

                  className="
                    h-8
                    w-8
                  "
                >
                  <path d="M12 12a5 5 0 100-10 5 5 0 000 10zm0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5z"/>
                </svg>

              </div>

              {/* Info */}
              <div
                className="
                  flex-1
                  overflow-hidden
                "
              >

                <h2
                  className="
                    truncate

                    font-signika
                    text-[20px]
                    font-semibold

                    text-[#6E822E]
                  "
                >
                  {contact.name}
                </h2>

                <p
                  className="
                    mt-1

                    truncate

                    font-signika
                    text-[16px]

                    text-[#888]
                  "
                >
                  {contact.lastMessage}
                </p>

              </div>

              {/* Unread Badge */}
              {contact.unread > 0 && (

                <div
                  className="
                    flex
                    h-7
                    w-7

                    items-center
                    justify-center

                    rounded-full

                    bg-[#6E822E]

                    font-signika
                    text-sm
                    font-bold

                    text-white
                  "
                >
                  {contact.unread}
                </div>

              )}

            </button>

          )
        )}

      </div>

      <Navbar />

    </div>
  );
}