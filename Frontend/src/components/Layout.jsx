import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { ShoppingBag, Menu, X, User } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useUser } from "../context/UserContext";

export default function Layout({ children }) {
  const { count, setOpen } = useCart();
  const { user } = useUser();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const navItem = ({ isActive }) =>
    `text-sm tracking-widest uppercase hover-underline ${isActive ? "text-forest" : "text-ink"} transition-colors`;

  return (
    <div className="min-h-screen bg-bg text-ink flex flex-col">
      {/* Announcement bar */}
      <div className="bg-forest text-bg overflow-hidden">
        <div className="marquee py-2 text-xs tracking-[0.3em] uppercase">
          {Array.from({ length: 2 }).map((_, i) => (
            <span key={i} className="px-12 flex gap-12 shrink-0">
              <span>Handwoven in India</span>
              <span>•</span>
              <span>Custom Designs Welcomed</span>
              <span>•</span>
              <span>Free Shipping above ₹1,499</span>
              <span>•</span>
              <span>Crafted Slowly. Worn Forever.</span>
              <span>•</span>
            </span>
          ))}
        </div>
      </div>

      {/* Nav */}
      <header className="border-b border-line bg-bg/80 backdrop-blur sticky top-0 z-40">
        <div className="px-6 md:px-12 lg:px-24 py-5 flex items-center justify-between">
          <Link to="/" className="font-serif text-2xl tracking-tight" data-testid="brand-logo">
            Rekhay
            <span className="text-clay">.</span>
          </Link>
          <nav className="hidden md:flex items-center gap-10">
            <NavLink to="/shop" className={navItem} data-testid="nav-shop">Shop</NavLink>
            <NavLink to="/custom" className={navItem} data-testid="nav-custom">Custom Design</NavLink>
            <NavLink to="/about" className={navItem} data-testid="nav-about">Atelier</NavLink>
          </nav>
          <div className="flex items-center gap-4">
            {/* User icon — links to /account if logged in, /login if not */}
            <Link
              to={user ? "/account" : "/login"}
              className="p-2 relative"
              aria-label={user ? "My account" : "Sign in"}
              data-testid="user-icon"
            >
              <User className="w-5 h-5" strokeWidth={1.25} />
              {/* Small green dot when logged in */}
              {user && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-forest" />
              )}
            </Link>

            <button
              onClick={() => setOpen(true)}
              className="relative p-2"
              data-testid="open-cart-button"
              aria-label="Open cart"
            >
              <ShoppingBag className="w-5 h-5" strokeWidth={1.25} />
              {count > 0 && (
                <span
                  data-testid="cart-count"
                  className="absolute -top-1 -right-1 text-[10px] bg-forest text-bg w-4 h-4 flex items-center justify-center"
                >
                  {count}
                </span>
              )}
            </button>
            <button
              className="md:hidden p-2"
              onClick={() => setMobileOpen((v) => !v)}
              data-testid="mobile-menu-button"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
        {mobileOpen && (
          <div className="md:hidden border-t border-line px-6 py-6 flex flex-col gap-5">
            <NavLink to="/shop" onClick={() => setMobileOpen(false)} className={navItem}>Shop</NavLink>
            <NavLink to="/custom" onClick={() => setMobileOpen(false)} className={navItem}>Custom Design</NavLink>
            <NavLink to="/about" onClick={() => setMobileOpen(false)} className={navItem}>Atelier</NavLink>
            <NavLink to={user ? "/account" : "/login"} onClick={() => setMobileOpen(false)} className={navItem}>
              {user ? "My Account" : "Sign In"}
            </NavLink>
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t border-line mt-24">
        <div className="px-6 md:px-12 lg:px-24 py-16 grid md:grid-cols-4 gap-10">
          <div>
            <h3 className="font-serif text-3xl">Rekhay<span className="text-clay">.</span></h3>
            <p className="mt-4 text-sm text-muted leading-relaxed max-w-xs">
              An Indian atelier crafting heirloom-quality clothing with handloom textiles and small-batch tailoring.
            </p>
          </div>
          <div>
            <p className="label-eyebrow mb-4">Shop</p>
            <ul className="space-y-2 text-sm">
              <li><Link to="/shop" className="hover-underline">All Pieces</Link></li>
              <li><Link to="/custom" className="hover-underline">Custom Design</Link></li>
            </ul>
          </div>
          <div>
            <p className="label-eyebrow mb-4">Contact</p>
            <ul className="space-y-2 text-sm text-muted">
              <li>hello@rekhay.in</li>
              <li>Mon — Sat, 10am to 7pm IST</li>
            </ul>
          </div>
          <div>
            <p className="label-eyebrow mb-4">Atelier</p>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="hover-underline">Our Story</Link></li>
              <li><Link to="/account" className="hover-underline">{user ? "My Account" : "Sign In"}</Link></li>
              <li><Link to="/admin/login" className="hover-underline text-muted">Studio Login</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-line py-6 px-6 md:px-12 lg:px-24 flex flex-col md:flex-row justify-between gap-2 text-xs text-muted">
          <span>© {new Date().getFullYear()} Rekhay Atelier. All rights reserved.</span>
          <span>Made slowly, in India.</span>
        </div>
      </footer>
    </div>
  );
}









// import React from "react";
// import { Link, NavLink, useNavigate } from "react-router-dom";
// import { ShoppingBag, Menu, X } from "lucide-react";
// import { useCart } from "../context/CartContext";

// export default function Layout({ children }) {
//   const { count, setOpen } = useCart();
//   const [mobileOpen, setMobileOpen] = React.useState(false);

//   const navItem = ({ isActive }) =>
//     `text-sm tracking-widest uppercase hover-underline ${isActive ? "text-forest" : "text-ink"} transition-colors`;

//   return (
//     <div className="min-h-screen bg-bg text-ink flex flex-col">
//       {/* Announcement bar */}
//       <div className="bg-forest text-bg overflow-hidden">
//         <div className="marquee py-2 text-xs tracking-[0.3em] uppercase">
//           {Array.from({ length: 2 }).map((_, i) => (
//             <span key={i} className="px-12 flex gap-12 shrink-0">
//               <span>Handwoven in India</span>
//               <span>•</span>
//               <span>Custom Designs Welcomed</span>
//               <span>•</span>
//               <span>Free Shipping above ₹2,499</span>
//               <span>•</span>
//               <span>Crafted Slowly. Worn Forever.</span>
//               <span>•</span>
//             </span>
//           ))}
//         </div>
//       </div>

//       {/* Nav */}
//       <header className="border-b border-line bg-bg/80 backdrop-blur sticky top-0 z-40">
//         <div className="px-6 md:px-12 lg:px-24 py-5 flex items-center justify-between">
//           <Link to="/" className="font-serif text-2xl tracking-tight" data-testid="brand-logo">
//             Rekhay
//             <span className="text-clay">.</span>
//           </Link>
//           <nav className="hidden md:flex items-center gap-10">
//             <NavLink to="/shop" className={navItem} data-testid="nav-shop">Shop</NavLink>
//             <NavLink to="/custom" className={navItem} data-testid="nav-custom">Custom Design</NavLink>
//             <NavLink to="/about" className={navItem} data-testid="nav-about">Atelier</NavLink>
//           </nav>
//           <div className="flex items-center gap-4">
//             <button
//               onClick={() => setOpen(true)}
//               className="relative p-2"
//               data-testid="open-cart-button"
//               aria-label="Open cart"
//             >
//               <ShoppingBag className="w-5 h-5" strokeWidth={1.25} />
//               {count > 0 && (
//                 <span
//                   data-testid="cart-count"
//                   className="absolute -top-1 -right-1 text-[10px] bg-forest text-bg w-4 h-4 flex items-center justify-center"
//                 >
//                   {count}
//                 </span>
//               )}
//             </button>
//             <button
//               className="md:hidden p-2"
//               onClick={() => setMobileOpen((v) => !v)}
//               data-testid="mobile-menu-button"
//               aria-label="Toggle menu"
//             >
//               {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
//             </button>
//           </div>
//         </div>
//         {mobileOpen && (
//           <div className="md:hidden border-t border-line px-6 py-6 flex flex-col gap-5">
//             <NavLink to="/shop" onClick={() => setMobileOpen(false)} className={navItem}>Shop</NavLink>
//             <NavLink to="/custom" onClick={() => setMobileOpen(false)} className={navItem}>Custom Design</NavLink>
//             <NavLink to="/about" onClick={() => setMobileOpen(false)} className={navItem}>Atelier</NavLink>
//           </div>
//         )}
//       </header>

//       <main className="flex-1">{children}</main>

//       {/* Footer */}
//       <footer className="border-t border-line mt-24">
//         <div className="px-6 md:px-12 lg:px-24 py-16 grid md:grid-cols-4 gap-10">
//           <div>
//             <h3 className="font-serif text-3xl">Rekhay<span className="text-clay">.</span></h3>
//             <p className="mt-4 text-sm text-muted leading-relaxed max-w-xs">
//               An Indian atelier crafting heirloom-quality clothing with handloom textiles and small-batch tailoring.
//             </p>
//           </div>
//           <div>
//             <p className="label-eyebrow mb-4">Shop</p>
//             <ul className="space-y-2 text-sm">
//               <li><Link to="/shop" className="hover-underline">All Pieces</Link></li>
//               <li><Link to="/custom" className="hover-underline">Custom Design</Link></li>
//             </ul>
//           </div>
//           <div>
//             <p className="label-eyebrow mb-4">Contact</p>
//             <ul className="space-y-2 text-sm text-muted">
//               <li>hello@rekhay.in</li>
//               <li>Mon — Sat, 10am to 7pm IST</li>
//             </ul>
//           </div>
//           <div>
//             <p className="label-eyebrow mb-4">Atelier</p>
//             <ul className="space-y-2 text-sm">
//               <li><Link to="/about" className="hover-underline">Our Story</Link></li>
//               <li><Link to="/admin/login" className="hover-underline text-muted">Studio Login</Link></li>
//             </ul>
//           </div>
//         </div>
//         <div className="border-t border-line py-6 px-6 md:px-12 lg:px-24 flex flex-col md:flex-row justify-between gap-2 text-xs text-muted">
//           <span>© {new Date().getFullYear()} Rekhay Atelier. All rights reserved.</span>
//           <span>Made slowly, in India.</span>
//         </div>
//       </footer>
//     </div>
//   );
// }