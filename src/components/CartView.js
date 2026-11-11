"use client";

import { useLocale, useTranslations } from "next-intl";
import { formatUzs } from "@/lib/money";
import { productName } from "@/lib/categories";
import { useCart } from "./CartStore";
import CheckoutForm from "./CheckoutForm";

export default function CartView() {
  const t = useTranslations("cart");
  const locale = useLocale();
  const cart = useCart();

  if (!cart.ready) return null;
  if (cart.items.length === 0) {
    return <p>{t("empty")}</p>;
  }

  return (
    <div>
      {cart.items.map((item) => (
        <div className="cart-line" key={item.id}>
          <div>
            <strong>{productName(item, locale)}</strong>
            <div className="brand-line">
              {item.qty} {t("qty")}
            </div>
          </div>
          <div className="price">{formatUzs(item.priceUzs * item.qty, locale)}</div>
          <button className="btn" type="button" onClick={() => cart.remove(item.id)}>
            {t("remove")}
          </button>
        </div>
      ))}
      <p className="price">
        {t("total")}: {formatUzs(cart.total(), locale)}
      </p>
      <CheckoutForm />
    </div>
  );
}
