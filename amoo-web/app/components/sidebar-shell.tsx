"use client";

import { useSyncExternalStore, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

/**
 * Shared dashboard sidebar drawer.
 *
 * The admin & user dashboards each render a `Sidebar` and a `Topbar` as
 * separate siblings inside their `page.tsx`. To let the Topbar's hamburger
 * toggle the Sidebar drawer without threading a provider through 23 pages,
 * open/close state lives in a tiny module-level external store that both
 * components subscribe to via `useSyncExternalStore` (SSR-safe: the drawer
 * always renders closed on the server, avoiding hydration mismatches).
 *
 * Below `lg` the sidebar is an off-canvas drawer; at `lg` and up it returns
 * to the original static, in-flow, sticky column — no layout change.
 */

let isOpen = false;
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

const store = {
  toggle() {
    isOpen = !isOpen;
    emit();
  },
  close() {
    if (!isOpen) return;
    isOpen = false;
    emit();
  },
  getSnapshot: () => isOpen,
  getServerSnapshot: () => false,
  subscribe(l: () => void) {
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  },
};

function useSidebarOpen() {
  return useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot,
  );
}

/** Hamburger button — drop into a Topbar. Hidden at `lg` (sidebar is static there). */
export function SidebarToggleButton({ className }: { className?: string }) {
  return (
    <button
      type="button"
      aria-label="Open navigation menu"
      onClick={() => store.toggle()}
      className={
        className ??
        "flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] border border-[#ece4f6] bg-[#f8f5fc] text-[#3d1a63] lg:hidden"
      }
    >
      <Menu className="h-[19px] w-[19px]" strokeWidth={2} />
    </button>
  );
}

/**
 * Wraps a dashboard sidebar's inner content. Pass the section's visual classes
 * (background gradient, etc.) via `className`; layout/position/drawer behavior
 * is supplied here. Optional `width` overrides the default `w-[232px]`.
 */
export function SidebarShell({
  className = "",
  width = "w-[232px]",
  children,
}: {
  className?: string;
  width?: string;
  children: React.ReactNode;
}) {
  const open = useSidebarOpen();
  const pathname = usePathname();

  // Close the drawer whenever the route changes (nav link tapped).
  useEffect(() => {
    store.close();
  }, [pathname]);

  // While open on mobile: lock body scroll and allow Escape to close.
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") store.close();
    }
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  return (
    <>
      {/* Backdrop — mobile only */}
      <div
        aria-hidden
        onClick={() => store.close()}
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-screen ${width} shrink-0 flex-col overflow-y-auto transition-transform duration-300 ease-out lg:sticky lg:top-0 lg:z-30 lg:translate-x-0 lg:transition-none ${
          open ? "translate-x-0" : "-translate-x-full"
        } ${className}`}
      >
        {children}
      </aside>
    </>
  );
}
