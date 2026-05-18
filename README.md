# Jasubhai Chappal – E-Commerce Platform

A production-ready full-stack e-commerce application for an Indian footwear brand, built with Next.js 14, MongoDB, Razorpay, and Cloudinary.

---

## Tech Stack

| Layer      | Technology                    |
|------------|-------------------------------|
| Frontend   | Next.js 14 (App Router), React 18 |
| Styling    | Tailwind CSS + Framer Motion  |
| Backend    | Next.js API Routes (Node.js)  |
| Database   | MongoDB Atlas + Mongoose      |
| Auth       | JWT (httpOnly cookies + localStorage) |
| Images     | Cloudinary                    |
| Payments   | Razorpay                      |
| Deployment | Vercel (frontend) + Vercel Serverless |

---

## Features

### Consumer Website
- Home page with hero, flash sale timer, categories, featured & trending products
- Product listing with filters (category, price) and sorting
- Product detail with image gallery, size selector, reviews
- Add to cart (login-gated), cart management
- Multi-step checkout with Razorpay payment
- Order history

### Admin Panel (`/admin`)
- Dark-theme dashboard with revenue, orders, users, and products stats
- Product CRUD with multi-image Cloudinary upload
- Order management with status updates
- User directory

### Authentication
- JWT-based auth (stored in httpOnly cookie + localStorage)
- Middleware-protected routes (`/admin`, `/checkout`, `/orders`)
- Glassmorphism login/signup pages

---

## Quick Start

### 1. Clone the project

```bash
git clone <your-repo-url> jasubhaichappal-site
cd jasubhaichappal-site
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local` and fill in:

| Variable | Where to get it |
|----------|----------------|
| `MONGODB_URI` | [MongoDB Atlas](https://cloud.mongodb.com) → Create cluster → Connect |
| `JWT_SECRET` | Any 32+ char random string |
| `CLOUDINARY_*` | [cloudinary.com](https://cloudinary.com) → Dashboard |
| `RAZORPAY_KEY_ID` & `RAZORPAY_KEY_SECRET` | [Razorpay Dashboard](https://dashboard.razorpay.com) → Settings → API Keys |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Same as `RAZORPAY_KEY_ID` |

### 4. Seed the database (creates admin + sample products)

```bash
npx ts-node -e "require('./src/scripts/seed.ts')" 
# OR run: npm run dev  then visit /api/seed (if you add that route)
```

**Default Admin Credentials:**
- Email: `admin@jasubhaichappal.com`
- Password: `Admin@123456`

### 5. Run development server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## Folder Structure

```
src/
├── app/
│   ├── page.tsx                    # Home page
│   ├── HomeClient.tsx              # Home page client component
│   ├── layout.tsx                  # Root layout
│   ├── globals.css                 # Global styles
│   ├── products/
│   │   ├── page.tsx                # Product listing
│   │   ├── ProductsClient.tsx
│   │   └── [id]/
│   │       ├── page.tsx            # Product detail
│   │       └── ProductDetailClient.tsx
│   ├── cart/page.tsx               # Shopping cart
│   ├── checkout/page.tsx           # Checkout + Razorpay
│   ├── orders/page.tsx             # Order history
│   ├── login/page.tsx              # Login
│   ├── signup/page.tsx             # Registration
│   ├── admin/
│   │   ├── layout.tsx              # Admin layout (auth guard)
│   │   ├── page.tsx                # Dashboard
│   │   ├── products/page.tsx       # Product management
│   │   ├── products/new/page.tsx   # Add product
│   │   ├── products/[id]/edit/page.tsx  # Edit product
│   │   ├── orders/page.tsx         # Order management
│   │   └── users/page.tsx          # User list
│   └── api/
│       ├── auth/register/route.ts
│       ├── auth/login/route.ts
│       ├── auth/me/route.ts
│       ├── products/route.ts
│       ├── products/[id]/route.ts
│       ├── cart/route.ts
│       ├── orders/route.ts
│       ├── orders/[id]/route.ts
│       ├── payment/create-order/route.ts
│       ├── payment/verify/route.ts
│       ├── upload/route.ts
│       └── admin/
│           ├── products/route.ts
│           ├── orders/route.ts
│           ├── orders/[id]/route.ts
│           ├── users/route.ts
│           └── stats/route.ts
├── components/
│   ├── Navbar.tsx                  # Sticky navbar with search overlay
│   ├── Footer.tsx
│   ├── ProductCard.tsx             # Card with hover effects
│   ├── AuthModal.tsx               # Glassmorphism auth modal
│   ├── AdminSidebar.tsx            # Dark sidebar
│   └── SkeletonCard.tsx
├── context/
│   ├── AuthContext.tsx             # JWT auth state
│   └── CartContext.tsx             # Cart state
├── lib/
│   ├── db.ts                       # MongoDB connection
│   ├── auth.ts                     # JWT helpers
│   ├── cloudinary.ts               # Cloudinary upload
│   └── razorpay.ts                 # Razorpay + signature verification
├── models/
│   ├── User.ts
│   ├── Product.ts
│   ├── Cart.ts
│   └── Order.ts
└── middleware.ts                   # Edge middleware for route protection
```

---

## API Reference

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | — | Register new user |
| POST | `/api/auth/login` | — | Login, returns JWT |
| GET | `/api/auth/me` | User | Get current user |
| DELETE | `/api/auth/me` | — | Logout (clear cookie) |

### Products
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/products` | — | List products (filter, search, paginate) |
| GET | `/api/products/:id` | — | Get product by ID or slug |
| POST | `/api/products` | Admin | Create product |
| PUT | `/api/products/:id` | Admin | Update product |
| DELETE | `/api/products/:id` | Admin | Soft-delete product |

### Cart
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/cart` | User | Get cart |
| POST | `/api/cart` | User | Add item to cart |
| PUT | `/api/cart` | User | Update item quantity |
| DELETE | `/api/cart` | User | Remove item or clear cart |

### Orders
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/orders` | User | Get user's orders |
| POST | `/api/orders` | User | Create order from cart |
| GET | `/api/orders/:id` | User | Get specific order |

### Payment
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/payment/create-order` | User | Create Razorpay order |
| POST | `/api/payment/verify` | User | Verify payment & confirm order |

### Admin
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/admin/stats` | Admin | Dashboard statistics |
| GET | `/api/admin/products` | Admin | All products |
| GET | `/api/admin/orders` | Admin | All orders |
| PUT | `/api/admin/orders/:id` | Admin | Update order status |
| GET | `/api/admin/users` | Admin | All users |
| POST | `/api/upload` | Admin | Upload image to Cloudinary |

---

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project on [vercel.com](https://vercel.com)
3. Add all environment variables from `.env.example`
4. Deploy

### Environment Variables on Vercel

Add all variables from `.env.example` in Project → Settings → Environment Variables.

---

## Coupon Codes (Demo)

| Code | Discount |
|------|----------|
| `WELCOME10` | 10% off |
| `FLAT50` | ₹50 off |

---

## License

MIT © Jasubhai Chappal
