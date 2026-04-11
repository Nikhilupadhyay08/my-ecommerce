"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Step = "details" | "otp";

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("details");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const sendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/send-register-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Could not send code");
        setLoading(false);
        return;
      }
      setOtp("");
      setStep("otp");
    } catch {
      setError("Network error");
    }
    setLoading(false);
  };

  const verifyAndCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Verification failed");
        setLoading(false);
        return;
      }
      router.replace("/");
      router.refresh();
    } catch {
      setError("Network error");
    }
    setLoading(false);
  };

  const resendOtp = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/send-register-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Resend failed");
      }
    } catch {
      setError("Network error");
    }
    setLoading(false);
  };

  return (
    <main className="mx-auto flex min-h-0 flex-1 max-w-md flex-col justify-center px-4 py-16">
      <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">
          Create account
        </h1>
        {step === "details" ? (
          <>
            <p className="mt-2 text-sm text-gray-600">
              We will email a 6-digit code to verify your address. SMTP must be
              configured by the store admin.
            </p>
            <form className="mt-8 flex flex-col gap-4" onSubmit={sendOtp}>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Name
                </label>
                <input
                  type="text"
                  required
                  minLength={2}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none ring-blue-500/20 focus:border-blue-500 focus:ring-4"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Email
                </label>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none ring-blue-500/20 focus:border-blue-500 focus:ring-4"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Password (min 6 characters)
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none ring-blue-500/20 focus:border-blue-500 focus:ring-4"
                />
              </div>
              {error && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-gray-900 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:opacity-60"
              >
                {loading ? "Sending…" : "Send verification code"}
              </button>
            </form>
          </>
        ) : (
          <>
            <p className="mt-2 text-sm text-gray-600">
              Enter the 6-digit code sent to{" "}
              <span className="font-semibold text-gray-900">{email}</span>.
            </p>
            <form className="mt-8 flex flex-col gap-4" onSubmit={verifyAndCreate}>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Verification code
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="\d{6}"
                  maxLength={6}
                  required
                  autoComplete="one-time-code"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) =>
                    setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-center font-mono text-xl tracking-[0.3em] outline-none ring-blue-500/20 focus:border-blue-500 focus:ring-4"
                />
              </div>
              {error && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="rounded-xl bg-gray-900 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:opacity-60"
              >
                {loading ? "Verifying…" : "Verify and create account"}
              </button>
            </form>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm">
              <button
                type="button"
                disabled={loading}
                onClick={() => {
                  setStep("details");
                  setError(null);
                }}
                className="font-medium text-gray-600 underline-offset-2 hover:text-gray-900 hover:underline"
              >
                ← Edit details
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={resendOtp}
                className="font-medium text-blue-600 hover:underline"
              >
                Resend code
              </button>
            </div>
          </>
        )}

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-blue-600 hover:underline">
            Sign in
          </Link>
        </p>
        <Link
          href="/"
          className="mt-4 inline-block text-sm text-gray-600 underline-offset-4 hover:text-blue-600 hover:underline"
        >
          ← Back to store
        </Link>
      </div>
    </main>
  );
}
