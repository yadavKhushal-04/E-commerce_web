import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Upload, X } from "lucide-react";
import { api, fileUrl, formatINR } from "../../lib/api";

const empty = {
  name: "", description: "", price: 0, sizes: [], images: [],
  category: "Apparel", stock: 10,
};

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const load = () => api.get("/products").then((r) => setProducts(r.data));
  useEffect(() => { load(); }, []);

  const startNew = () => { setEditing({ ...empty }); setShowForm(true); };
  const startEdit = (p) => { setEditing({ ...p }); setShowForm(true); };
  const cancel = () => { setEditing(null); setShowForm(false); };

  const save = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...editing,
        price: parseInt(editing.price, 10),
        stock: parseInt(editing.stock, 10) || 0,
        sizes: Array.isArray(editing.sizes) ? editing.sizes : String(editing.sizes).split(",").map((s) => s.trim()).filter(Boolean),
      };
      if (editing.id) {
        await api.put(`/products/${editing.id}`, payload);
      } else {
        await api.post("/products", payload);
      }
      toast.success("Saved");
      await load();
      cancel();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Save failed");
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    await api.delete(`/products/${id}`);
    toast.success("Deleted");
    load();
  };

  const onUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    for (const f of files) {
      const fd = new FormData();
      fd.append("file", f);
      const { data } = await api.post("/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
      setEditing((prev) => ({ ...prev, images: [...(prev.images || []), data.path] }));
    }
    e.target.value = "";
  };

  return (
    <div className="p-10" data-testid="admin-products-page">
      <div className="flex items-center justify-between mb-10">
        <div>
          <p className="label-eyebrow mb-2">Catalog</p>
          <h1 className="font-serif text-4xl">Products</h1>
        </div>
        <button
          onClick={startNew}
          data-testid="add-product-button"
          className="bg-forest text-bg px-6 py-3 text-xs tracking-[0.25em] uppercase hover:bg-forest-dark inline-flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {showForm && editing && (
        <form onSubmit={save} className="bg-card border border-line p-8 mb-10 grid md:grid-cols-2 gap-6" data-testid="product-form">
          <Field label="Name" value={editing.name} onChange={(v) => setEditing({ ...editing, name: v })} testId="product-name" />
          <Field label="Category" value={editing.category} onChange={(v) => setEditing({ ...editing, category: v })} testId="product-category" />
          <Field label="Price (₹)" type="number" value={editing.price} onChange={(v) => setEditing({ ...editing, price: v })} testId="product-price" />
          <Field label="Stock" type="number" value={editing.stock} onChange={(v) => setEditing({ ...editing, stock: v })} testId="product-stock" />
          <Field
            label="Sizes (comma separated)" value={Array.isArray(editing.sizes) ? editing.sizes.join(", ") : editing.sizes}
            onChange={(v) => setEditing({ ...editing, sizes: v })} testId="product-sizes"
            className="md:col-span-2"
          />
          <div className="md:col-span-2">
            <label className="label-eyebrow block mb-2">Description</label>
            <textarea
              required value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })}
              rows={4} data-testid="product-description"
              className="w-full bg-transparent border-b border-line pb-2 pt-2 focus:border-forest focus:outline-none"
            />
          </div>
          <div className="md:col-span-2">
            <label className="label-eyebrow block mb-2">Images</label>
            <div className="flex flex-wrap gap-3">
              {(editing.images || []).map((img, i) => (
                <div key={i} className="relative w-24 h-32 bg-surface">
                  <img src={fileUrl(img)} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setEditing({ ...editing, images: editing.images.filter((_, idx) => idx !== i) })}
                    className="absolute top-1 right-1 bg-bg p-1"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              <label className="w-24 h-32 border border-dashed border-line flex items-center justify-center cursor-pointer text-muted hover:border-forest">
                <Upload className="w-4 h-4" />
                <input type="file" accept="image/*" multiple onChange={onUpload} className="hidden" data-testid="product-image-upload" />
              </label>
            </div>
          </div>
          <div className="md:col-span-2 flex gap-3">
            <button type="submit" data-testid="save-product-button" className="bg-forest text-bg px-6 py-3 text-xs tracking-[0.25em] uppercase hover:bg-forest-dark">
              Save
            </button>
            <button type="button" onClick={cancel} className="border border-line px-6 py-3 text-xs tracking-[0.25em] uppercase">
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="border border-line bg-card">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-line">
              <th className="p-4 label-eyebrow">Image</th>
              <th className="p-4 label-eyebrow">Name</th>
              <th className="p-4 label-eyebrow">Category</th>
              <th className="p-4 label-eyebrow">Price</th>
              <th className="p-4 label-eyebrow">Stock</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-line hover:bg-surface/40" data-testid={`product-row-${p.id}`}>
                <td className="p-4"><img src={fileUrl(p.images?.[0])} alt="" className="w-12 h-16 object-cover bg-surface" /></td>
                <td className="p-4 font-serif text-lg">{p.name}</td>
                <td className="p-4 text-sm text-muted">{p.category}</td>
                <td className="p-4 text-sm">{formatINR(p.price)}</td>
                <td className="p-4 text-sm">{p.stock}</td>
                <td className="p-4 text-right">
                  <button onClick={() => startEdit(p)} className="text-xs tracking-widest uppercase hover-underline mr-4" data-testid={`edit-${p.id}`}>Edit</button>
                  <button onClick={() => remove(p.id)} className="text-xs tracking-widest uppercase text-clay hover-underline" data-testid={`delete-${p.id}`}>
                    <Trash2 className="w-3 h-3 inline" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", testId, className = "" }) {
  return (
    <div className={className}>
      <label className="label-eyebrow block mb-1">{label}</label>
      <input
        type={type} required value={value || ""} onChange={(e) => onChange(e.target.value)}
        data-testid={testId}
        className="w-full bg-transparent border-b border-line pb-2 pt-1 focus:border-forest focus:outline-none"
      />
    </div>
  );
}