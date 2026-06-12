import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { useUser } from "../context/UserContext.js";

export default function Login() {
  const { login } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/account";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.detail || "Invalid email or password.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <p className="label-eyebrow mb-3 text-center">Welcome Back</p>
        <h1 className="font-serif text-4xl text-center mb-10">Sign In</h1>

        <form onSubmit={onSubmit} className="border border-line p-10 bg-card space-y-6">
          <div>
            <label className="label-eyebrow block mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-transparent border-b border-line pb-2 pt-1 focus:border-forest focus:outline-none"
            />
          </div>
          <div>
            <label className="label-eyebrow block mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-transparent border-b border-line pb-2 pt-1 focus:border-forest focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-forest text-bg py-4 text-xs tracking-[0.25em] uppercase hover:bg-forest-dark transition-colors disabled:opacity-50 mt-4"
          >
            {submitting ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <p className="text-center text-sm text-muted mt-6">
          Don't have an account?{" "}
          <Link to="/register" className="hover-underline text-ink">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}