"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";

const KEY = "pc-market-cart-v1";
const CartContext = createContext(null);

function loadCart() {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [ready, setReady] = useState(false);
  const skipPersist = useRef(true);

  useEffect(() => {
    setItems(loadCart());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (skipPersist.current) {
      skipPersist.current = false;
      return;
    }
    localStorage.setItem(KEY, JSON.stringify(items));
  }, [items, ready]);

  const value = useMemo(() => {
    function add(product, qty = 1) {
      setItems((current) => {
        const found = current.find((item) => item.id === product.id);
        if (found) {
          return current.map((item) =>
            item.id === product.id ? { ...item, qty: item.qty + qty } : item,
          );
        }
        return [
          ...current,
          {
            id: product.id,
            slug: product.slug,
            nameRu: product.nameRu,
            nameUz: product.nameUz,
            priceUzs: product.priceUzs,
            qty,
          },
        ];
      });
    }

    function addMany(products) {
      setItems((current) => {
        const next = current.map((item) => ({ ...item }));
        for (const product of products) {
          const found = next.find((item) => item.id === product.id);
          if (found) {
            found.qty += 1;
          } else {
            next.push({
              id: product.id,
              slug: product.slug,
              nameRu: product.nameRu,
              nameUz: product.nameUz,
              priceUzs: product.priceUzs,
              qty: 1,
            });
          }
        }
        return next;
      });
    }

    function remove(id) {
      setItems((current) => current.filter((item) => item.id !== id));
    }

    function clear() {
      setItems([]);
    }

    function count() {
      return items.reduce((sum, item) => sum + item.qty, 0);
    }

    function total() {
      return items.reduce((sum, item) => sum + item.priceUzs * item.qty, 0);
    }

    return { items, add, addMany, remove, clear, count, total, ready };
  }, [items, ready]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("CartProvider missing");
  return ctx;
}
