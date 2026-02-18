# 🛒 BuyMore

BuyMore is a full-stack, production-grade eCommerce platform built with Next.js App Router and TypeScript.

It supports product browsing, cart management, secure checkout validation, admin product management, media uploads, and rate-limited API endpoints.

Designed with strict server/client separation and modular architecture.

---

## 🚀 Features

### 🛍️ Storefront
- Product listing with filtering & sorting
- Dynamic product pages (`/products/[slug]`)
- Search functionality
- Cart system with validation
- Checkout validation with server-side verification

### 🔐 Admin Panel
- Secure admin login
- Create / Edit / Delete products
- Media management system
- Login attempt tracking
- Rate-limited admin authentication

### ⚙️ Backend APIs (Next.js Route Handlers)
- Admin authentication routes
- Product CRUD APIs
- Media upload routes
- Cloudinary signed upload integration
- Cart validation endpoint
- Rate limiting middleware
- Zod-based validation

---

## 🏗️ Tech Stack

### Framework
- Next.js 14 (App Router)
- React
- TypeScript

### Database
- MongoDB (via Mongoose models)

### Backend
- Next.js Route Handlers
- Server Actions
- Zod validation
- Custom rate limiter

### Media & Integrations
- Cloudinary signed uploads
- WhatsApp integration utility

### UI
- Tailwind CSS
- shadcn/ui components
- Custom reusable UI components

---

## 📂 Project Structure

app/
├── products/[slug]
├── admin/
├── api/
├── cart/
├── checkout/
└── layout.tsx

lib/
├── db.ts
├── ratelimit.ts
├── validators/
├── models/
└── utils/

components/
├── custom/
└── ui/


---

## 🔐 Security Architecture

- Server-only admin authentication
- Rate-limited login endpoint
- Zod schema validation for all inputs
- Signed Cloudinary uploads
- Login attempt tracking model
- Strict separation of client & server code

---

## ⚙️ Local Development

### 1️⃣ Install dependencies

```bash
pnpm install
```
