# FoodHub — Online Food Ordering System (MongoDB)

Node.js + Express + MongoDB (Mongoose) + Socket.IO, with a plain HTML/CSS/JS frontend.

## Features
- **Login page** with Sign In / Create Account tabs (bcrypt-hashed passwords, JWT sessions)
- **Admin account(s)** created automatically on first start, from `ADMIN_EMAIL` / `ADMIN_PASSWORD` in your `.env`
  - Add more admins with `EXTRA_ADMINS=email:password,email2:password2`
- **40-item menu** in 8 categories (Starters, South Indian, Main Course, Biryani & Rice, Chinese, Pizza & Burgers, Desserts, Beverages) with search, category filters and a veg-only toggle
- **Cart & checkout**: 5% GST, ₹30 delivery (free above ₹500), address, phone, payment method, notes
- **Real-time admin dashboard**: new orders show up instantly with a sound + highlight, no refresh needed
  - Update status: Pending → Confirmed → Preparing → Out for Delivery → Delivered / Cancelled
  - Stats: today's orders & revenue, pending, in progress, total revenue, customers, top sellers
  - Menu management: change prices and turn items on/off (users' menus update live)
  - Customer list with order count and total spent
- **User order tracking**: customers see status changes live and can cancel pending orders

## Setup
1. Install **Node.js 18+** and either **MongoDB Community Server** (local) or a free **MongoDB Atlas** cluster.
2. In this folder:
   ```bash
   npm install
   cp .env.example .env      # Windows: copy .env.example .env
   ```
3. Edit `.env` → set `MONGO_URI` (Atlas example: `mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/food_ordering`) and a long random `JWT_SECRET`.
4. Start it:
   ```bash
   npm start        # or: npm run dev  (auto-restart)
   ```
5. Open http://localhost:5000
   - Create a user account → order food
   - In another browser/incognito window, sign in as admin → watch orders arrive live

## Project structure
```
server.js              Express + Socket.IO server, DB connect, admin & menu seeding
data/menu.js           The 40 menu items
models/                User, MenuItem, Order (Mongoose schemas)
middleware/auth.js     JWT auth + admin guard
routes/auth.js         /api/auth/register, /login, /me
routes/orders.js       menu, orders, admin endpoints + real-time events
routes/geocode.js      reverse-geocode proxy for "use my location" at checkout
public/                index.html (login), menu.html (browse + cart),
                       orders.html (order tracking), admin.html (dashboard), css, js
```

## API
| Method | Endpoint | Who |
|---|---|---|
| POST | /api/auth/register | public |
| POST | /api/auth/login | public |
| GET | /api/menu | public |
| PATCH | /api/menu/:id | admin |
| POST | /api/orders | user |
| GET | /api/orders/my | user |
| PATCH | /api/orders/:id/cancel | user |
| GET | /api/geocode/reverse?lat=&lon= | logged in |
| GET | /api/admin/orders?status= | admin |
| PATCH | /api/admin/orders/:id/status | admin |
| GET | /api/admin/stats | admin |
| GET | /api/admin/users | admin |

Socket events: `order:new` (to admins), `order:updated` (to admins + that customer), `menu:updated` (everyone).

## Notes
- Prices are always recalculated on the server, so totals can't be tampered with from the browser.
- The admin is only seeded if that email doesn't exist yet. To change the admin password later, delete that user in MongoDB and restart with the new `ADMIN_PASSWORD`.
- To re-seed the menu, drop the `menuitems` collection and restart.
