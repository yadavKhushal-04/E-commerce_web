import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Check } from "lucide-react";
import { api, formatINR } from "../lib/api";

export default function OrderConfirmation() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    api.get(`/orders/${id}`).then((r) => setOrder(r.data)).catch(() => {});
  }, [id]);

  if (!order) return <div className="px-6 py-32 text-center text-muted">Loading…</div>;

  return (
    <div className="px-6 md:px-12 lg:px-24 py-24 max-w-3xl mx-auto text-center" data-testid="order-confirmation-page">
      <div className="w-16 h-16 rounded-full border border-forest text-forest flex items-center justify-center mx-auto">
        <Check className="w-6 h-6" />
      </div>
      <p className="label-eyebrow mt-8">Order Confirmed</p>
      <h1 className="font-serif text-5xl md:text-6xl mt-3">Thank you, {order.customer_name.split(" ")[0]}.</h1>
      <p className="mt-6 text-muted leading-relaxed">
        Your order has been received. A confirmation email is on its way to <b>{order.email}</b>. Your pieces will be crafted with care over the next few days.
      </p>

      <div className="mt-12 border border-line p-8 text-left">
        <div className="flex justify-between mb-6">
          <span className="label-eyebrow">Order ID</span>
          <span className="font-mono text-sm" data-testid="order-id">{order.id}</span>
        </div>
        <div className="space-y-3">
          {order.items.map((i, idx) => (
            <div key={idx} className="flex justify-between text-sm">
              <span>{i.name} <span className="text-muted">× {i.quantity}</span></span>
              <span>{formatINR(i.price * i.quantity)}</span>
            </div>
          ))}
        </div>
        <div className="border-t border-line mt-6 pt-4 flex justify-between">
          <span className="label-eyebrow">Total Paid</span>
          <span className="font-serif text-2xl">{formatINR(order.total)}</span>
        </div>
      </div>

      <Link
        to="/shop"
        className="inline-block mt-12 border border-forest text-forest px-8 py-4 text-xs tracking-[0.25em] uppercase hover:bg-surface transition-colors"
      >
        Continue Browsing
      </Link>
    </div>
  );
}