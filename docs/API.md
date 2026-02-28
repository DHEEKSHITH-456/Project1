# ZyPark API Reference

Base URL: `http://127.0.0.1:8000` (or via frontend proxy `/api`).

Protected routes require header: `Authorization: Bearer <token>`.

## Auth

| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| POST | `/auth/login` | `{ "email", "password", "role": "admin" \| "user" }` | Returns `access_token`, `user_id`, `role` |
| POST | `/auth/register` | `{ "email", "password", "name" }` | Register user; returns token |
| GET | `/auth/me` | — | Current user (protected) |

## Users (Admin)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users` | List users |
| POST | `/users` | Create user `{ "email", "password", "name", "role" }` |
| GET | `/users/{id}` | Get user |
| PUT | `/users/{id}` | Update `{ "name", "enabled" }` |
| DELETE | `/users/{id}` | Delete user |

## Parking

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/parking` | List locations |
| POST | `/parking` | Create location (admin) |
| GET | `/parking/{id}` | Get location + slots |
| PUT | `/parking/{id}` | Update location (admin) |
| DELETE | `/parking/{id}` | Delete location (admin) |
| POST | `/parking/{id}/slots` | Add slot (admin) |
| PUT | `/parking/{id}/slots/{slot_id}` | Update slot (admin) |

## Bookings

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/bookings` | List (admin: all; user: own) |
| POST | `/bookings` | Create (user) `{ "slot_id", "location_id", "start_time", "end_time" }` |
| GET | `/bookings/{id}` | Get booking |
| DELETE | `/bookings/{id}` | Cancel booking |

## Issues

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/issues` | List (admin: all; user: own). Query: `status_filter` |
| POST | `/issues` | Report (user) `{ "location_id", "vehicle_number", "description", "image_url?" }` |
| GET | `/issues/{id}` | Get issue |
| PUT | `/issues/{id}` | Update `{ "status", "admin_notes" }` |

## Analytics (Admin)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/analytics/overview` | Counts: users, locations, bookings, active_issues |
| GET | `/analytics/usage?days=14` | Daily usage |
| GET | `/analytics/peak-hours` | Peak booking hours |
| GET | `/analytics/top-locations?limit=10` | Most used locations |
| GET | `/analytics/issue-resolution` | Avg resolution time |
