"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Kind = "success" | "error";

/**
 * The toast pattern (state + 3s timeout + fixed-position pill) was copy-pasted
 * into ten admin panels, each leaking its timeout on unmount. One hook, one
 * renderer — same visual output as the originals.
 */
export function useToast() {
  const [toast, setToast] = useState<{ msg: string; kind: Kind } | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((msg: string, kind: Kind = "success") => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast({ msg, kind });
    timerRef.current = setTimeout(() => setToast(null), 3000);
  }, []);

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  const Toast = useCallback(
    () =>
      toast ? (
        <div
          role="status"
          aria-live="polite"
          className={`fixed right-4 top-4 z-[999] rounded-[8px] px-4 py-3 text-[12px] font-medium text-white shadow-lg ${
            toast.kind === "success" ? "bg-[#16A34A]" : "bg-[#EF4444]"
          }`}
        >
          {toast.msg}
        </div>
      ) : null,
    [toast],
  );

  return { toast, showToast, Toast };
}

export default useToast;
