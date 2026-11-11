const FALLBACK = "/products/_fallback.jpg";

export function productImageSrc(product) {
  if (product?.image) return product.image;
  if (product?.slug) return `/products/${product.slug}.jpg`;
  return FALLBACK;
}

export const PRODUCT_IMAGE_FALLBACK = FALLBACK;
