"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type SmtpForm = {
  host: string;
  port: string;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
  fromName: string;
};

const emptyForm = (): SmtpForm => ({
  host: "",
  port: "587",
  secure: false,
  user: "",
  pass: "",
  from: "",
  fromName: "Nikhil Store",
});

export default function AdminEmailPage() {
  const router = useRouter();
  const [form, setForm] = useState<SmtpForm>(emptyForm);
  const [hasPassword, setHasPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testTo, setTestTo] = useState("");
  const [testMsg, setTestMsg] = useState<string | null>(null);
  const [testLoading, setTestLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings/smtp");
      if (res.status === 401) {
        router.replace("/admin/login?from=/admin/email");
        return;
      }
      const data = await res.json();
      const s = data.settings;
      if (s) {
        setForm({
          host: s.host || "",
          port: String(s.port ?? 587),
          secure: Boolean(s.secure),
          user: s.user || "",
          pass: "",
          from: s.from || "",
          fromName: s.fromName || "Nikhil Store",
        });
        setHasPassword(Boolean(s.hasPassword));
      }
    } catch {
      /* ignore */
    }
    setLoading(false);
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        host: form.host.trim(),
        port: parseInt(form.port, 10) || 587,
        secure: form.secure,
        user: form.user.trim(),
        from: form.from.trim(),
        fromName: form.fromName.trim(),
      };
      if (form.pass.trim()) body.pass = form.pass;
      const res = await fetch("/api/admin/settings/smtp", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.status === 401) {
        router.replace("/admin/login?from=/admin/email");
        return;
      }
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        alert(typeof d.error === "string" ? d.error : "Save failed");
        setSaving(false);
        return;
      }
      setForm((f) => ({ ...f, pass: "" }));
      await load();
      alert("SMTP settings saved.");
    } catch {
      alert("Save failed");
    }
    setSaving(false);
  };

  const sendTest = async () => {
    setTestMsg(null);
    setTestLoading(true);
    try {
      const res = await fetch("/api/admin/mail-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: testTo.trim() || undefined }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setTestMsg(typeof data.error === "string" ? data.error : "Test failed");
      } else {
        setTestMsg(`Test email sent to ${data.to}.`);
      }
    } catch {
      setTestMsg("Network error");
    }
    setTestLoading(false);
  };

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center p-12 text-gray-500">
        Loading…
      </div>
    );
  }

  return (
    <main className="mx-auto min-h-0 flex-1 max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">
            Email & SMTP
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Configure outgoing mail for order confirmations and send a test
            message.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin"
            className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
          >
            ← Products
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center justify-center rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-800"
          >
            Sign out
          </button>
        </div>
      </div>

      <form
        onSubmit={save}
        className="space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8"
      >
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500">
            SMTP host
          </label>
          <input
            required
            value={form.host}
            onChange={(e) => setForm({ ...form, host: e.target.value })}
            placeholder="smtp.gmail.com"
            className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none ring-blue-500/20 focus:border-blue-500 focus:ring-4"
          />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500">
              Port
            </label>
            <input
              type="number"
              value={form.port}
              onChange={(e) => setForm({ ...form, port: e.target.value })}
              className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none ring-blue-500/20 focus:border-blue-500 focus:ring-4"
            />
          </div>
          <div className="flex items-end pb-2">
            <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-800">
              <input
                type="checkbox"
                checked={form.secure}
                onChange={(e) =>
                  setForm({ ...form, secure: e.target.checked })
                }
                className="h-4 w-4 rounded border-gray-300"
              />
              Use TLS (secure)
            </label>
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500">
            SMTP username
          </label>
          <input
            value={form.user}
            onChange={(e) => setForm({ ...form, user: e.target.value })}
            className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none ring-blue-500/20 focus:border-blue-500 focus:ring-4"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500">
            SMTP password
          </label>
          <input
            type="password"
            value={form.pass}
            onChange={(e) => setForm({ ...form, pass: e.target.value })}
            placeholder={
              hasPassword ? "Leave blank to keep existing password" : ""
            }
            className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none ring-blue-500/20 focus:border-blue-500 focus:ring-4"
          />
          {hasPassword && (
            <p className="mt-1 text-xs text-gray-500">
              A password is already stored. Enter a new value only to replace it.
            </p>
          )}
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500">
            From email
          </label>
          <input
            type="email"
            required
            value={form.from}
            onChange={(e) => setForm({ ...form, from: e.target.value })}
            className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none ring-blue-500/20 focus:border-blue-500 focus:ring-4"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500">
            From name
          </label>
          <input
            value={form.fromName}
            onChange={(e) => setForm({ ...form, fromName: e.target.value })}
            className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none ring-blue-500/20 focus:border-blue-500 focus:ring-4"
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-xl bg-gray-900 py-3 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save SMTP settings"}
        </button>
      </form>

      <section className="mt-10 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-lg font-bold text-gray-900">Send test email</h2>
        <p className="mt-1 text-sm text-gray-600">
          Saves are not required for a test if settings were already saved. If
          recipient is empty, the SMTP username (or From address) is used.
        </p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input
            type="email"
            value={testTo}
            onChange={(e) => setTestTo(e.target.value)}
            placeholder="you@example.com"
            className="flex-1 rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none ring-blue-500/20 focus:border-blue-500 focus:ring-4"
          />
          <button
            type="button"
            disabled={testLoading}
            onClick={sendTest}
            className="rounded-xl border border-blue-600 bg-blue-50 px-5 py-2.5 text-sm font-semibold text-blue-800 hover:bg-blue-100 disabled:opacity-60"
          >
            {testLoading ? "Sending…" : "Send test"}
          </button>
        </div>
        {testMsg && (
          <p className="mt-3 text-sm text-gray-700">{testMsg}</p>
        )}
      </section>
    </main>
  );
}
