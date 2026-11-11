"use client";

import { useState } from "react";

export default function AdminGames({ games: initial }) {
  const [games, setGames] = useState(initial);
  const [message, setMessage] = useState("");

  async function createGame(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());
    [
      "cpuWeight",
      "gpuWeight",
      "baseFps",
      "vramLow",
      "vramMed",
      "vramHigh",
      "vramUltra",
    ].forEach((key) => {
      payload[key] = Number(payload[key]);
    });
    const res = await fetch("/api/admin/games", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      setMessage("Проверьте slug и веса CPU/GPU");
      return;
    }
    setGames((list) => [...list, data.game]);
    event.currentTarget.reset();
    setMessage("Игра в таблице FPS");
  }

  return (
    <>
      <h1>Игры для FPS</h1>
      {message ? <p className="banner ok">{message}</p> : null}
      <p>Сейчас в базе {games.length} игр. Новая строка попадёт на стенд.</p>
      <ul className="office-list">
        {games.map((game) => (
          <li key={game.id}>
            {game.nameRu} · CPU {game.cpuWeight} / GPU {game.gpuWeight} · база {game.baseFps} FPS
          </li>
        ))}
      </ul>
      <form className="checkout-form" onSubmit={createGame}>
        <h2>Добавить игру</h2>
        <label>
          Slug
          <input name="slug" required placeholder="elden-ring-nightreign" />
        </label>
        <label>
          Название RU
          <input name="nameRu" required />
        </label>
        <label>
          Название UZ
          <input name="nameUz" required />
        </label>
        <label>
          Вес CPU (0–1)
          <input name="cpuWeight" type="number" step="0.01" min="0" max="1" defaultValue="0.3" />
        </label>
        <label>
          Вес GPU (0–1)
          <input name="gpuWeight" type="number" step="0.01" min="0" max="1" defaultValue="0.7" />
        </label>
        <label>
          Базовый FPS (1080p средние, эталон 100/100)
          <input name="baseFps" type="number" min="10" defaultValue="80" />
        </label>
        <label>
          VRAM низкие / средние / высокие / ультра, ГБ
          <div className="vram-row">
            <input name="vramLow" type="number" min="2" defaultValue="6" />
            <input name="vramMed" type="number" min="2" defaultValue="8" />
            <input name="vramHigh" type="number" min="2" defaultValue="10" />
            <input name="vramUltra" type="number" min="2" defaultValue="12" />
          </div>
        </label>
        <button className="btn btn-primary" type="submit">
          Добавить игру
        </button>
      </form>
    </>
  );
}
