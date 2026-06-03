"use client";

import { useParams } from "next/navigation";
import ChatRoom from "@/components/ChatRoom";

export default function Page() {
  const { id } = useParams();
  return <ChatRoom userId={id} />;
}