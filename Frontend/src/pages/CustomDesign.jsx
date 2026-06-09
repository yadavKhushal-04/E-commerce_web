import React, { useState } from "react";
import { Upload, X } from "lucide-react";
import { toast } from "sonner";
import { api, fileUrl } from "../lib/api";

export default function CustomDesign() {
  const [form, setForm] = useState({
    customer_name: "", email: "", phone: "", notes: "", measurements: "",
  });
  const [images, setImages] = useState([]); // array of storage paths
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleFiles = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    try {
      for (const f of files) {
        const fd = new FormData();
        fd.append("file", f);
        const { data } = await api.post("/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
        setImages((prev) => [...prev, data.path]);
      }
      toast.success("Reference uploaded");
    } catch (err) {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/custom-requests", { ...form, images });
      setSubmitted(true);
    } catch (err) {
      toast.error("Could not send request");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="px-6 md:px-12 lg:px-24 py-32 max-w-2xl mx-auto text-center" data-testid="custom-submitted">
        <p className="label-eyebrow mb-4">Request Received</p>
        <h1 className="font-serif text-5xl md:text-6xl">Thank you.</h1>
        <p className="mt-6 text-muted leading-relaxed">
          Our atelier will review your custom design request and reach out within 24–48 hours with sketches, fabric options, and a quote.
        </p>
      </div>
    );
  }

  return (
    <div className="px-6 md:px-12 lg:px-24 py-16" data-testid="custom-design-page">
      <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-start">
        <div className="lg:sticky lg:top-32">
          <p className="label-eyebrow mb-3">Bespoke</p>
          <h1 className="font-serif text-5xl md:text-6xl leading-[1.05]">
            Design something <span className="italic text-forest">just for you.</span>
          </h1>
          <p className="mt-6 text-muted leading-relaxed">
            Send us a sketch, an inspiration image, or describe a piece you've always wanted. Our master tailors will translate it into a one-of-a-kind garment, made to your measurements.
          </p>
          <div className="mt-8 aspect-[4/5] overflow-hidden bg-surface">
            <img
              src="https://images.unsplash.com/photo-1606501126768-b78d4569d3f9?w=1200"
              alt="Tailoring"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-10" data-testid="custom-form">
          <div>
            <p className="label-eyebrow mb-6">Tell us about you</p>
            <div className="space-y-6">
              <Field name="customer_name" label="Name" value={form.customer_name} onChange={onChange} />
              <Field name="email" label="Email" type="email" value={form.email} onChange={onChange} />
              <Field name="phone" label="Phone (optional)" value={form.phone} onChange={onChange} required={false} />
            </div>
          </div>

          <div>
            <label className="label-eyebrow block mb-3">Your Vision</label>
            <textarea
              name="notes" required value={form.notes} onChange={onChange}
              data-testid="custom-notes"
              rows={5}
              placeholder="Describe what you'd like to create — style, fabric, occasion, colors…"
              className="w-full bg-transparent border-b border-line pb-2 pt-4 focus:border-forest focus:outline-none"
            />
          </div>

          <div>
            <label className="label-eyebrow block mb-3">Measurements (optional)</label>
            <textarea
              name="measurements" value={form.measurements} onChange={onChange}
              data-testid="custom-measurements"
              rows={3}
              placeholder="Bust, Waist, Hips, Shoulder, Length… we'll guide you if unsure."
              className="w-full bg-transparent border-b border-line pb-2 pt-4 focus:border-forest focus:outline-none"
            />
          </div>

          <div>
            <label className="label-eyebrow block mb-3">Reference Images</label>
            <div className="border border-dashed border-line p-6 text-center">
              <label className="cursor-pointer inline-flex items-center gap-3 text-sm" data-testid="upload-label">
                <Upload className="w-4 h-4" strokeWidth={1.25} />
                {uploading ? "Uploading…" : "Upload sketches or inspiration images"}
                <input
                  type="file" accept="image/*" multiple onChange={handleFiles}
                  className="hidden" disabled={uploading}
                  data-testid="custom-file-input"
                />
              </label>
              <p className="text-xs text-muted mt-2">JPG / PNG / WEBP up to 10MB each</p>
            </div>

            {images.length > 0 && (
              <div className="grid grid-cols-3 md:grid-cols-4 gap-3 mt-4" data-testid="uploaded-images">
                {images.map((p, i) => (
                  <div key={i} className="relative aspect-square bg-surface">
                    <img src={fileUrl(p)} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setImages(images.filter((_, idx) => idx !== i))}
                      className="absolute top-1 right-1 bg-bg p-1"
                      aria-label="Remove"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit" disabled={submitting}
            data-testid="custom-submit-button"
            className="w-full bg-forest text-bg py-5 text-xs tracking-[0.25em] uppercase hover:bg-forest-dark transition-colors disabled:opacity-50"
          >
            {submitting ? "Sending…" : "Send Request"}
          </button>
        </form>
      </div>
    </div>
  );
}

function Field({ name, label, value, onChange, type = "text", required = true }) {
  return (
    <div>
      <label className="label-eyebrow block mb-1">{label}</label>
      <input
        name={name} type={type} value={value} onChange={onChange} required={required}
        data-testid={`custom-${name}`}
        className="w-full bg-transparent border-b border-line pb-2 pt-1 focus:border-forest focus:outline-none"
      />
    </div>
  );
}