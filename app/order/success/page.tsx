"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function SuccessBody() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  return (
    <main className="mx-auto flex max-w-lg flex-1 flex-col items-center justify-center px-4 py-16 text-center">
      <div className="rounded-2xl border border-green-200 bg-green-50 px-8 py-10 shadow-sm">
        <p className="text-4xl" aria-hidden>
          ✓
        </p>
        <h1 className="mt-4 text-2xl font-extrabold text-gray-900">
          Order placed
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Thank you! You will receive a confirmation email if SMTP is set up
          in the admin panel.
        </p>
        {id && (
          <p className="mt-4 font-mono text-sm text-gray-800">
            Order ID: <strong>{id}</strong>
          </p>
        )}
        <Link
          href="/"
          className="mt-8 inline-flex rounded-xl bg-gray-900 px-6 py-3 text-sm font-semibold text-white hover:bg-gray-800"
        >
          Back to store
        </Link>
      </div>
    </main>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center p-8 text-gray-500">
          Loading…
        </div>
      }
    >
      <SuccessBody />
    </Suspense>
  );
}
