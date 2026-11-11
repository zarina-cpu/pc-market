"use client";

import { formatUzs } from "@/lib/money";

export default function AdminOrders({ orders }) {
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
            <p>{order.telegramOk ? "Ушло менеджеру в Telegram" : "В Telegram не ушло, файл в кассе"}</p>
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
