"use client";

import { PRODUCT_IMAGE_FALLBACK, productImageSrc } from "@/lib/productImage";
import { productName } from "@/lib/categories";

export default function ProductImage({ product, locale, className = "product-photo" }) {
  return (
    <div className={className}>
      <img
        src={productImageSrc(product)}
        alt={productName(product, locale)}
        width={800}
        height={520}
        loading="lazy"
        decoding="async"
        onError={(event) => {
          if (event.currentTarget.src.endsWith("_fallback.jpg")) return;
          event.currentTarget.src = PRODUCT_IMAGE_FALLBACK;
        }}
      />
    </div>
  );
}
