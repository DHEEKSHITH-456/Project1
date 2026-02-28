# ZyPark – Database Schema (MongoDB)

## Collections and Example Documents

---

### 1. `users`

Stores both admins and regular users. Differentiated by `role`.

```json
{
  "_id": {"$oid": "507f1f77bcf86cd799439011"},
  "email": "admin@zypark.com",
  "password_hash": "$2b$12$...",
  "role": "admin",
  "name": "System Admin",
  "enabled": true,
  "created_at": {"$date": "2025-01-01T00:00:00Z"},
  "updated_at": {"$date": "2025-01-01T00:00:00Z"}
}
```

```json
{
  "_id": {"$oid": "507f1f77bcf86cd799439012"},
  "email": "john@example.com",
  "password_hash": "$2b$12$...",
  "role": "user",
  "name": "John Doe",
  "enabled": true,
  "created_at": {"$date": "2025-01-15T00:00:00Z"},
  "updated_at": {"$date": "2025-01-15T00:00:00Z"}
}
```

**Indexes**: `email` (unique), `role`, `enabled`.

---

### 2. `parking_locations`

One document per parking location.

```json
{
  "_id": {"$oid": "507f1f77bcf86cd799439021"},
  "name": "Central Mall Parking",
  "address": "123 Main St, City Center",
  "coordinates": {"lat": 40.7128, "lng": -74.0060},
  "total_slots": 50,
  "created_at": {"$date": "2025-01-01T00:00:00Z"},
  "updated_at": {"$date": "2025-01-01T00:00:00Z"}
}
```

**Indexes**: `coordinates` (2dsphere for geo), `name`.

---

### 3. `parking_slots`

Slots belong to a location. Availability and optional pricing per slot.

```json
{
  "_id": {"$oid": "507f1f77bcf86cd799439031"},
  "location_id": "507f1f77bcf86cd799439021",
  "slot_number": "A-01",
  "available": true,
  "price_per_hour": 2.5,
  "created_at": {"$date": "2025-01-01T00:00:00Z"},
  "updated_at": {"$date": "2025-01-01T00:00:00Z"}
}
```

**Indexes**: `location_id`, `location_id + available`, `location_id + slot_number` (unique).

---

### 4. `bookings`

One booking = one user + one slot + time range.

```json
{
  "_id": {"$oid": "507f1f77bcf86cd799439041"},
  "booking_id": "ZP-2025-001234",
  "user_id": "507f1f77bcf86cd799439012",
  "location_id": "507f1f77bcf86cd799439021",
  "slot_id": "507f1f77bcf86cd799439031",
  "start_time": {"$date": "2025-02-01T09:00:00Z"},
  "end_time": {"$date": "2025-02-01T11:00:00Z"},
  "status": "confirmed",
  "created_at": {"$date": "2025-01-28T00:00:00Z"},
  "updated_at": {"$date": "2025-01-28T00:00:00Z"}
}
```

**Status**: `confirmed`, `cancelled`, `completed`.  
**Indexes**: `user_id`, `slot_id`, `location_id`, `start_time`, `status`.

---

### 5. `issues`

User-reported parking issues (blocked/wrongly parked vehicle, etc.).

```json
{
  "_id": {"$oid": "507f1f77bcf86cd799439051"},
  "user_id": "507f1f77bcf86cd799439012",
  "location_id": "507f1f77bcf86cd799439021",
  "vehicle_number": "ABC-1234",
  "description": "Vehicle blocking two slots",
  "image_url": null,
  "status": "open",
  "admin_notes": null,
  "created_at": {"$date": "2025-01-20T14:00:00Z"},
  "updated_at": {"$date": "2025-01-20T14:00:00Z"},
  "resolved_at": null
}
```

**Status**: `open`, `in_progress`, `resolved`.  
**Indexes**: `user_id`, `location_id`, `status`, `created_at`.

---

## Relationships

- **users** → bookings (one-to-many), issues (one-to-many).
- **parking_locations** → parking_slots (one-to-many), bookings (location_id), issues (location_id).
- **parking_slots** → bookings (one-to-many for a time range; conflict check via overlapping start/end).
- **bookings** reference user_id, location_id, slot_id.
- **issues** reference user_id, location_id.

Seed data and indexes are created by the backend seed script (see README).
