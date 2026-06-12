import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import "./App.css";

import { CartProvider } from "./context/CartContext";
import { UserProvider } from "./context/UserContext";
import Layout from "./components/Layout";
import CartDrawer from "./components/CartDrawer";

import Home from "./pages/Home";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import Checkout from "./pages/Checkout";
import OrderConfirmation from "./pages/OrderConfirmation";
import CustomDesign from "./pages/CustomDesign";
import About from "./pages/About";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Account from "./pages/Account";

import AdminLogin from "./pages/admin/AdminLogin";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminCustomRequests from "./pages/admin/AdminCustomRequests";

function Storefront({ children }) {
  return (
    <Layout>
      {children}
      <CartDrawer />
    </Layout>
  );
}

export default function App() {
  return (
    <UserProvider>
      <CartProvider>
        <BrowserRouter>
          <Toaster position="top-center" toastOptions={{ style: { fontFamily: "Manrope, sans-serif" } }} />
          <Routes>
            {/* Storefront */}
            <Route path="/" element={<Storefront><Home /></Storefront>} />
            <Route path="/shop" element={<Storefront><Shop /></Storefront>} />
            <Route path="/product/:id" element={<Storefront><ProductDetail /></Storefront>} />
            <Route path="/checkout" element={<Storefront><Checkout /></Storefront>} />
            <Route path="/order/:id" element={<Storefront><OrderConfirmation /></Storefront>} />
            <Route path="/custom" element={<Storefront><CustomDesign /></Storefront>} />
            <Route path="/about" element={<Storefront><About /></Storefront>} />

            {/* Customer auth */}
            <Route path="/login" element={<Storefront><Login /></Storefront>} />
            <Route path="/register" element={<Storefront><Register /></Storefront>} />
            <Route path="/account" element={<Storefront><Account /></Storefront>} />

            {/* Admin */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminProducts />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="custom-requests" element={<AdminCustomRequests />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </UserProvider>
  );
}









// import React from "react";
// import { BrowserRouter, Routes, Route } from "react-router-dom";
// import { Toaster } from "sonner";
// import "./App.css";

// import { CartProvider } from "./context/CartContext";
// import Layout from "./components/Layout";
// import CartDrawer from "./components/CartDrawer";

// import Home from "./pages/Home";
// import Shop from "./pages/Shop";
// import ProductDetail from "./pages/ProductDetail";
// import Checkout from "./pages/Checkout";
// import OrderConfirmation from "./pages/OrderConfirmation";
// import CustomDesign from "./pages/CustomDesign";
// import About from "./pages/About";

// import AdminLogin from "./pages/admin/AdminLogin";
// import AdminLayout from "./pages/admin/AdminLayout";
// import AdminProducts from "./pages/admin/AdminProducts";
// import AdminOrders from "./pages/admin/AdminOrders";
// import AdminCustomRequests from "./pages/admin/AdminCustomRequests";

// function Storefront({ children }) {
//   return (
//     <Layout>
//       {children}
//       <CartDrawer />
//     </Layout>
//   );
// }

// export default function App() {
//   return (
//     <CartProvider>
//       <BrowserRouter>
//         <Toaster position="top-center" toastOptions={{ style: { fontFamily: "Manrope, sans-serif" } }} />
//         <Routes>
//           {/* Storefront */}
//           <Route path="/" element={<Storefront><Home /></Storefront>} />
//           <Route path="/shop" element={<Storefront><Shop /></Storefront>} />
//           <Route path="/product/:id" element={<Storefront><ProductDetail /></Storefront>} />
//           <Route path="/checkout" element={<Storefront><Checkout /></Storefront>} />
//           <Route path="/order/:id" element={<Storefront><OrderConfirmation /></Storefront>} />
//           <Route path="/custom" element={<Storefront><CustomDesign /></Storefront>} />
//           <Route path="/about" element={<Storefront><About /></Storefront>} />

//           {/* Admin */}
//           <Route path="/admin/login" element={<AdminLogin />} />
//           <Route path="/admin" element={<AdminLayout />}>
//             <Route index element={<AdminProducts />} />
//             <Route path="orders" element={<AdminOrders />} />
//             <Route path="custom-requests" element={<AdminCustomRequests />} />
//           </Route>
//         </Routes>
//       </BrowserRouter>
//     </CartProvider>
//   );
// }