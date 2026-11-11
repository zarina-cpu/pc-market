"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useCart } from "./CartStore";

export default function CheckoutForm() {
  const t = useTranslations("cart");
  const locale = useLocale();
  const cart = useCart();
  const [telegramOk, setTelegramOk] = useState(null);
  const [stripeReady, setStripeReady] = useState(false);
  const [method, setMethod] = useState("stripe");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch("/api/checkout/status")
      .then((res) => res.json())
      .then((data) => {
        setTelegramOk(Boolean(data.configured));
        setStripeReady(Boolean(data.stripe));
        if (data.stripe) setMethod("stripe");
      })
      .catch(() => {
        setTelegramOk(false);
        setStripeReady(false);
      });
  }, []);

  function cartPayload() {
    return cart.items.map((item) => ({
      id: item.id,
      slug: item.slug,
      nameRu: item.nameRu,
      nameUz: item.nameUz,
      priceUzs: item.priceUzs,
      qty: item.qty,
    }));
  }

  async function payWithStripe(event) {
    event.preventDefault();
    if (!stripeReady) {
      setStatus("stripe_not_configured");
      return;
    }
    setStatus("");
    setBusy(true);
    const form = new FormData(event.currentTarget);
    const payload = {
      name: String(form.get("name") || "").trim(),
      phone: String(form.get("phone") || "").trim(),
      comment: String(form.get("comment") || "").trim(),
      locale,
      items: cartPayload(),
    };
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.ok || !data.url) {
        setStatus(data.error || "fail");
        return;
      }
      window.location.assign(data.url);
    } catch {
      setStatus("fail");
    } finally {
      setBusy(false);
    }
  }

  async function sendManualReceipt(event) {
    event.preventDefault();
    setStatus("");
    setBusy(true);
    const form = new FormData(event.currentTarget);
    form.set("items", JSON.stringify(cartPayload()));
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

  const onSubmit = method === "stripe" ? payWithStripe : sendManualReceipt;
  const useStripe = method === "stripe";

  return (
    <form className="checkout-form" onSubmit={onSubmit}>
      <h2>{useStripe ? t("stripeTitle") : t("checkoutTitle")}</h2>
      <p className="pay-methods-label">{t("payMethodTitle")}</p>
      <div className="pay-methods" role="group" aria-label={t("payMethodTitle")}>
        <button
          type="button"
          className={`pay-method${useStripe ? " is-active" : ""}`}
          onClick={() => {
            setMethod("stripe");
            setStatus("");
          }}
        >
          <strong>{t("payMethodStripe")}</strong>
          <span>{t("payMethodStripeHint")}</span>
        </button>
        <button
          type="button"
          className={`pay-method${!useStripe ? " is-active" : ""}`}
          onClick={() => {
            setMethod("manual");
            setStatus("");
          }}
        >
          <strong>{t("payMethodManual")}</strong>
          <span>{t("payMethodManualHint")}</span>
        </button>
      </div>
      <p>{useStripe ? t("stripeHelp") : t("checkoutHelp")}</p>
      {useStripe && !stripeReady ? <p className="banner warn">{t("stripeSetup")}</p> : null}
      {telegramOk === false ? <p className="banner warn">{t("notConfigured")}</p> : null}
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
      {!useStripe ? (
        <label>
          {t("receipt")}
          <input
            name="receipt"
            type="file"
            accept="image/jpeg,image/png,image/webp,application/pdf,.jpg,.jpeg,.png,.webp,.pdf"
            required
          />
        </label>
      ) : null}
      <button
        className={`btn btn-primary${useStripe ? " stripe-pay-btn" : ""}`}
        type="submit"
        disabled={busy || (useStripe && !stripeReady)}
      >
        {busy
          ? useStripe
            ? t("stripeRedirecting")
            : t("sending")
          : useStripe
            ? t("stripePay")
            : t("send")}
      </button>
      {useStripe ? <p className="pay-footnote">{t("stripeSecure")}</p> : null}
      {status === "ok" ? <p className="banner ok">{t("sent")}</p> : null}
      {status === "saved" ? <p className="banner ok">{t("saved")}</p> : null}
      {status && status !== "ok" && status !== "saved" ? (
        <p className="banner bad">
          {[
            "need_receipt",
            "bad_receipt",
            "invalid_contact",
            "empty_cart",
            "stripe_not_configured",
          ].includes(status)
            ? t(status)
            : t("fail")}
        </p>
      ) : null}
    </form>
  );
}
