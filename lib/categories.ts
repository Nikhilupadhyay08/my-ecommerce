export const PRODUCT_CATEGORY_OPTIONS = [
  "Electronics",
  "Fashion",
  "Home & Living",
  "Accessories",
  "Sports",
  "Groceries",
  "Uncategorized",
] as const;

export function productCategory(p: { category?: unknown }): string {
  const c = p.category;
  if (typeof c === "string" && c.trim() !== "") return c.trim();
  return "Uncategorized";
}
