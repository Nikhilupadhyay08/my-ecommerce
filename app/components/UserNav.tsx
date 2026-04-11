"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type Me = { id: string; email: string; name: string };

export function UserNav() {
  const pathname = usePathname();
  const [user, setUser] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (!cancelled) setUser(data.user ?? null);
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    if (pathname?.startsWith("/checkout")) {
      window.location.href = "/login?from=/checkout";
    }
  };

  if (pathname?.startsWith("/admin")) return null;

  return (
    <div className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-end gap-2 px-4 py-2 text-sm sm:px-6 lg:px-8">
        {loading ? (
          <span className="text-gray-400">…</span>
        ) : user ? (
          <>
            <span className="mr-auto truncate text-gray-600 sm:mr-0">
              Hi,{" "}
              <span className="font-semibold text-gray-900">
                {user.name || user.email}
              </span>
            </span>
            <button
              type="button"
              onClick={logout}
              className="rounded-lg px-3 py-1.5 font-medium text-gray-700 transition hover:bg-gray-100"
            >
              Sign out
            </button>
          </>
        ) : (
          <>
            <Link
              href="/login"
              className="rounded-lg px-3 py-1.5 font-medium text-gray-700 transition hover:bg-gray-100"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-blue-600 px-3 py-1.5 font-medium text-white transition hover:bg-blue-700"
            >
              Create account
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
