import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getFeaturedProducts } from "@/lib/catalogData";
import ProductCard from "@/components/ProductCard";

export const revalidate = 60;

export default async function HomePage({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");
  const featured = await getFeaturedProducts();

  return (
    <>
      <section className="hero">
        <div>
          <div className="kicker">{t("kicker")}</div>
          <h1>{t("title")}</h1>
          <p className="lead">{t("lead")}</p>
          <div className="cta-row">
            <Link className="btn btn-primary" href="/builder">
              {t("ctaBuilder")}
            </Link>
            <Link className="btn" href="/catalog">
              {t("ctaCatalog")}
            </Link>
          </div>
        </div>
        <aside className="hero-panel">
          <h2>{t("benchTitle")}</h2>
          <p>{t("bench1")}</p>
          <p>{t("bench2")}</p>
        </aside>
      </section>
      <h2>{t("featured")}</h2>
      <div className="grid">
        {featured.map((product) => (
          <ProductCard key={product.id} product={product} locale={locale} />
        ))}
      </div>
    </>
  );
}
