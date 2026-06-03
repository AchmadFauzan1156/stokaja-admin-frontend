"use client";

import { useState } from "react";

import Navbar from "@/components/Navbar";

import ChatHeader from "@/components/ChatHeader";
import ChatBubble from "@/components/ChatBubble";
import ChatInput from "@/components/ChatInput";
import ChatDate from "@/components/ChatDate";

import { dummyChats }
from "@/data/dummyChats";

export default function ChatRoom() {

  const [chats, setChats] =
    useState(dummyChats);

  /* ───────── Send Message ───────── */

  const handleSend = (
    message
  ) => {

    const now =
      new Date();

    const newChat = {
      id: Date.now(),

      sender: "user",

      message,

      time:
        now.toLocaleTimeString(
          "id-ID",
          {
            hour: "2-digit",
            minute: "2-digit",
          }
        ),

      date:
        now
          .toISOString()
          .split("T")[0],
    };

    setChats((prev) => [
      ...prev,
      newChat,
    ]);
  };

  return (
    <div
      className="
        h-screen
        overflow-hidden

        bg-[#F6F3EA]
      "
    >

      {/* ───────── Header ───────── */}
      <ChatHeader />

      {/* ───────── Chat Area ───────── */}
      <div
        className="
          h-full
          overflow-y-auto

          px-4

          pt-32
          pb-72
        "
      >

        <div
          className="
            flex
            flex-col
            gap-4
          "
        >

          {chats.map(
            (
              chat,
              index
            ) => {

              const showDate =
                index === 0 ||

                chats[
                  index - 1
                ].date !==
                  chat.date;

              return (
                <div
                  key={chat.id}
                >

                  {/* Date Separator */}
                  {showDate && (
                    <ChatDate
                      date={
                        chat.date
                      }
                    />
                  )}

                  {/* Chat Bubble */}
                  <ChatBubble
                    sender={
                      chat.sender
                    }

                    message={
                      chat.message
                    }

                    time={
                      chat.time
                    }
                  />

                </div>
              );
            }
          )}

        </div>

      </div>

      {/* ───────── Chat Input ───────── */}
      <ChatInput
        onSend={handleSend}
      />

      {/* ───────── Navbar ───────── */}
      <Navbar />

    </div>
  );
}