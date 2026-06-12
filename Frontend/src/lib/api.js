import axios from "axios";

export const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const api = axios.create({
  baseURL: API,
  withCredentials: true,
});

// Attach Bearer token — admin token takes priority, then customer token
api.interceptors.request.use((config) => {
  const token =
    localStorage.getItem("admin_token") ||
    localStorage.getItem("customer_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const fileUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${API}/files/${path}`;
};

export const formatINR = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n || 0);









// import axios from "axios";

// export const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// export const api = axios.create({
//   baseURL: API,
//   withCredentials: true,
// });

// // Attach Bearer token (also used by admin endpoints)
// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem("admin_token");
//   if (token) config.headers.Authorization = `Bearer ${token}`;
//   return config;
// });

// export const fileUrl = (path) => {
//   if (!path) return "";
//   if (path.startsWith("http")) return path;
//   return `${API}/files/${path}`;
// };

// export const formatINR = (n) =>
//   new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n || 0);