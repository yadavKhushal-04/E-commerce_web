import React, { createContext, useContext, useEffect, useState } from "react";
import { api } from "../lib/api.js";

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);       // { id, name, email }
  const [loading, setLoading] = useState(true);  // true while checking session on mount

  // On mount: check if a stored customer token is still valid
  useEffect(() => {
    const token = localStorage.getItem("customer_token");
    if (!token) { setLoading(false); return; }
    api.get("/customer/me")
      .then((r) => setUser(r.data))
      .catch(() => localStorage.removeItem("customer_token"))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post("/customer/login", { email, password });
    localStorage.setItem("customer_token", data.token);
    setUser(data.user);
    return data.user;
  };

  const register = async (name, email, password) => {
    const { data } = await api.post("/customer/register", { name, email, password });
    localStorage.setItem("customer_token", data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    await api.post("/customer/logout").catch(() => {});
    localStorage.removeItem("customer_token");
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);