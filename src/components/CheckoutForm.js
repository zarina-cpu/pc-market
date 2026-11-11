"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useCart } from "./CartStore";

export default function CheckoutForm() {
  const t = useTranslations("cart");
  const cart = useCart();
  const [configured, setConfigured] = useState(null);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch("/api/checkout/status")
      .then((res) => res.json())
      .then((data) => setConfigured(Boolean(data.configured)))
      .catch(() => setConfigured(false));
  }, []);

  async function onSubmit(event) {
    event.preventDefault();
    setStatus("");
    setBusy(true);
    const form = new FormData(event.currentTarget);
    form.set(
      "items",
      JSON.stringify(
        cart.items.map((item) => ({
          id: item.id,
          slug: item.slug,
          nameRu: item.nameRu,
          nameUz: item.nameUz,
          priceUzs: item.priceUzs,
          qty: item.qty,
        })),
      ),
    );
    try {
      const res = await fetch("/api/checkout", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setStatus(data.error || "fail");
        return;
      }
      cart.clear();
      setStatus(data.telegram ? "ok" : "saved");
      event.currentTarget.reset();
    } catch {
      setStatus("fail");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="checkout-form" onSubmit={onSubmit}>
      <h2>{t("checkoutTitle")}</h2>
      <p>{t("checkoutHelp")}</p>
      {configured === false ? <p className="banner warn">{t("notConfigured")}</p> : null}
      <label>
        {t("name")}
        <input name="name" required minLength={2} autoComplete="name" />
      </label>
      <label>
        {t("phone")}
        <input name="phone" required minLength={7} autoComplete="tel" />
      </label>
      <label>
        {t("comment")}
        <textarea name="comment" rows={3} />
      </label>
      <label>
        {t("receipt")}
        <input
          name="receipt"
          type="file"
          accept="image/jpeg,image/png,image/webp,application/pdf,.jpg,.jpeg,.png,.webp,.pdf"
          required
        />
      </label>
      <button className="btn btn-primary" type="submit" disabled={busy}>
        {busy ? t("sending") : t("send")}
      </button>
      {status === "ok" ? <p className="banner ok">{t("sent")}</p> : null}
      {status === "saved" ? <p className="banner ok">{t("saved")}</p> : null}
      {status && status !== "ok" && status !== "saved" ? (
        <p className="banner bad">
          {["need_receipt", "bad_receipt", "invalid_contact", "empty_cart"].includes(status)
            ? t(status)
            : t("fail")}
        </p>
      ) : null}
    </form>
  );
}
