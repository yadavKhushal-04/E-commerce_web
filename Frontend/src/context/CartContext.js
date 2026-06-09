import React, { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext(null);
const KEY = "rekhay_cart_v1";

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; }
  });
  const [open, setOpen] = useState(false);

  useEffect(() => { localStorage.setItem(KEY, JSON.stringify(items)); }, [items]);

  const add = (item) => {
    setItems((prev) => {
      const idx = prev.findIndex(
        (p) => p.product_id === item.product_id && p.size === item.size,
      );
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], quantity: copy[idx].quantity + (item.quantity || 1) };
        return copy;
      }
      return [...prev, { ...item, quantity: item.quantity || 1 }];
    });
    setOpen(true);
  };

  const remove = (product_id, size) =>
    setItems((prev) => prev.filter((p) => !(p.product_id === product_id && p.size === size)));

  const updateQty = (product_id, size, qty) =>
    setItems((prev) =>
      prev.map((p) =>
        p.product_id === product_id && p.size === size ? { ...p, quantity: Math.max(1, qty) } : p,
      ),
    );

  const clear = () => setItems([]);

  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const count = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, add, remove, updateQty, clear, total, count, open, setOpen }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);