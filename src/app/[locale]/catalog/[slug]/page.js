import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { getProductBySlug } from "@/lib/catalogData";
import { parseSpecs, productDescription, productName } from "@/lib/categories";
import { formatUzs } from "@/lib/money";
import AddToCartButton from "@/components/AddToCartButton";
import ProductImage from "@/components/ProductImage";

export const revalidate = 60;

export default async function ProductPage({ params }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("product");
  const tCat = await getTranslations("catalog");
  const product = await getProductBySlug(slug);
  if (!product) notFound();
  const specs = parseSpecs(product);

  return (
    <div className="product-layout">
      <div>
        <div className="page-head">
          <Link href="/catalog">{t("back")}</Link>
          <h1>{productName(product, locale)}</h1>
          <p className="brand-line">
            {product.brand} · {product.stock} {tCat("stock")}
          </p>
        </div>
        <ProductImage product={product} locale={locale} className="product-photo product-photo-lg" />
        <p>{productDescription(product, locale)}</p>
        <p className="price">{formatUzs(product.priceUzs, locale)}</p>
        <AddToCartButton product={product} />
      </div>
      <aside className="hero-panel">
        <h2>{t("specs")}</h2>
        <div className="spec-list">
          {Object.entries(specs).map(([key, value]) => (
            <div key={key}>
              <span>{key}</span>
              <strong>{Array.isArray(value) ? value.join(", ") : String(value)}</strong>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}
