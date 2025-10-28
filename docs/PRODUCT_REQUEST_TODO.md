# Product Request Feature Implementation Plan

## 1. Database & Models (Partially Complete)
- [x] Create ProductRequest model and migration
- [x] Add additional fields for product specifications
- [x] Create relationship with existing Order/OrderItem models

## 2. API Endpoints (Complete)
- [x] Create ProductRequestController with CRUD operations
- [x] Set up API routes
- [x] Implement request validation
- [x] Add authorization policies
 - [x] Align controller to use `product_name` consistently
 - [x] Ensure named routes exist for `request.index/store/edit/update/destroy/history`

## 3. Frontend Components
- [x] Create product request form
- [x] Build request listing page
- [x] Implement request detail view
- [x] Add admin dashboard for managing requests

## 4. Payment Integration
- [x] Add dedicated product request payment controller/routes
- [x] Implement `requiresPayment()` on `ProductRequest` model (used by UI/controllers)
- [x] Create order from paid product request and link via `order_id`
- [x] Handle payment callbacks (set `payment_status`, `paid_at`)
- [x] Update request status after payment (set `fulfillment_status` to processing)

## 5. Notifications
- [ ] Email notifications for status updates
- [ ] In-app notifications
- [ ] Admin notifications for new requests

## 6. New Requirements Alignment (Admin Pricing & Availability)
- [x] Admin can review requests in a dedicated page (index/show/edit)
- [x] Admin can set price and currency when approving request (UI + backend)
- [x] Notify user when price is set/approval requires payment
- [x] Add explicit availability handling
  - [x] Option 2: Add `available` boolean column to `product_requests` (migration + UI)
- [ ] Ensure user detail page clearly shows set price and payment CTA when required

## 7. Database & Model Alignment
- [x] Align migration columns with `ProductRequest` fillable fields (amount, currency, payment_* fields, specs)
- [x] Add `order_id` column and relationship; populate on successful payment
- [x] Add model methods: `requiresPayment()`, `markAsPaid(method, ref, details)`

## 8. UX/Flows
 - [x] Add "Accept price" action (optional) to explicitly confirm before payment
 - [x] Admin: filter/sort requests by status/availability/payment state (backend filtering)
 - [x] User: show timeline/status updates on request detail page
 - [x] Persist acceptance server-side and enforce before payment
 - [x] Admin: add Copy Payment Link action on index
 - [x] User: show price acceptance timestamp in request detail

