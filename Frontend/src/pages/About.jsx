import React from "react";

export default function About() {
  return (
    <div className="px-6 md:px-12 lg:px-24 py-16 max-w-5xl mx-auto" data-testid="about-page">
      <p className="label-eyebrow mb-3">The Atelier</p>
      <h1 className="font-serif text-5xl md:text-6xl">A studio, not a factory.</h1>
      <div className="grid md:grid-cols-2 gap-16 mt-16">
        <p className="text-lg text-muted leading-relaxed">
          Rekhay was born from a quiet rebellion against fast fashion — a return to clothes that are made slowly, by hand, by people we know by name. We work with cotton, linen, and silk woven on handlooms across India, dyed with natural pigments, and stitched in our small studio.
        </p>
        <p className="text-lg text-muted leading-relaxed">
          Each piece is finished entirely by hand. We don't have collections that drop and disappear. We have a wardrobe that evolves — quietly, intentionally, season after season — to be inherited rather than discarded.
        </p>
      </div>
      <div className="mt-20 aspect-[16/9] overflow-hidden bg-surface">
        <img src="https://images.unsplash.com/photo-1606501126768-b78d4569d3f9?w=1800" alt="Atelier" className="w-full h-full object-cover" />
      </div>
    </div>
  );
}