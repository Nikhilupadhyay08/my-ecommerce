import bcrypt from "bcryptjs";

const OTP_ROUNDS = 6;

/** Hash a short numeric OTP (bcrypt with fewer rounds for speed). */
export async function hashOtp(plain: string): Promise<string> {
  return bcrypt.hash(plain, OTP_ROUNDS);
}

export async function verifyOtp(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

/** 6-digit numeric code. */
export function generateRegisterOtp(): string {
  const n = crypto.getRandomValues(new Uint32Array(1))[0] % 1_000_000;
  return String(n).padStart(6, "0");
}
