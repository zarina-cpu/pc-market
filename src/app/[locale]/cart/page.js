import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import CartView from "@/components/CartView";

export default async function CartPage({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("cart");

  return (
    <>
      <div className="page-head">
        <h1>{t("title")}</h1>
      </div>
      <Suspense fallback={<p>{t("empty")}</p>}>
        <CartView />
      </Suspense>
    </>
  );
}
