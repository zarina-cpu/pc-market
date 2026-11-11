"use client";

import { useState } from "react";
import { CATEGORIES } from "@/lib/categories";

export default function AdminProducts({ products: initial }) {
  const [products, setProducts] = useState(initial);
  const [message, setMessage] = useState("");

  async function saveRow(product) {
    const res = await fetch(`/api/admin/products/${product.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        priceUzs: product.priceUzs,
        stock: product.stock,
      }),
    });
    setMessage(res.ok ? "Сохранено" : "Не сохранилось");
  }

  async function createProduct(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());
    payload.priceUzs = Number(payload.priceUzs);
    payload.stock = Number(payload.stock);
    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      setMessage("Проверьте поля и JSON характеристик");
      return;
    }
    setProducts((list) => [...list, data.product].sort((a, b) => a.nameRu.localeCompare(b.nameRu, "ru")));
    event.currentTarget.reset();
    setMessage("Товар добавлен");
  }

  return (
    <>
      <h1>Товары</h1>
      {message ? <p className="banner ok">{message}</p> : null}
      <div className="office-table-wrap">
        <table className="fps-table">
          <thead>
            <tr>
              <th>Название</th>
              <th>Категория</th>
              <th>Цена, сум</th>
              <th>Остаток</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td>{product.nameRu}</td>
                <td>{product.category}</td>
                <td>
                  <input
                    type="number"
                    min="0"
                    value={product.priceUzs}
                    onChange={(event) =>
                      setProducts((list) =>
                        list.map((row) =>
                          row.id === product.id
                            ? { ...row, priceUzs: Number(event.target.value) }
                            : row,
                        ),
                      )
                    }
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min="0"
                    value={product.stock}
                    onChange={(event) =>
                      setProducts((list) =>
                        list.map((row) =>
                          row.id === product.id
                            ? { ...row, stock: Number(event.target.value) }
                            : row,
                        ),
                      )
                    }
                  />
                </td>
                <td>
                  <button className="btn" type="button" onClick={() => saveRow(product)}>
                    Ок
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <form className="checkout-form" onSubmit={createProduct}>
        <h2>Новая позиция</h2>
        <label>
          Slug
          <input name="slug" required placeholder="ryzen-9-7950x" />
        </label>
        <label>
          Категория
          <select name="category" className="part-select" required>
            {CATEGORIES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <label>
          Бренд
          <input name="brand" />
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
          Описание RU
          <textarea name="descriptionRu" rows={2} />
        </label>
        <label>
          Описание UZ
          <textarea name="descriptionUz" rows={2} />
        </label>
        <label>
          Цена, сум
          <input name="priceUzs" type="number" min="0" required />
        </label>
        <label>
          Остаток
          <input name="stock" type="number" min="0" defaultValue={4} />
        </label>
        <label>
          Характеристики JSON
          <textarea name="specs" rows={4} defaultValue="{}" />
        </label>
        <button className="btn btn-primary" type="submit">
          Добавить товар
        </button>
      </form>
    </>
  );
}
