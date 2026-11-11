"use client";

import { useState } from "react";

export default function AdminLogin({ nextPath }) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const password = new FormData(event.currentTarget).get("password");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) {
      setError("Пароль не подошёл или не задан в .env");
      setBusy(false);
      return;
    }
    window.location.assign(nextPath);
  }

  return (
    <form className="checkout-form office-login" onSubmit={onSubmit}>
      <h1>Касса</h1>
      <p>Скрытая панель. Ссылка в меню магазина не стоит.</p>
      <label>
        Пароль
        <input name="password" type="password" required autoComplete="current-password" />
      </label>
      <button className="btn btn-primary" type="submit" disabled={busy}>
        Войти
      </button>
      {error ? <p className="banner bad">{error}</p> : null}
    </form>
  );
}
