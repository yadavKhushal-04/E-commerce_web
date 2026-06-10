import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { api, formatINR } from "../lib/api";
import { useCart } from "../context/CartContext";

export default function Checkout() {
  const { items, total, clear } = useCart();
  const navigate = useNavigate();
  const [form, setForm] = useState({ customer_name: "", email: "", phone: "", address: "" });
  const [submitting, setSubmitting] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const placeOrder = async (e) => {
    e.preventDefault();
    if (items.length === 0) { toast.error("Your bag is empty"); return; }
    setSubmitting(true);
    try {
      const { data } = await api.post("/orders", {
        ...form,
        items: items.map((i) => ({
          product_id: i.product_id, name: i.name, price: i.price,
          size: i.size, quantity: i.quantity, image: i.image,
        })),
      });
      const order = data.order;

      if (data.razorpay_enabled && data.razorpay_key_id) {
        // Razorpay live flow
        await loadRazorpay();
        const opts = {
          key: data.razorpay_key_id,
          amount: order.total * 100,
          currency: "INR",
          name: "Rekhay Atelier",
          description: `Order ${order.id}`,
          order_id: order.razorpay_order_id,
          handler: async (res) => {
            try {
              await api.post(`/orders/${order.id}/verify`, {
                razorpay_order_id: res.razorpay_order_id,
                razorpay_payment_id: res.razorpay_payment_id,
                razorpay_signature: res.razorpay_signature,
              });
              clear();
              navigate(`/order/${order.id}`);
            } catch (err) {
              toast.error("Payment verification failed");
            }
          },
          prefill: { name: form.customer_name, email: form.email, contact: form.phone },
          theme: { color: "#2C4C3B" },
        };
        new window.Razorpay(opts).open();
      } else {
        // MOCK PAYMENT FLOW — Razorpay keys not configured.
        toast.info("Demo mode: simulating payment");
        await api.post(`/orders/${order.id}/verify`, {});
        clear();
        navigate(`/order/${order.id}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || "Could not place order");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="px-6 md:px-12 lg:px-24 py-16" data-testid="checkout-page">
      <p className="label-eyebrow mb-3">Final Step</p>
      <h1 className="font-serif text-5xl md:text-6xl">Checkout</h1>

      <div className="grid lg:grid-cols-5 gap-16 mt-14">
        <form onSubmit={placeOrder} className="lg:col-span-3 space-y-8" data-testid="checkout-form">
          <div>
            <p className="label-eyebrow mb-6">Contact</p>
            <div className="space-y-6">
              <Field name="customer_name" label="Full Name" value={form.customer_name} onChange={onChange} />
              <Field name="email" label="Email" type="email" value={form.email} onChange={onChange} />
              <Field name="phone" label="Phone" value={form.phone} onChange={onChange} />
            </div>
          </div>
          <div>
            <p className="label-eyebrow mb-6">Shipping Address</p>
            <textarea
              name="address" required value={form.address} onChange={onChange}
              data-testid="checkout-address"
              rows={4}
              placeholder="Street, City, State, PIN"
              className="w-full bg-transparent border-b border-line pb-2 pt-4 focus:border-forest focus:outline-none"
            />
          </div>
          <button
            type="submit" disabled={submitting}
            data-testid="place-order-button"
            className="w-full bg-forest text-bg py-5 text-xs tracking-[0.25em] uppercase hover:bg-forest-dark transition-colors disabled:opacity-50"
          >
            {submitting ? "Processing…" : `Pay ${formatINR(total)}`}
          </button>
          <p className="text-xs text-muted">
            By placing this order you agree to our terms. Order confirmation will be sent to your email.
          </p>
        </form>

        <aside className="lg:col-span-2 bg-surface p-8 self-start">
          <p className="label-eyebrow mb-6">Order Summary</p>
          <div className="space-y-4">
            {items.map((i) => (
              <div key={`${i.product_id}-${i.size}`} className="flex justify-between text-sm">
                <span className="text-ink">{i.name} <span className="text-muted">× {i.quantity} {i.size && `· ${i.size}`}</span></span>
                <span>{formatINR(i.price * i.quantity)}</span>
              </div>
            ))}

            
            <div className="border-t border-line mt-4 pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-muted">
                <span>Subtotal</span>
                <span>{formatINR(total)}</span>
              </div>
              <div className="flex justify-between text-muted">
                <span>Shipping</span>
                <span>{total >= 2499 ? <span className="text-forest">Free</span> : formatINR(99)}</span>
              </div>
            </div>
            
          </div>
          <div className="border-t border-line mt-6 pt-6 flex justify-between">
            <span className="label-eyebrow">Total</span>
            <span className="font-serif text-2xl" data-testid="checkout-total">{formatINR(total)}</span>
          </div>
          <p className="mt-4 text-xs text-muted">Shipping calculated post order based on address.</p>
        </aside>
      </div>
    </div>
  );
}

function Field({ name, label, value, onChange, type = "text" }) {
  return (
    <div>
      <label className="label-eyebrow block mb-1">{label}</label>
      <input
        name={name} type={type} value={value} onChange={onChange} required
        data-testid={`checkout-${name}`}
        className="w-full bg-transparent border-b border-line pb-2 pt-1 focus:border-forest focus:outline-none"
      />
    </div>
  );
}

function loadRazorpay() {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) return resolve();
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = resolve; s.onerror = reject;
    document.body.appendChild(s);
  });
}