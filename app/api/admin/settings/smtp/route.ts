import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/authCookies";
import { getSmtpSettings, saveSmtpSettings } from "@/lib/siteSettings";

export async function GET() {
  if (!(await requireAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const s = await getSmtpSettings();
  if (!s) {
    return NextResponse.json({
      settings: {
        host: "",
        port: 587,
        secure: false,
        user: "",
        from: "",
        fromName: "Nikhil Store",
        hasPassword: false,
      },
    });
  }

  return NextResponse.json({
    settings: {
      host: s.host,
      port: s.port,
      secure: s.secure,
      user: s.user,
      from: s.from,
      fromName: s.fromName,
      hasPassword: Boolean(s.pass),
    },
  });
}

export async function PUT(request: Request) {
  if (!(await requireAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Partial<{
    host: string;
    port: number;
    secure: boolean;
    user: string;
    pass: string;
    from: string;
    fromName: string;
  }>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    await saveSmtpSettings({
      host: typeof body.host === "string" ? body.host : undefined,
      port: typeof body.port === "number" ? body.port : undefined,
      secure: typeof body.secure === "boolean" ? body.secure : undefined,
      user: typeof body.user === "string" ? body.user : undefined,
      pass: typeof body.pass === "string" ? body.pass : undefined,
      from: typeof body.from === "string" ? body.from : undefined,
      fromName: typeof body.fromName === "string" ? body.fromName : undefined,
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Could not save settings. Is MongoDB configured?" },
      { status: 500 }
    );
  }
}
