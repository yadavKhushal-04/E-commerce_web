"# Test Credentials

## Admin
- Email: `rekhayadmin@gmail.com`
- Password: `firstPASSWORD`
- Role: admin
- Login endpoint: `POST /api/auth/login`
- Auth flow: cookie (`access_token`) + Bearer token returned in JSON

## Endpoints (public)
- `GET /api/products`
- `GET /api/products/{id}`
- `POST /api/orders`
- `POST /api/orders/{id}/verify`
- `GET /api/orders/{id}`
- `POST /api/custom-requests`
- `POST /api/upload` (image)
- `GET /api/files/{path}`

## Endpoints (admin)
- `POST /api/products`
- `PUT /api/products/{id}`
- `DELETE /api/products/{id}`
- `GET /api/admin/orders`
- `GET /api/admin/custom-requests`
- `PUT /api/admin/custom-requests/{id}/status`
"