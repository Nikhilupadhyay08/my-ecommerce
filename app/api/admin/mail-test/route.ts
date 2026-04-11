import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/authCookies";
import { getSmtpSettings } from "@/lib/siteSettings";
import { sendMailWithSettings } from "@/lib/mailer";

export async function POST(request: Request) {
  if (!(await requireAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { to?: string };
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const smtp = await getSmtpSettings();
  if (!smtp?.host || !smtp.from) {
    return NextResponse.json(
      { error: "Save SMTP host and From address first." },
      { status: 400 }
    );
  }

  const to =
    typeof body.to === "string" && body.to.includes("@")
      ? body.to.trim()
      : smtp.user || smtp.from;
  if (!to || !to.includes("@")) {
    return NextResponse.json(
      { error: "Provide a valid test recipient email in the form." },
      { status: 400 }
    );
  }

  try {
    await sendMailWithSettings(smtp, {
      to,
      subject: "Nikhil Store — SMTP test",
      html: "<p>This is a test email from your store admin panel.</p><p>If you received it, SMTP is configured correctly.</p>",
    });
    return NextResponse.json({ ok: true, to });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Send failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
