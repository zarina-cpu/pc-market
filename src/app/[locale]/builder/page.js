import { getTranslations, setRequestLocale } from "next-intl/server";
import { getAllGames, getAllProducts } from "@/lib/catalogData";
import BuilderClient from "@/components/BuilderClient";

export const revalidate = 60;

export default async function BuilderPage({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("builder");
  const [products, games] = await Promise.all([getAllProducts(), getAllGames()]);

  return (
    <>
      <div className="page-head">
        <h1>{t("title")}</h1>
        <p className="lead">{t("lead")}</p>
      </div>
      <BuilderClient products={products} games={games} />
    </>
  );
}
