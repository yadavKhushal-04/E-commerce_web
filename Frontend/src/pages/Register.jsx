import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useUser } from "../context/UserContext.js";

export default function Register() {
  const { register } = useUser();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      toast.error("Passwords don't match.");
      return;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    setSubmitting(true);
    try {
      await register(name, email, password);
      toast.success("Account created. Welcome!");
      navigate("/account");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Registration failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <p className="label-eyebrow mb-3 text-center">Join the Atelier</p>
        <h1 className="font-serif text-4xl text-center mb-10">Create Account</h1>

        <form onSubmit={onSubmit} className="border border-line p-10 bg-card space-y-6">
          <div>
            <label className="label-eyebrow block mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full bg-transparent border-b border-line pb-2 pt-1 focus:border-forest focus:outline-none"
            />
          </div>
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
          <div>
            <label className="label-eyebrow block mb-1">Confirm Password</label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              className="w-full bg-transparent border-b border-line pb-2 pt-1 focus:border-forest focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-forest text-bg py-4 text-xs tracking-[0.25em] uppercase hover:bg-forest-dark transition-colors disabled:opacity-50 mt-4"
          >
            {submitting ? "Creating account…" : "Create Account"}
          </button>
        </form>

        <p className="text-center text-sm text-muted mt-6">
          Already have an account?{" "}
          <Link to="/login" className="hover-underline text-ink">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}