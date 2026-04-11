import getMongoClient from "@/lib/mongodb";

export const SMTP_SETTINGS_ID = "app_smtp" as const;

export type SmtpSettings = {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
  fromName: string;
};

type SmtpDoc = SmtpSettings & { _id: string; updatedAt?: Date };

export async function getSmtpSettings(): Promise<SmtpSettings | null> {
  try {
    const client = await getMongoClient();
    const db = client.db("myStore");
    const doc = (await db
      .collection("settings")
      .findOne({ _id: SMTP_SETTINGS_ID })) as SmtpDoc | null;
    if (!doc || !doc.host) return null;
    return {
      host: doc.host,
      port: Number(doc.port) || 587,
      secure: Boolean(doc.secure),
      user: doc.user || "",
      pass: doc.pass || "",
      from: doc.from || "",
      fromName: doc.fromName || "Nikhil Store",
    };
  } catch {
    return null;
  }
}

export async function saveSmtpSettings(
  partial: Partial<SmtpSettings> & { pass?: string }
): Promise<void> {
  const client = await getMongoClient();
  const db = client.db("myStore");
  const existing = (await db
    .collection("settings")
    .findOne({ _id: SMTP_SETTINGS_ID })) as SmtpDoc | null;

  const next: Record<string, unknown> = {
    _id: SMTP_SETTINGS_ID,
    host: partial.host ?? existing?.host ?? "",
    port: partial.port ?? existing?.port ?? 587,
    secure: partial.secure ?? existing?.secure ?? false,
    user: partial.user ?? existing?.user ?? "",
    from: partial.from ?? existing?.from ?? "",
    fromName: partial.fromName ?? existing?.fromName ?? "Nikhil Store",
    updatedAt: new Date(),
  };

  if (partial.pass != null && partial.pass !== "") {
    next.pass = partial.pass;
  } else if (existing?.pass) {
    next.pass = existing.pass;
  } else {
    next.pass = "";
  }

  await db.collection("settings").updateOne(
    { _id: SMTP_SETTINGS_ID },
    { $set: next },
    { upsert: true }
  );
}
