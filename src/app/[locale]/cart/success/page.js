"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useCart } from "@/components/CartStore";

function SuccessBody() {
  const t = useTranslations("cart");
  const params = useSearchParams();
  const sessionId = params.get("session_id");
  const cart = useCart();
  const [paid, setPaid] = useState(null);

  useEffect(() => {
    if (!sessionId) {
      setPaid(false);
      return;
    }
    fetch(`/api/stripe/session?session_id=${encodeURIComponent(sessionId)}`)
      .then((res) => res.json())
      .then((data) => {
        setPaid(Boolean(data.paid));
        if (data.paid) cart.clear();
      })
      .catch(() => setPaid(false));
  }, [sessionId]);

  if (paid === null) {
    return <p>{t("stripeChecking")}</p>;
  }

  if (!paid) {
    return (
      <div>
        <p className="banner warn">{t("stripePending")}</p>
        <Link className="btn" href="/cart">
          {t("backToCart")}
        </Link>
      </div>
    );
  }

  return (
    <div>
      <p className="banner ok">{t("stripeSuccess")}</p>
      <Link className="btn btn-primary" href="/catalog">
        {t("backToCatalog")}
      </Link>
    </div>
  );
}

export default function CartSuccessPage() {
  const t = useTranslations("cart");

  return (
  <>
      <div className="page-head">
        <h1>{t("stripeSuccessTitle")}</h1>
      </div>
      <Suspense fallback={<p>{t("stripeChecking")}</p>}>
        <SuccessBody />
      </Suspense>
    </>
  );
}
