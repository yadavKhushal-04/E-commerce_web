import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogOut, Package } from "lucide-react";
import { toast } from "sonner";
import { useUser } from "../context/UserContext.js";
import { api, formatINR } from "../lib/api.js";

const STATUS_COLORS = {
  pending:   "text-amber-600 bg-amber-50",
  confirmed: "text-forest bg-green-50",
  shipped:   "text-blue-600 bg-blue-50",
  delivered: "text-forest bg-green-50",
  cancelled: "text-clay bg-red-50",
};

export default function Account() {
  const { user, logout, loading } = useUser();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      navigate("/login", { state: { from: "/account" } });
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;
    api.get("/customer/orders")
      .then((r) => setOrders(r.data))
      .catch(() => toast.error("Could not load orders."))
      .finally(() => setOrdersLoading(false));
  }, [user]);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  if (loading) return <div className="px-6 py-32 text-center text-muted">Loading…</div>;
  if (!user) return null;

  return (
    <div className="px-6 md:px-12 lg:px-24 py-16 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-12">
        <div>
          <p className="label-eyebrow mb-2">My Account</p>
          <h1 className="font-serif text-4xl md:text-5xl">{user.name}</h1>
          <p className="text-muted text-sm mt-2">{user.email}</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-xs tracking-widest uppercase text-clay hover-underline mt-2"
        >
          <LogOut className="w-3 h-3" />
          Sign out
        </button>
      </div>

      {/* Orders */}
      <div>
        <p className="label-eyebrow mb-6">Order History</p>

        {ordersLoading ? (
          <p className="text-muted text-sm">Loading orders…</p>
        ) : orders.length === 0 ? (
          <div className="border border-line p-12 text-center">
            <Package className="w-8 h-8 text-muted mx-auto mb-4" strokeWidth={1} />
            <p className="text-muted text-sm">No orders yet.</p>
            <Link
              to="/shop"
              className="inline-block mt-6 border border-forest text-forest px-6 py-3 text-xs tracking-[0.25em] uppercase hover:bg-surface transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="border border-line bg-card p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                  <div>
                    <p className="font-mono text-xs text-muted mb-1">Order #{order.id.slice(-8).toUpperCase()}</p>
                    <p className="text-sm text-muted">
                      {new Date(order.created_at).toLocaleDateString("en-IN", {
                        day: "numeric", month: "long", year: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span
                      className={`text-[10px] tracking-widest uppercase px-3 py-1 font-medium ${STATUS_COLORS[order.status] || "text-muted bg-surface"}`}
                    >
                      {order.status}
                    </span>
                    <span className="font-serif text-xl">{formatINR(order.total)}</span>
                  </div>
                </div>

                {/* Items */}
                <div className="border-t border-line pt-4 space-y-2">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span>
                        {item.name}
                        {item.size && <span className="text-muted ml-1">/ {item.size}</span>}
                        <span className="text-muted ml-1">× {item.quantity}</span>
                      </span>
                      <span className="text-muted">{formatINR(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>

                {/* Shipping address */}
                <p className="text-xs text-muted mt-4 border-t border-line pt-4">
                  Shipped to: {order.address}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}