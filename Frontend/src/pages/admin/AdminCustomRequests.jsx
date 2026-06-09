import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { api, fileUrl } from "../../lib/api";

const STATUSES = ["new", "reviewing", "quoted", "in-production", "completed", "declined"];

export default function AdminCustomRequests() {
  const [items, setItems] = useState([]);

  const load = () => api.get("/admin/custom-requests").then((r) => setItems(r.data));
  useEffect(() => { load(); }, []);

  const updateStatus = async (id, status) => {
    await api.put(`/admin/custom-requests/${id}/status`, { status });
    toast.success("Updated");
    load();
  };

  return (
    <div className="p-10" data-testid="admin-custom-page">
      <p className="label-eyebrow mb-2">Bespoke</p>
      <h1 className="font-serif text-4xl mb-10">Custom Design Requests</h1>

      {items.length === 0 && <p className="text-muted">No requests yet.</p>}

      <div className="grid lg:grid-cols-2 gap-6">
        {items.map((r) => (
          <div key={r.id} className="border border-line bg-card p-6" data-testid={`custom-row-${r.id}`}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="font-serif text-2xl">{r.customer_name}</p>
                <p className="text-xs text-muted">{r.email} · {r.phone || "—"}</p>
                <p className="text-xs text-muted mt-1">{new Date(r.created_at).toLocaleString()}</p>
              </div>
              <select
                value={r.status} onChange={(e) => updateStatus(r.id, e.target.value)}
                className="bg-surface border border-line px-3 py-2 text-xs tracking-widest uppercase"
                data-testid={`status-select-${r.id}`}
              >
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="space-y-3">
              <div>
                <p className="label-eyebrow mb-1">Vision</p>
                <p className="text-sm whitespace-pre-wrap">{r.notes}</p>
              </div>
              {r.measurements && (
                <div>
                  <p className="label-eyebrow mb-1">Measurements</p>
                  <p className="text-sm whitespace-pre-wrap">{r.measurements}</p>
                </div>
              )}
              {r.images?.length > 0 && (
                <div>
                  <p className="label-eyebrow mb-2">References</p>
                  <div className="grid grid-cols-4 gap-2">
                    {r.images.map((p, i) => (
                      <a key={i} href={fileUrl(p)} target="_blank" rel="noreferrer" className="aspect-square bg-surface block">
                        <img src={fileUrl(p)} alt="" className="w-full h-full object-cover" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}