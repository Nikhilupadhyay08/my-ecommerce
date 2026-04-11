/** Stable id string for Mongo ObjectId / string / number in JSON from the API. */
function normalizeMongoId(id: unknown): string | null {
  if (id == null) return null;
  if (typeof id === "string" && id !== "") return id;
  if (typeof id === "number") return String(id);
  if (typeof id === "object" && id !== null && "$oid" in id) {
    const oid = (id as { $oid?: unknown }).$oid;
    if (typeof oid === "string") return oid;
  }
  return null;
}

/**
 * Merge product arrays (e.g. localStorage + API). Dedupes by name when name is
 * non-empty; otherwise by _id. Avoids collapsing many items when `name` is
 * missing (undefined === undefined dedupe bug).
 */
export function mergeProductLists(
  ...lists: unknown[][]
): Record<string, unknown>[] {
  const combined = lists
    .flat()
    .filter((x): x is Record<string, unknown> => x != null && typeof x === "object");

  const out: Record<string, unknown>[] = [];
  const usedName = new Set<string>();
  const usedId = new Set<string>();

  for (const p of combined) {
    const name = p.name;
    const nameOk = typeof name === "string" && name.trim() !== "";
    if (nameOk) {
      const nk = `name:${name.trim().toLowerCase()}`;
      if (usedName.has(nk)) continue;
      usedName.add(nk);
      out.push(p);
      continue;
    }

    const rawId = normalizeMongoId(p._id);
    if (rawId) {
      const idk = `id:${rawId}`;
      if (usedId.has(idk)) continue;
      usedId.add(idk);
      out.push(p);
      continue;
    }

    out.push(p);
  }

  return out;
}
