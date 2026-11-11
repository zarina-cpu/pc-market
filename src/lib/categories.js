export const CATEGORIES = [
  "cpu",
  "motherboard",
  "ram",
  "gpu",
  "storage",
  "psu",
  "case",
  "cooler",
];

export const BUILDER_SLOTS = [
  { key: "cpu", category: "cpu", required: true },
  { key: "motherboard", category: "motherboard", required: true },
  { key: "ram", category: "ram", required: true },
  { key: "gpu", category: "gpu", required: true },
  { key: "storage", category: "storage", required: true },
  { key: "storage2", category: "storage", required: false },
  { key: "psu", category: "psu", required: true },
  { key: "case", category: "case", required: true },
  { key: "cooler", category: "cooler", required: true },
];

export function parseSpecs(product) {
  if (!product) return null;
  if (product.specs && typeof product.specs === "object") return product.specs;
  try {
    return JSON.parse(product.specs);
  } catch {
    return {};
  }
}

export function productName(product, locale) {
  if (!product) return "";
  return locale === "uz" ? product.nameUz : product.nameRu;
}

export function productDescription(product, locale) {
  if (!product) return "";
  return locale === "uz" ? product.descriptionUz : product.descriptionRu;
}
