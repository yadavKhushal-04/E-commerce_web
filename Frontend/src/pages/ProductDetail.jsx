import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { toast } from "sonner";
import { api, fileUrl, formatINR } from "../lib/api";
import { useCart } from "../context/CartContext";

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [size, setSize] = useState(null);
  const [imgIdx, setImgIdx] = useState(0);
  const { add } = useCart();

  useEffect(() => {
    api.get(`/products/${id}`).then((r) => {
      setProduct(r.data);
      setSize(r.data.sizes?.[0] || null);
    }).catch(() => {});
  }, [id]);

  if (!product) return <div className="px-6 py-32 text-center text-muted">Loading…</div>;

  const handleAdd = () => {
    if (product.sizes?.length && !size) { toast.error("Choose a size"); return; }
    add({
      product_id: product.id,
      name: product.name,
      price: product.price,
      size,
      quantity: 1,
      image: product.images?.[0],
    });
    toast.success("Added to bag");
  };

  return (
    <div className="px-6 md:px-12 lg:px-24 py-12" data-testid="product-detail-page">
      <Link to="/shop" className="label-eyebrow hover-underline">← Back to shop</Link>
      <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 mt-8">
        {/* Image gallery */}
        <div>
          <div className="aspect-[3/4] bg-surface overflow-hidden">
            <img
              src={fileUrl(product.images?.[imgIdx] || product.images?.[0])}
              alt={product.name}
              className="w-full h-full object-cover"
              data-testid="product-main-image"
            />
          </div>
          {product.images?.length > 1 && (
            <div className="grid grid-cols-4 gap-2 mt-3">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setImgIdx(i)}
                  className={`aspect-square bg-surface overflow-hidden border ${imgIdx === i ? "border-forest" : "border-transparent"}`}
                >
                  <img src={fileUrl(img)} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="lg:py-8">
          <p className="label-eyebrow">{product.category}</p>
          <h1 className="font-serif text-4xl md:text-5xl mt-3">{product.name}</h1>
          <p className="font-serif text-3xl mt-4 text-forest" data-testid="product-price">{formatINR(product.price)}</p>
          <p className="mt-8 text-muted leading-relaxed">{product.description}</p>

          {product.sizes?.length > 0 && (
            <div className="mt-10">
              <p className="label-eyebrow mb-3">Size</p>
              <div className="flex flex-wrap gap-2" data-testid="size-options">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    data-testid={`size-${s}`}
                    className={`px-5 py-3 text-xs tracking-widest border transition-colors ${size === s ? "bg-forest text-bg border-forest" : "border-line text-ink hover:border-forest"}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-10 flex flex-col gap-3">
            <button 
              onClick={handleAdd}
              disabled={product.stock === 0}
              data-testid="add-to-bag-button"
              className="bg-forest text-bg py-5 text-xs tracking-[0.25em] uppercase hover:bg-forest-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
            {product.stock === 0 ? "Sold Out" : "Add to Bag"}
            </button>
              {/* Add to Bag
            </button> */}
            <Link
              to="/custom"
              className="border border-forest text-forest py-5 text-xs tracking-[0.25em] uppercase text-center hover:bg-surface transition-colors"
            >
              Customize this Piece
            </Link>
          </div>

          <div className="mt-12 pt-8 border-t border-line space-y-2 text-sm text-muted">
            <p>· Handcrafted, ships in 5-7 business days</p>
            <p>· Free shipping over ₹1,499</p>
            <p>· 7-day exchange on unworn pieces</p>
          </div>
        </div>
      </div>
    </div>
  );
}