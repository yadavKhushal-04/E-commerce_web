import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { api } from "../../lib/api";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data } = await api.post("/auth/login", { email, password });
      localStorage.setItem("admin_token", data.token);
      navigate("/admin");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6" data-testid="admin-login-page">
      <form onSubmit={onSubmit} className="w-full max-w-md border border-line p-10 bg-card" data-testid="admin-login-form">
        <p className="label-eyebrow mb-3">Studio Access</p>
        <h1 className="font-serif text-4xl mb-8">Sign in</h1>
        <div className="space-y-6">
          <div>
            <label className="label-eyebrow block mb-1">Email</label>
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
              data-testid="admin-email-input"
              className="w-full bg-transparent border-b border-line pb-2 pt-1 focus:border-forest focus:outline-none"
            />
          </div>
          <div>
            <label className="label-eyebrow block mb-1">Password</label>
            <input
              type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
              data-testid="admin-password-input"
              className="w-full bg-transparent border-b border-line pb-2 pt-1 focus:border-forest focus:outline-none"
            />
          </div>
        </div>
        <button
          type="submit" disabled={submitting}
          data-testid="admin-login-button"
          className="mt-10 w-full bg-forest text-bg py-4 text-xs tracking-[0.25em] uppercase hover:bg-forest-dark transition-colors disabled:opacity-50"
        >
          {submitting ? "Signing in…" : "Sign In"}
        </button>
      </form>
    </div>
  );
}