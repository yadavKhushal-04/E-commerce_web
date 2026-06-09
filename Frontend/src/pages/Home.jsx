import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { api } from "../lib/api";
import ProductCard from "../components/ProductCard";

export default function Home() {
  const [products, setProducts] = useState([]);
  useEffect(() => {
    api.get("/products").then((r) => setProducts(r.data.slice(0, 4))).catch(() => {});
  }, []);

  return (
    <div data-testid="home-page">
      {/* HERO */}
      <section className="relative grid lg:grid-cols-12 min-h-[88vh] border-b border-line">
        <div className="lg:col-span-5 flex items-center px-6 md:px-12 lg:px-20 py-20 relative">
          <div className="grain absolute inset-0" />
          <div className="relative z-10 max-w-md fade-in">
            <p className="label-eyebrow mb-6">Spring · Edit 01</p>
            <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl leading-[0.95]">
              Slow clothes,<br/>
              <span className="italic text-forest">deeply loved.</span>
            </h1>
            <p className="mt-8 text-muted leading-relaxed">
              Hand-loomed textiles, plant dyes, and patient tailoring. Made in small batches in our studio in India — for a wardrobe you wear for decades, not seasons.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                to="/shop"
                className="bg-forest text-bg px-8 py-4 text-xs tracking-[0.25em] uppercase hover:bg-forest-dark transition-colors inline-flex items-center gap-3"
                data-testid="hero-shop-button"
              >
                Shop the Edit <ArrowRight className="w-4 h-4" strokeWidth={1.25} />
              </Link>
              <Link
                to="/custom"
                className="border border-forest text-forest px-8 py-4 text-xs tracking-[0.25em] uppercase hover:bg-surface transition-colors"
                data-testid="hero-custom-button"
              >
                Design with Us
              </Link>
            </div>
          </div>
        </div>
        <div className="lg:col-span-7 relative min-h-[60vh] lg:min-h-full bg-surface">
          <img
            src="https://images.pexels.com/photos/7789139/pexels-photo-7789139.jpeg?w=1600"
            alt="Atelier"
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
      </section>

      {/* FEATURED */}
      <section className="px-6 md:px-12 lg:px-24 py-24 md:py-32">
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="label-eyebrow mb-3">The Collection</p>
            <h2 className="font-serif text-4xl md:text-5xl">Crafted, not manufactured.</h2>
          </div>
          <Link to="/shop" className="hidden md:inline-block label-eyebrow hover-underline" data-testid="view-all-link">
            View All →
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {products.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
        </div>
      </section>

      {/* CUSTOM DESIGN CTA */}
      <section className="relative grid lg:grid-cols-2 border-t border-line">
        <div className="aspect-[4/5] lg:aspect-auto bg-surface relative overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1606501126768-b78d4569d3f9?w=1400"
            alt="Custom tailoring"
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
        <div className="flex items-center px-6 md:px-12 lg:px-20 py-20">
          <div className="max-w-md">
            <p className="label-eyebrow mb-6">Bespoke</p>
            <h2 className="font-serif text-4xl md:text-5xl leading-[1.05]">
              Bring us your <span className="italic">vision.</span>
            </h2>
            <p className="mt-6 text-muted leading-relaxed">
              Send a sketch, a reference image, or just an idea. Our team will translate it into a one-of-a-kind piece, tailored exactly to your measurements.
            </p>
            <Link
              to="/custom"
              className="mt-10 inline-flex items-center gap-3 border border-forest text-forest px-8 py-4 text-xs tracking-[0.25em] uppercase hover:bg-surface transition-colors"
              data-testid="cta-custom-button"
            >
              Start a Custom Order <ArrowRight className="w-4 h-4" strokeWidth={1.25} />
            </Link>
          </div>
        </div>
      </section>

      {/* STORY STRIP */}
      <section className="bg-surface border-t border-line px-6 md:px-12 lg:px-24 py-20 text-center">
        <p className="label-eyebrow mb-6">Our Promise</p>
        <p className="font-serif text-3xl md:text-4xl lg:text-5xl max-w-4xl mx-auto leading-tight">
          Every garment is cut, stitched, and finished by hand in our studio — so the people who make your clothes are paid fairly, and the pieces you receive last a lifetime.
        </p>
      </section>
    </div>
  );
}