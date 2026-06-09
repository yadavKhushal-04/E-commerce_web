import React, { useEffect, useState } from "react";
import { api, formatINR } from "../../lib/api";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  useEffect(() => {
    api.get("/admin/orders").then((r) => setOrders(r.data)).catch(() => {});
  }, []);

  return (
    <div className="p-10" data-testid="admin-orders-page">
      <p className="label-eyebrow mb-2">Sales</p>
      <h1 className="font-serif text-4xl mb-10">Orders</h1>

      <div className="border border-line bg-card">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-line">
              <th className="p-4 label-eyebrow">Order</th>
              <th className="p-4 label-eyebrow">Customer</th>
              <th className="p-4 label-eyebrow">Items</th>
              <th className="p-4 label-eyebrow">Total</th>
              <th className="p-4 label-eyebrow">Status</th>
              <th className="p-4 label-eyebrow">Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 && (
              <tr><td colSpan={6} className="p-10 text-center text-muted">No orders yet.</td></tr>
            )}
            {orders.map((o) => (
              <tr key={o.id} className="border-b border-line" data-testid={`order-row-${o.id}`}>
                <td className="p-4 font-mono text-xs">{o.id.slice(-8)}</td>
                <td className="p-4">
                  <div>{o.customer_name}</div>
                  <div className="text-xs text-muted">{o.email}</div>
                </td>
                <td className="p-4 text-sm">{o.items.length} items</td>
                <td className="p-4 font-serif text-lg">{formatINR(o.total)}</td>
                <td className="p-4">
                  <span className={`text-xs tracking-widest uppercase px-2 py-1 ${o.payment_status === "paid" ? "bg-surface text-forest" : "bg-line text-muted"}`}>
                    {o.payment_status}
                  </span>
                </td>
                <td className="p-4 text-xs text-muted">{new Date(o.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}