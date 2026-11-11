import { prisma } from "./prisma";

const FEATURED_SLUGS = [
  "ryzen-7-7800x3d",
  "rtx-4070-super",
  "b650-tomahawk",
  "case-mid",
];

let productCache = null;
let gameCache = null;

export function invalidateCatalog() {
  productCache = null;
  gameCache = null;
}

async function loadProducts() {
  if (!productCache) {
    productCache = await prisma.product.findMany({
      orderBy: [{ category: "asc" }, { priceUzs: "asc" }],
    });
  }
  return productCache;
}

async function loadGames() {
  if (!gameCache) {
    gameCache = await prisma.game.findMany({ orderBy: { nameRu: "asc" } });
  }
  return gameCache;
}

export async function getAllProducts() {
  return loadProducts();
}

export async function getFeaturedProducts() {
  const products = await loadProducts();
  const bySlug = new Map(products.map((item) => [item.slug, item]));
  return FEATURED_SLUGS.map((slug) => bySlug.get(slug)).filter(Boolean);
}

export async function getProductsByCategory(category) {
  const products = await loadProducts();
  if (!category) return products;
  return products.filter((item) => item.category === category);
}

export async function getProductBySlug(slug) {
  const products = await loadProducts();
  return products.find((item) => item.slug === slug) ?? null;
}

export async function getAllGames() {
  return loadGames();
}
