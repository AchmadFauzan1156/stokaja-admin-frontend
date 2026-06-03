"use client";

import { useState } from "react";

import Image from "next/image";

export default function ChatInput({
  onSend,
}) {

  const [message, setMessage] =
    useState("");

  /* ───────── Send Message ───────── */

  const handleSend = () => {

    if (!message.trim()) {
      return;
    }

    onSend(message);

    setMessage("");
  };

  return (
    <div
      className="
        fixed
        bottom-33.75
        left-0
        right-0
        z-50

        border-t-2
        border-[#DADADA]

        bg-[#F0E7D6]

        px-4
        pb-4
        pt-4
      "
    >

      <div
        className="
          flex
          items-end
          gap-3
        "
      >

        {/* Textarea */}
        <textarea
          value={message}

          onChange={(e) =>
            setMessage(
              e.target.value
            )
          }

          placeholder="Tulis pesan..."

          rows={1}

          className="
            min-h-14
            max-h-40
            flex-1

            resize-none

            rounded-[28px]

            border-2
            border-[#D0D0D0]

            bg-white

            px-5
            py-3.5

            outline-none

            font-signika
            text-[17px]
            text-[#444]
            leading-[1.3]

            placeholder:text-[#A5A5A5]
          "
        />

        {/* Send Button */}
        <button
          onClick={handleSend}

          className="
            flex
            h-14
            w-14

            shrink-0

            items-center
            justify-center

            rounded-full

            bg-[#B6D04E]
          "
        >

          <Image
            src="/Send.svg"
            alt="Send"

            width={25}
            height={25}

            className="pt-1"
          />

        </button>

      </div>

    </div>
  );
}