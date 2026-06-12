import React from "react";
import { useNavigate } from "react-router-dom";
import { X, Minus, Plus } from "lucide-react";
import { useCart } from "../context/CartContext";
import { fileUrl, formatINR } from "../lib/api.js";

export default function CartDrawer(){
  const { items, open, setOpen, remove, updateQty, total } = useCart();
  const navigate = useNavigate();

  return (
    <>
      <div
        className={`fixed inset-0 bg-ink/40 z-50 transition-opacity ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={() => setOpen(false)}
      />
      <aside
        data-testid="cart-drawer"
        className={`fixed top-0 right-0 h-full w-full sm:w-[440px] bg-bg z-50 border-l border-line transition-transform duration-500 ${open ? "translate-x-0" : "translate-x-full"} flex flex-col`}
      >
        <div className="flex items-center justify-between p-6 border-b border-line">
          <h3 className="font-serif text-2xl">Your Bag</h3>
          <button onClick={() => setOpen(false)} data-testid="close-cart-button" aria-label="Close cart">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {items.length === 0 && (
            <div className="text-center text-muted mt-20">
              <p className="label-eyebrow mb-4">Empty</p>
              <p className="font-serif text-3xl">Your bag is waiting.</p>
            </div>
          )}
          {items.map((item) => (
            <div key={`${item.product_id}-${item.size}`} className="flex gap-4">
              <img
                src={fileUrl(item.image)}
                alt={item.name}
                className="w-24 h-32 object-cover bg-surface"
              />
              <div className="flex-1 flex flex-col">
                <div className="flex justify-between gap-2">
                  <p className="font-serif text-lg leading-snug">{item.name}</p>
                  <button
                    onClick={() => remove(item.product_id, item.size)}
                    className="text-muted hover:text-clay"
                    data-testid={`remove-item-${item.product_id}`}
                    aria-label="Remove"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="label-eyebrow mt-1">Size {item.size || "—"}</p>
                <div className="mt-auto flex items-center justify-between">
                  <div className="flex items-center border border-line">
                    <button
                      className="p-2"
                      onClick={() => updateQty(item.product_id, item.size, item.quantity - 1)}
                      aria-label="Decrease"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="px-3 text-sm">{item.quantity}</span>
                    <button
                      className="p-2"
                      onClick={() => updateQty(item.product_id, item.size, item.quantity + 1)}
                      aria-label="Increase"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <p className="text-sm">{formatINR(item.price * item.quantity)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t" border-line p-6 space-y-4>
          <div className="flex justify-between">
            <span className="label-eyebrow">Subtotal</span>
            <span className="font-serif text-2xl" data-testid="cart-subtotal">{formatINR(total)}</span>
          </div>
          <button
            disabled={items.length === 0}
            onClick={() => { setOpen(false); navigate("/checkout"); }}
            data-testid="checkout-button"
            className="w-full bg-forest text-bg py-4 text-xs tracking-[0.25em] uppercase hover:bg-forest-dark transition-colors disabled:opacity-40"
          >
            Proceed to Checkout
          </button>
          <p className="text-center text-xs text-muted">Shipping calculated at checkout</p>
        </div>
      </aside>
    </>
  );
}