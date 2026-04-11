/** Normalize product _id from API JSON (string, number, or { $oid }). */
export function idToString(id: unknown): string {
  if (id == null) return "";
  if (typeof id === "string" || typeof id === "number") return String(id);
  if (typeof id === "object" && id !== null && "$oid" in id) {
    const oid = (id as { $oid?: unknown }).$oid;
    if (typeof oid === "string") return oid;
  }
  return String(id);
}
