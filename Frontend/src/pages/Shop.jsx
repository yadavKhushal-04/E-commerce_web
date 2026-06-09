import React, { useEffect, useState, useMemo } from "react";
import { api } from "../lib/api";
import ProductCard from "../components/ProductCard";

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [filter, setFilter] = useState("All");
  const [sort, setSort] = useState("default");

  useEffect(() => {
    api.get("/products").then((r) => setProducts(r.data)).catch(() => {});
  }, []);

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(products.map((p) => p.category).filter(Boolean)))],
    [products],
  );

  const view = useMemo(() => {
    let list = filter === "All" ? products : products.filter((p) => p.category === filter);
    if (sort === "low") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "high") list = [...list].sort((a, b) => b.price - a.price);
    return list;
  }, [products, filter, sort]);

  return (
    <div data-testid="shop-page" className="px-6 md:px-12 lg:px-24 py-16">
      <header className="mb-14">
        <p className="label-eyebrow mb-3">The Edit</p>
        <h1 className="font-serif text-5xl md:text-6xl">All Pieces</h1>
        <p className="mt-4 text-muted max-w-xl">A curated selection of hand-crafted clothing, refreshed each season.</p>
      </header>

      <div className="flex flex-wrap items-center justify-between gap-6 mb-10 border-y border-line py-4">
        <div className="flex flex-wrap gap-4" data-testid="category-filters">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              data-testid={`filter-${c}`}
              className={`text-xs tracking-widest uppercase pb-1 border-b ${filter === c ? "border-forest text-forest" : "border-transparent text-muted hover:text-ink"}`}
            >
              {c}
            </button>
          ))}
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          data-testid="sort-select"
          className="bg-transparent border border-line px-4 py-2 text-xs tracking-widest uppercase"
        >
          <option value="default">Sort</option>
          <option value="low">Price: Low → High</option>
          <option value="high">Price: High → Low</option>
        </select>
      </div>

      {view.length === 0 ? (
        <p className="text-muted text-center py-32">No pieces here yet. Come back soon.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
          {view.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
        </div>
      )}
    </div>
  );
}