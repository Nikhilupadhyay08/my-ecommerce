"use client";

import { usePathname } from "next/navigation";

export function ScrollShortcuts() {
  const pathname = usePathname();
  if (
    pathname?.startsWith("/admin/login") ||
    pathname === "/login" ||
    pathname === "/register"
  ) {
    return null;
  }

  const scrollTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollFooter = () => {
    document.getElementById("store-footer")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div
      className="pointer-events-none fixed bottom-4 right-4 z-[60] flex flex-col gap-2 sm:bottom-6 sm:right-6"
      aria-label="Page navigation shortcuts"
    >
      <div className="pointer-events-auto flex flex-col gap-2 rounded-2xl border border-gray-200 bg-white/95 p-2 shadow-lg backdrop-blur-sm">
        <button
          type="button"
          onClick={scrollTop}
          className="rounded-xl bg-gray-900 px-3 py-2 text-xs font-semibold text-white shadow transition hover:bg-gray-800 sm:text-sm"
        >
          ↑ Top
        </button>
        <button
          type="button"
          onClick={scrollFooter}
          className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-800 shadow-sm transition hover:bg-gray-50 sm:text-sm"
        >
          ↓ Footer
        </button>
      </div>
    </div>
  );
}
