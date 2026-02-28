# ZyPark – System Architecture

## 1. Overview

ZyPark is a **Smart Parking Assistance & Management** full-stack web application with strict **role-based access**: **Admin** (full control) and **User** (parking discovery, booking, issue reporting).

- **Entry**: Landing page → Login (Admin or User) → Role-specific dashboard.
- **Backend**: FastAPI (Python), REST APIs, JWT auth, MongoDB.
- **Frontend**: React + TypeScript + Tailwind, role-based routing.

---

## 2. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                          │
│  Landing → Login (Admin / User) → Dashboard (Admin | User)       │
│  Pages: Dashboard, Users, Parking, Bookings, Issues, Analytics   │
└──────────────────────────────┬──────────────────────────────────┘
                               │ HTTP / REST
┌──────────────────────────────▼──────────────────────────────────┐
│                     BACKEND (FastAPI)                            │
│  /auth, /users, /parking, /bookings, /issues, /analytics         │
│  JWT + role check on every protected route                       │
└──────────────────────────────┬──────────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────────┐
│                      MongoDB                                     │
│  users, parking_locations, parking_slots, bookings, issues       │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Feature Matrix

| Feature | Admin | User |
|--------|-------|------|
| Login | ✅ | ✅ |
| Dashboard (overview) | ✅ | ✅ |
| User management (CRUD) | ✅ | ❌ |
| Parking locations/slots CRUD | ✅ | ❌ |
| View all bookings, cancel any | ✅ | ❌ |
| View all issues, update status | ✅ | ❌ |
| Analytics (usage, peaks, resolution) | ✅ | ❌ |
| Find parking, book, cancel own | ❌ | ✅ |
| Report issue, track status | ❌ | ✅ |
| Alerts/notifications (mock) | ❌ | ✅ |
| Profile & activity | ❌ | ✅ |

---

## 4. Page & UI Flow

### 4.1 Unauthenticated
- **Landing** (`/`) – Hero, “Admin Login” / “User Login”.
- **Admin Login** (`/login/admin`) – Email + password → Admin dashboard.
- **User Login** (`/login/user`) – Email + password → User dashboard.
- **User Register** (`/register`) – Name, email, password → User login.

### 4.2 Admin (after login)
- **Dashboard** (`/admin`) – Cards: total users, locations, bookings, active issues.
- **User Management** (`/admin/users`) – List, add, edit, enable/disable.
- **Parking Management** (`/admin/parking`) – Locations + slots, add/edit/remove, availability, pricing.
- **Bookings** (`/admin/bookings`) – List, filter by date/user/location, cancel.
- **Issues** (`/admin/issues`) – List, status, user/vehicle, resolve.
- **Analytics** (`/admin/analytics`) – Daily usage, peak hours, top spots, resolution time.

### 4.3 User (after login)
- **Dashboard** (`/user`) – Welcome, quick actions (find, book, report), recent bookings, active alerts.
- **Find Parking** (`/user/parking`) – Search by location, map/list, filters, availability, price.
- **Book Parking** (`/user/book`) – Select slot, date/time, duration, confirm, view/cancel own.
- **Report Issue** (`/user/report`) – Vehicle number, description, optional image, submit, track.
- **Alerts** (`/user/alerts`) – List alerts, mark resolved (mock).
- **Profile** (`/user/profile`) – View/edit profile, activity history.

---

## 5. Backend API Summary

All protected routes expect: `Authorization: Bearer <token>` and (where noted) role `admin` or `user`.

| Method | Route | Role | Description |
|--------|--------|------|-------------|
| POST | `/auth/login` | - | Login (body: email, password, role) |
| POST | `/auth/register` | - | User registration |
| GET | `/auth/me` | admin/user | Current user |
| GET | `/users` | admin | List users |
| POST | `/users` | admin | Create user |
| GET | `/users/{id}` | admin | Get user |
| PUT | `/users/{id}` | admin | Update user (enable/disable) |
| DELETE | `/users/{id}` | admin | Delete user |
| GET | `/parking` | admin/user | List parking locations (user: filtered) |
| POST | `/parking` | admin | Create location |
| GET | `/parking/{id}` | admin/user | Get location + slots |
| PUT | `/parking/{id}` | admin | Update location |
| DELETE | `/parking/{id}` | admin | Delete location |
| POST | `/parking/{id}/slots` | admin | Add slots |
| PUT | `/parking/{id}/slots/{slot_id}` | admin | Update slot (availability, price) |
| GET | `/bookings` | admin/user | List (admin: all; user: own) |
| POST | `/bookings` | user | Create booking |
| GET | `/bookings/{id}` | admin/user | Get booking |
| DELETE | `/bookings/{id}` | admin/user | Cancel (user: own only) |
| GET | `/issues` | admin/user | List (admin: all; user: own) |
| POST | `/issues` | user | Report issue |
| GET | `/issues/{id}` | admin/user | Get issue |
| PUT | `/issues/{id}` | admin/user | Update (e.g. status; admin: full) |
| GET | `/analytics/overview` | admin | Dashboard counts |
| GET | `/analytics/usage` | admin | Daily usage, peak hours, top spots |
| GET | `/analytics/issues` | admin | Issue resolution times |

---

## 6. Database Collections (MongoDB)

See `docs/DATABASE.md` for full schema and sample documents.

- **users** – `email`, `password_hash`, `role` (admin|user), `name`, `enabled`, timestamps.
- **parking_locations** – `name`, `address`, `coordinates`, `total_slots`, timestamps.
- **parking_slots** – Embedded or separate; `location_id`, `slot_number`, `available`, `price_per_hour`.
- **bookings** – `user_id`, `slot_id`, `location_id`, `start`, `end`, `status`, `booking_id`.
- **issues** – `user_id`, `location_id`, `vehicle_number`, `description`, `image_url`, `status`, timestamps.

---

## 7. Authentication & Role Flow

1. **Login**: POST `/auth/login` with `{ email, password, role }`. Backend checks credentials and role; returns JWT with `sub` (user id) and `role`.
2. **Frontend**: Stores token (e.g. localStorage); adds `Authorization: Bearer <token>` to all API calls.
3. **Routing**: If no token or invalid → redirect to landing/login. If role admin → only `/admin/*`; if user → only `/user/*`.
4. **Backend**: Each protected route uses dependency that validates JWT and checks role (admin or user).

---

## 8. How It All Connects

- **Landing/Login** → Backend `/auth/login` → JWT → Frontend saves token and role → Router sends to `/admin` or `/user` dashboard.
- **Admin** panels call `/users`, `/parking`, `/bookings`, `/issues`, `/analytics/*` with admin token.
- **User** panels call `/parking`, `/bookings`, `/issues` (own), `/auth/me` with user token.
- **MongoDB** is the single source of truth; FastAPI services read/write via repository or service layer.

This document is the single reference for the full system design.
