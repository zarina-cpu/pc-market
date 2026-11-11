"use client";

import { useState } from "react";
import { formatUzs } from "@/lib/money";

export default function AdminOrders({ orders: initialOrders }) {
  const [orders, setOrders] = useState(initialOrders);
  const [busyId, setBusyId] = useState("");

  async function resendTelegram(orderId) {
    setBusyId(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/telegram`, { method: "POST" });
      const data = await res.json();
      if (data.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, telegramOk: true } : o)),
        );
      } else {
        alert(data.error || "Не удалось отправить в Telegram");
      }
    } catch {
      alert("Ошибка сети");
    } finally {
      setBusyId("");
    }
  }
  return (
    <>
      <h1>Заказы</h1>
      {orders.length === 0 ? <p>Пока пусто. Чек сохраняется здесь и уходит менеджеру в Telegram.</p> : null}
      {orders.map((order) => {
        const items = JSON.parse(order.items || "[]");
        const receiptUrl = `/api/admin/orders/${order.id}/receipt`;
        const isPdf = (order.receiptMime || "").includes("pdf") || (order.receiptName || "").endsWith(".pdf");
        return (
          <article className="hero-panel" key={order.id} style={{ marginBottom: 12 }}>
            <p>
              {new Date(order.createdAt).toLocaleString("ru-RU")} · {order.name} · {order.phone}
            </p>
            <p className="price">{formatUzs(order.totalUzs, "ru")}</p>
            <p>
              {order.paymentProvider === "stripe"
                ? `Stripe · ${order.paymentStatus}`
                : "Перевод с чеком"}{" "}
              · {order.telegramOk ? "Telegram ✓" : "Telegram —"}
              {!order.telegramOk ? (
                <button
                  type="button"
                  className="btn"
                  style={{ marginLeft: 8 }}
                  disabled={busyId === order.id}
                  onClick={() => resendTelegram(order.id)}
                >
                  {busyId === order.id ? "…" : "Отправить в Telegram"}
                </button>
              ) : null}
            </p>
            {order.comment ? <p>{order.comment}</p> : null}
            <ul>
              {items.map((item, index) => (
                <li key={index}>
                  {item.title} × {item.qty}
                </li>
              ))}
            </ul>
            {order.receiptFile ? (
              <div className="receipt-box">
                <a className="btn" href={receiptUrl} target="_blank" rel="noreferrer">
                  {isPdf ? `Открыть PDF: ${order.receiptName}` : `Открыть картинку: ${order.receiptName}`}
                </a>
                {!isPdf ? <img src={receiptUrl} alt="Чек оплаты" className="receipt-preview" /> : null}
              </div>
            ) : (
              <p>Файл чека не приложен.</p>
            )}
          </article>
        );
      })}
    </>
  );
}
