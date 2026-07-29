# Notification System Architecture & Reference Documentation

This document details the notification system design, payload specifications, deep-link routing targets, and user management capabilities.

---

## 1. System Overview & Architecture

The notification system provides real-time and persistent alerts across all core marketplace workflows (Booking Requests, Status Transitions, Nanny Applications, In-App Chat, and Reviews).

```
+-----------------------------------------------------------------------------------+
|                            WORKFLOW DISPATCHERS                                   |
| - POST /api/bookings/request    -> NEW_BOOKING_REQUEST (SITTER)                   |
| - POST /api/bookings/[id]/status -> BOOKING_ACCEPTED / BOOKING_DECLINED (PARENT)   |
|                                    SITTING_STARTED / SITTING_COMPLETED (PARENT)   |
| - POST /api/sitter/application   -> NEW_NANNY_APPLICATION (ADMIN)                 |
| - PATCH /api/admin/applications  -> APPLICATION_APPROVED / REJECTED (SITTER)    |
| - POST /api/reviews              -> NEW_REVIEW (SITTER)                           |
| - POST /api/chat/messages        -> CHAT_MESSAGE (PARENT / SITTER)                |
+-----------------------------------------------------------------------------------+
                                   |
                         createNotification()
                                   v
+-----------------------------------------------------------------------------------+
|                            DATABASE LAYER                                         |
| Prisma Notification model (targetRoute, actorName, actorAvatar, readAt)           |
+-----------------------------------------------------------------------------------+
                                   |
                         GET /api/notifications
                                   v
+-----------------------------------------------------------------------------------+
|                            FRONTEND LAYER                                         |
| NotificationBell component (Relative time, Deep Links, Management Actions)       |
+-----------------------------------------------------------------------------------+
```

---

## 2. Notification Payload Strategy

| Field | Type | Description | Example |
| :--- | :--- | :--- | :--- |
| `id` | String (UUID) | Unique notification record identifier | `notif-12345` |
| `userId` | String (UUID) | Recipient user ID | `demo_sitter_1` |
| `type` | Enum / String | Notification classification type | `NEW_BOOKING_REQUEST` |
| `title` | String | Action title | `New Booking Request from Smith Household` |
| `content` | String | Rich descriptive body | `2 children • $116.00 CAD estimated payout` |
| `targetRoute` | String | Explicit deep-link destination URL | `/sitter/jobs?bookingId=b1` |
| `actorName` | String | Name of user performing action | `David Smith` |
| `actorAvatar` | String | Image URL of actor avatar | `https://images.unsplash.com/...` |
| `metadata` | JSON String | Optional additional parameters | `{"numChildren": 2}` |
| `readAt` | DateTime / null | Read timestamp (`null` = Unread) | `2026-07-29T12:00:00Z` |
| `createdAt` | DateTime | Creation timestamp | `2026-07-29T11:55:00Z` |

---

## 3. Deep Linking & Navigation Matrix

| Notification Type | Recipient Role | Navigation Target Route | Fallback Route |
| :--- | :--- | :--- | :--- |
| `NEW_BOOKING_REQUEST` | Caregiver (`SITTER`) | `/sitter/jobs?bookingId={id}` | `/sitter/jobs` |
| `BOOKING_ACCEPTED` | Parent (`PARENT`) | `/parent/bookings?bookingId={id}` | `/parent/bookings` |
| `BOOKING_DECLINED` | Parent (`PARENT`) | `/parent/bookings?bookingId={id}` | `/parent/bookings` |
| `SITTING_STARTED` | Parent (`PARENT`) | `/parent/bookings?bookingId={id}` | `/parent/bookings` |
| `SITTING_COMPLETED` | Parent (`PARENT`) | `/parent/bookings?bookingId={id}` | `/parent/bookings` |
| `NEW_NANNY_APPLICATION` | Platform Admin (`ADMIN`) | `/admin/vetting?tab=APPLICATIONS` | `/admin/vetting` |
| `APPLICATION_APPROVED` | Caregiver (`SITTER`) | `/sitter/jobs` | `/sitter/jobs` |
| `APPLICATION_REJECTED` | Caregiver (`SITTER`) | `/sitter/apply` | `/sitter/apply` |
| `NEW_REVIEW` | Caregiver (`SITTER`) | `/sitter/jobs` | `/sitter/jobs` |
| `CHAT_MESSAGE` | Parent / Sitter | `/parent/bookings` or `/sitter/jobs` | Role Dashboard |

---

## 4. Supported User Management Actions

The backend exposes `POST /api/notifications` supporting 5 management actions for all authenticated users (Parent, Sitter, Admin):

1. `MARK_READ`: Marks a specific notification as read (`readAt = new Date()`).
2. `MARK_UNREAD`: Toggles a read notification back to unread (`readAt = null`).
3. `MARK_ALL_READ`: Bulk updates all unread notifications for the user.
4. `DELETE`: Permanently removes a notification record from the database.
5. `DELETE_ALL`: Clears all notification history for the user.
