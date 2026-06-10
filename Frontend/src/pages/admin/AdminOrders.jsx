import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { ChevronDown, ChevronUp } from "lucide-react";
import { api, formatINR } from "../../lib/api";

const ORDER_STATUSES = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [expanded, setExpanded] = useState(null);

  const load = () => api.get("/admin/orders").then((r) => setOrders(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const updateStatus = async (id, status) => {
    await api.put(`/admin/orders/${id}/status`, { status });
    toast.success("Status updated");
    load();
  };

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
              <th className="p-4 label-eyebrow">Payment</th>
              <th className="p-4 label-eyebrow">Status</th>
              <th className="p-4 label-eyebrow">Date</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 && (
              <tr><td colSpan={8} className="p-10 text-center text-muted">No orders yet.</td></tr>
            )}
            {orders.map((o) => (
              <React.Fragment key={o.id}>
                <tr className="border-b border-line hover:bg-surface/40" data-testid={`order-row-${o.id}`}>
                  <td className="p-4 font-mono text-xs">{o.id.slice(-8)}</td>
                  <td className="p-4">
                    <div>{o.customer_name}</div>
                    <div className="text-xs text-muted">{o.email}</div>
                    <div className="text-xs text-muted">{o.phone}</div>
                  </td>
                  <td className="p-4 text-sm">{o.items.length} items</td>
                  <td className="p-4 font-serif text-lg">{formatINR(o.total)}</td>
                  <td className="p-4">
                    <span className={`text-xs tracking-widest uppercase px-2 py-1 ${o.payment_status === "paid" ? "bg-surface text-forest" : "bg-line text-muted"}`}>
                      {o.payment_status}
                    </span>
                  </td>
                  <td className="p-4">
                    <select
                      value={o.status}
                      onChange={(e) => updateStatus(o.id, e.target.value)}
                      className="bg-surface border border-line px-2 py-1 text-xs tracking-widest uppercase"
                    >
                      {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="p-4 text-xs text-muted">{new Date(o.created_at).toLocaleString()}</td>
                  <td className="p-4">
                    <button onClick={() => setExpanded(expanded === o.id ? null : o.id)} className="text-muted hover:text-ink">
                      {expanded === o.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </td>
                </tr>

                {/* Expanded detail row */}
                {expanded === o.id && (
                  <tr className="border-b border-line bg-surface/30">
                    <td colSpan={8} className="px-8 py-6">
                      <div className="grid md:grid-cols-2 gap-8">
                        <div>
                          <p className="label-eyebrow mb-3">Items Ordered</p>
                          <div className="space-y-2">
                            {o.items.map((item, i) => (
                              <div key={i} className="flex justify-between text-sm">
                                <span>
                                  {item.name}
                                  {item.size && <span className="text-muted"> · {item.size}</span>}
                                  <span className="text-muted"> × {item.quantity}</span>
                                </span>
                                <span>{formatINR(item.price * item.quantity)}</span>
                              </div>
                            ))}
                            <div className="border-t border-line pt-2 flex justify-between font-serif">
                              <span>Total</span>
                              <span>{formatINR(o.total)}</span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <p className="label-eyebrow mb-3">Shipping Address</p>
                          <p className="text-sm whitespace-pre-wrap text-muted">{o.address}</p>
                          {o.razorpay_payment_id && (
                            <div className="mt-4">
                              <p className="label-eyebrow mb-1">Payment ID</p>
                              <p className="font-mono text-xs text-muted">{o.razorpay_payment_id}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}







// import React, { useEffect, useState } from "react";
// import { api, formatINR } from "../../lib/api";

// export default function AdminOrders() {
//   const [orders, setOrders] = useState([]);
//   useEffect(() => {
//     api.get("/admin/orders").then((r) => setOrders(r.data)).catch(() => {});
//   }, []);

//   return (
//     <div className="p-10" data-testid="admin-orders-page">
//       <p className="label-eyebrow mb-2">Sales</p>
//       <h1 className="font-serif text-4xl mb-10">Orders</h1>

//       <div className="border border-line bg-card">
//         <table className="w-full text-left">
//           <thead>
//             <tr className="border-b border-line">
//               <th className="p-4 label-eyebrow">Order</th>
//               <th className="p-4 label-eyebrow">Customer</th>
//               <th className="p-4 label-eyebrow">Items</th>
//               <th className="p-4 label-eyebrow">Total</th>
//               <th className="p-4 label-eyebrow">Status</th>
//               <th className="p-4 label-eyebrow">Date</th>
//             </tr>
//           </thead>
//           <tbody>
//             {orders.length === 0 && (
//               <tr><td colSpan={6} className="p-10 text-center text-muted">No orders yet.</td></tr>
//             )}
//             {orders.map((o) => (
//               <tr key={o.id} className="border-b border-line" data-testid={`order-row-${o.id}`}>
//                 <td className="p-4 font-mono text-xs">{o.id.slice(-8)}</td>
//                 <td className="p-4">
//                   <div>{o.customer_name}</div>
//                   <div className="text-xs text-muted">{o.email}</div>
//                 </td>
//                 <td className="p-4 text-sm">{o.items.length} items</td>
//                 <td className="p-4 font-serif text-lg">{formatINR(o.total)}</td>
//                 <td className="p-4">
//                   <span className={`text-xs tracking-widest uppercase px-2 py-1 ${o.payment_status === "paid" ? "bg-surface text-forest" : "bg-line text-muted"}`}>
//                     {o.payment_status}
//                   </span>
//                 </td>
//                 <td className="p-4 text-xs text-muted">{new Date(o.created_at).toLocaleString()}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }