"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";

export default function ChatUnreadBadge({ refreshKey = 0 }: { refreshKey?: number }) {
  const [count, setCount] = useState(0);
  const genRef = useRef(0);

  const fetch_ = useCallback(() => {
    const gen = ++genRef.current;
    api.chat
      .getUnreadCount()
      .then((res: unknown) => {
        if (gen !== genRef.current) return;
        const data = res as { count?: number };
        setCount(data?.count ?? 0);
      })
      .catch(() => {
        if (gen !== genRef.current) return;
      });
  }, []);

  useEffect(() => {
    fetch_();
    const gen = genRef;
    return () => {
      gen.current++;
    };
  }, [refreshKey, fetch_]);

  if (count <= 0) return null;

  return (
    <span className="ml-auto flex h-5 min-w-[20px] shrink-0 items-center justify-center rounded-full bg-[#e9b85c] px-1.5 text-[10px] font-bold text-[#2a1148]">
      {count > 99 ? "99+" : count}
    </span>
  );
}
