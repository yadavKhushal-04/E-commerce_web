import React, { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { api } from "../../lib/api";

export default function AdminLayout() {
  const [me, setMe] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/auth/me").then((r) => setMe(r.data)).catch(() => {
      localStorage.removeItem("admin_token");
      navigate("/admin/login");
    });
  }, [navigate]);

  const token = localStorage.getItem("admin_token");
  if (!token) return <Navigate to="/admin/login" />;

  const logout = async () => {
    await api.post("/auth/logout").catch(() => {});
    localStorage.removeItem("admin_token");
    navigate("/admin/login");
  };

  if (!me) return <div className="px-6 py-32 text-center text-muted">Loading…</div>;

  const link = ({ isActive }) =>
    `block px-4 py-3 text-xs tracking-widest uppercase border-l-2 transition-colors ${isActive ? "border-forest text-forest bg-surface" : "border-transparent text-muted hover:text-ink"}`;

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 border-r border-line bg-bg flex flex-col">
        <div className="p-6 border-b border-line">
          <p className="font-serif text-2xl">Rekhay<span className="text-clay">.</span></p>
          <p className="label-eyebrow mt-1">Studio Panel</p>
        </div>
        <nav className="py-4 flex-1">
          <NavLink to="/admin" end className={link} data-testid="admin-nav-products">Products</NavLink>
          <NavLink to="/admin/orders" className={link} data-testid="admin-nav-orders">Orders</NavLink>
          <NavLink to="/admin/custom-requests" className={link} data-testid="admin-nav-custom">Custom Requests</NavLink>
        </nav>
        <div className="p-6 border-t border-line">
          <p className="text-xs text-muted truncate">{me.email}</p>
          <button onClick={logout} data-testid="admin-logout" className="mt-3 text-xs tracking-widest uppercase hover-underline text-clay">Sign out</button>
        </div>
      </aside>
      <main className="flex-1 bg-bg">
        <Outlet />
      </main>
    </div>
  );
}