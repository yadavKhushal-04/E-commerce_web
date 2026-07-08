# Rekhay Atelier

A full-stack clothing e-commerce platform with a customer-facing storefront, cart & checkout with Razorpay payments, a custom-design request flow, and an admin dashboard for managing products, orders, and custom requests.

[Website Link](clothestorebyrekha.vercel.app)

## Screenshots

<!-- Add screenshots of the live site here -->
<!-- ![Home](path/to/screenshot.png) -->

## Features

- **Storefront** — browse products by category, view product details, sizes, and stock
- **Cart & Checkout** — cart drawer, checkout flow, and payment via Razorpay with server-side payment verification
- **Customer accounts** — register/login, view order history from the account page
- **Custom design requests** — customers can submit custom orders with notes, measurements, and reference images
- **Admin dashboard** — separate admin login; manage products (create/update/delete), view & update order status, and manage custom design requests
- **Image uploads** — product and custom-request images stored via Cloudinary (or local storage, configurable)
- **Transactional email** — order/notification emails sent via Resend

## Tech Stack

**Backend**
- Python + FastAPI
- MongoDB with Motor (async driver)
- JWT authentication (`pyjwt`), password hashing (`bcrypt`)
- Razorpay for payments
- Cloudinary for image storage
- Resend for transactional email

**Frontend**
- React 19 (Create React App + CRACO)
- React Router v7
- Tailwind CSS + shadcn/Radix UI components
- React Query / SWR for data fetching
- Axios for API calls
- React Hook Form + Zod for form handling/validation
- Framer Motion for animations

## Project Structure

```
Mom/
├── Backend/
│   ├── server.py           # FastAPI app — routes, models, auth, storage, payments
│   └── requirements.txt
└── Frontend/
    ├── src/
    │   ├── pages/            # Home, Shop, ProductDetail, CustomDesign, Checkout,
    │   │                      # OrderConfirmation, Account, Login, Register, About
    │   ├── pages/admin/       # AdminLogin, AdminLayout, AdminProducts, AdminOrders,
    │   │                      # AdminCustomRequests
    │   ├── components/        # Layout, ProductCard, CartDrawer
    │   ├── context/           # CartContext, UserContext
    │   └── lib/               # api.js — Axios instance
    └── package.json
```

## API Overview

All routes are prefixed with `/api`.

### Auth (Admin)
| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/login` | Admin login |
| POST | `/auth/logout` | Admin logout |
| GET | `/auth/me` | Get current admin |

### Customer Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/customer/register` | Register a customer account |
| POST | `/customer/login` | Customer login |
| POST | `/customer/logout` | Customer logout |
| GET | `/customer/me` | Get current customer |
| GET | `/customer/orders` | Get the logged-in customer's orders |

### Products
| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/products` | List products | Public |
| GET | `/products/{product_id}` | Get a single product | Public |
| POST | `/products` | Create a product | Admin |
| PUT | `/products/{product_id}` | Update a product | Admin |
| DELETE | `/products/{product_id}` | Delete a product | Admin |

### Orders
| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/orders` | Create an order (initiates Razorpay payment) | Public |
| POST | `/orders/{order_id}/verify` | Verify Razorpay payment signature | Public |
| GET | `/orders/{order_id}` | Get an order by ID | Public/Owner |
| GET | `/admin/orders` | List all orders | Admin |
| PUT | `/admin/orders/{order_id}/status` | Update order status | Admin |

### Custom Design Requests
| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/custom-requests` | Submit a custom design request | Public |
| GET | `/admin/custom-requests` | List custom requests | Admin |
| PUT | `/admin/custom-requests/{req_id}/status` | Update a request's status | Admin |

### Files
| Method | Endpoint | Description |
|---|---|---|
| POST | `/upload` | Upload an image (product/custom-request) |
| GET | `/files/{path}` | Serve an uploaded file (local storage mode) |

## Data Models

- **Product** — `name`, `description`, `price` (INR), `sizes[]`, `images[]`, `category`, `stock`
- **Order** — `customer_name`, `email`, `phone`, `address`, `items[]` (cart items), payment/status fields
- **Cart Item** — `product_id`, `name`, `price`, `size`, `quantity`, `image`
- **Custom Request** — `customer_name`, `email`, `phone`, `notes`, `measurements`, `images[]`
- **Customer** — `name`, `email`, `password` (hashed)

## Payments

Checkout creates an order and initiates a Razorpay payment; the backend verifies the payment signature via `/orders/{order_id}/verify` before confirming the order. Free shipping applies above ₹1,499, otherwise a flat ₹59 shipping charge is added.


### Valar Morghulis