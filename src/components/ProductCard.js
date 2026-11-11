import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { productName } from "@/lib/categories";
import { formatUzs } from "@/lib/money";
import AddToCartButton from "./AddToCartButton";
import ProductImage from "./ProductImage";

export default async function ProductCard({ product, locale }) {
  const t = await getTranslations("catalog");
  const tCat = await getTranslations("categories");

  return (
    <article className="card">
      <ProductImage product={product} locale={locale} />
      <div className="brand-line">
        {product.brand} · {tCat(product.category)}
      </div>
      <h3>{productName(product, locale)}</h3>
      <div className="price">{formatUzs(product.priceUzs, locale)}</div>
      <div className="cta-row">
        <Link className="btn" href={`/catalog/${product.slug}`}>
          {t("open")}
        </Link>
        <AddToCartButton product={product} />
      </div>
    </article>
  );
}
