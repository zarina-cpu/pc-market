import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getProductsByCategory } from "@/lib/catalogData";
import { CATEGORIES } from "@/lib/categories";
import ProductCard from "@/components/ProductCard";

export const revalidate = 60;

export default async function CatalogPage({ params, searchParams }) {
  const { locale } = await params;
  const query = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("catalog");
  const tCat = await getTranslations("categories");
  const category = CATEGORIES.includes(query.category) ? query.category : null;
  const products = await getProductsByCategory(category);

  return (
    <>
      <div className="page-head">
        <h1>{t("title")}</h1>
      </div>
      <div className="filters">
        <Link href="/catalog" data-active={!category ? "true" : "false"}>
          {t("all")}
        </Link>
        {CATEGORIES.map((item) => (
          <Link
            key={item}
            href={`/catalog?category=${item}`}
            data-active={category === item ? "true" : "false"}
          >
            {tCat(item)}
          </Link>
        ))}
      </div>
      {products.length === 0 ? (
        <p>{t("empty")}</p>
      ) : (
        <div className="grid">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} locale={locale} />
          ))}
        </div>
      )}
    </>
  );
}
