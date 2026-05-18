# Jasubhai Chappal – API Documentation

Base URL: `http://localhost:3000` (dev) | `https://your-domain.vercel.app` (prod)

All protected endpoints require:
```
Authorization: Bearer <jwt_token>
```
or the `token` cookie set during login.

---

## Authentication

### POST /api/auth/register
Register a new user account.

**Request Body:**
```json
{
  "name": "Ramesh Patel",
  "email": "ramesh@example.com",
  "phone": "9876543210",
  "password": "securepassword",
  "address": {
    "line1": "123 Main Street",
    "locality": "Camp",
    "city": "Pune",
    "state": "Maharashtra",
    "country": "India",
    "pincode": "411001"
  }
}
```

**Response 201:**
```json
{
  "message": "Account created successfully",
  "user": { "id": "...", "name": "Ramesh Patel", "email": "...", "role": "user" },
  "token": "eyJhbGci..."
}
```

---

### POST /api/auth/login
Login to existing account.

**Request Body:**
```json
{ "email": "ramesh@example.com", "password": "securepassword" }
```

**Response 200:**
```json
{
  "user": { "id": "...", "name": "Ramesh Patel", "email": "...", "role": "user" },
  "token": "eyJhbGci..."
}
```

---

## Products

### GET /api/products
List products with optional filters.

**Query Params:**
- `category` – Filter by category (Sandals, Chappals, Kolhapuri, etc.)
- `search` – Search by product name
- `featured` – `true` for featured only
- `page` – Page number (default: 1)
- `limit` – Items per page (default: 12)

**Response:**
```json
{
  "products": [...],
  "total": 48,
  "page": 1,
  "pages": 4
}
```

---

### POST /api/products (Admin)
Create a new product.

**Request Body:**
```json
{
  "name": "Kolhapuri Classic",
  "description": "Handcrafted leather chappal...",
  "price": 899,
  "discount": 20,
  "category": "Kolhapuri",
  "sizes": ["6", "7", "8", "9", "10"],
  "stock": 50,
  "featured": true,
  "images": [{ "url": "https://res.cloudinary.com/...", "publicId": "jc/products/..." }]
}
```

---

## Payment Flow

1. User fills address → clicks "Proceed to Pay"
2. POST `/api/payment/create-order` → get `razorpayOrderId`
3. POST `/api/orders` → create order record with `razorpayOrderId`
4. Open Razorpay checkout with `razorpayOrderId`
5. After payment: POST `/api/payment/verify` with `razorpayOrderId`, `razorpayPaymentId`, `razorpaySignature`, `orderId`
6. Server verifies HMAC signature → updates order to `confirmed` + `paid`
7. Cart cleared → show success page
