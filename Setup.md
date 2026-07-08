# Setup Guide

Instructions to run Rekhay Atelier locally.

## Prerequisites

- Python 3.11+
- Node.js (v18+ recommended) and Yarn
- A MongoDB instance (local or Atlas)
- Accounts/API keys for: Razorpay, Resend, Cloudinary (if using cloud storage)

## 1. Clone the repo

```bash
git clone <repo-url>
cd Mom
```

## 2. Backend setup

```bash
cd Backend
python -m venv venv
source venv/bin/activate   # on Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create a `.env` file in `Backend/` with the following variables:

| Variable | Description |
|---|---|
| `MONGO_URL` | MongoDB connection string |
| `DB_NAME` | Database name |
| `CORS_ORIGINS` | Allowed origin(s) for CORS (comma-separated) |
| `JWT_SECRET` | Secret used to sign JWT tokens |
| `ADMIN_EMAIL` | Admin login email |
| `ADMIN_PASSWORD` | Admin login password |
| `RAZORPAY_KEY_ID` | Razorpay API key ID |
| `RAZORPAY_KEY_SECRET` | Razorpay API key secret |
| `RAZORPAY_WEBHOOK_SECRET` | Razorpay webhook signing secret |
| `RESEND_API_KEY` | Resend API key (transactional email) |
| `SENDER_EMAIL` | From-address for outgoing email |
| `BUSINESS_NAME` | Business name used in emails/receipts |
| `BUSINESS_EMAIL` | Business contact email |
| `APP_NAME` | Application name |
| `STORAGE_BACKEND` | `local` or `cloudinary` |
| `CLOUDINARY_URL` | Cloudinary connection URL (required if `STORAGE_BACKEND=cloudinary`) |

Run the backend:

```bash
uvicorn server:app --reload --host 0.0.0.0 --port 8000
```

## 3. Frontend setup

```bash
cd Frontend
yarn install
```

Create a `.env` file in `Frontend/` with:

| Variable | Description |
|---|---|
| `REACT_APP_BACKEND_URL` | Base URL of the backend API (e.g. `http://localhost:8000`) |
| `WDS_SOCKET_PORT` | Webpack dev server socket port (optional, for hot reload behind proxies) |
| `ENABLE_HEALTH_CHECK` | Enable/disable a health-check endpoint ping (optional) |

Run the frontend:

```bash
yarn start
```

## 4. You're set

- Backend runs at `http://localhost:8000`
- Frontend runs at `http://localhost:3000`
- Log in to `/admin` using the `ADMIN_EMAIL` / `ADMIN_PASSWORD` from your backend `.env`