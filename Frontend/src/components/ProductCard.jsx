import React from "react";
import { Link } from "react-router-dom";
import { fileUrl, formatINR } from "../lib/api";

export default function ProductCard({ product, index = 0 }) {
  return (
    <Link
      to={`/product/${product.id}`}
      className="group block fade-in"
      style={{ animationDelay: `${index * 60}ms` }}
      data-testid={`product-card-${product.id}`}
    >
      <div className="relative overflow-hidden bg-surface aspect-[3/4]">
        <img
          src={fileUrl(product.images?.[0])}
          alt={product.name}
          className="w-full h-full object-cover zoom-img"
        />
        <span className="absolute top-4 left-4 label-eyebrow bg-bg/80 px-2 py-1">{product.category}</span>
      </div>
      <div className="mt-4 flex justify-between items-start gap-2">
        <div>
          <h3 className="font-serif text-xl leading-tight group-hover:text-forest transition-colors">
            {product.name}
          </h3>
          <p className="label-eyebrow mt-1">{product.sizes?.join(" · ") || ""}</p>
        </div>
        <p className="font-serif text-lg whitespace-nowrap">{formatINR(product.price)}</p>
      </div>
    </Link>
  );
}