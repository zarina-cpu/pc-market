"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useCart } from "./CartStore";

export default function AddToCartButton({ product }) {
  const t = useTranslations("catalog");
  const cart = useCart();
  const [done, setDone] = useState(false);

  return (
    <button
      className="btn btn-primary"
      type="button"
      onClick={() => {
        cart.add(product);
        setDone(true);
      }}
    >
      {done ? t("added") : t("add")}
    </button>
  );
}
