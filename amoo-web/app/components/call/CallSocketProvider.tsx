"use client";

import { useEffect } from "react";
import { socket } from "@/lib/socket";

type Props = {
  role: "user" | "expert";
  id: number;
};

export default function CallSocketProvider({
  role,
  id,
}: Props) {
  useEffect(() => {
    if (!id) return;

    socket.connect();

    if (role === "user") {
      socket.emit("join:user", id);
    }

    if (role === "expert") {
      socket.emit("join:expert", id);
    }

    return () => {
      socket.disconnect();
    };
  }, [role, id]);

  return null;
}