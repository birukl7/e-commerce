# Supplier (Marketplace) Architecture — Integrated Plan

## Objective
Enable users to become suppliers and sell products (Etsy-like) while fitting cleanly into our existing Laravel + Inertia app, Spatie roles/permissions, payment approvals, and admin dashboards.

---

## Roles & Permissions
- Roles (Spatie): `user`, `supplier`, `admin`.
- Permissions (examples):
  - Supplier: `supplier.register`, `supplier.products.{create,update,delete,view}`, `supplier.orders.{view,update_status}`
  - Admin: `admin.suppliers.{view,approve,reject,ban}`, `admin.products.{moderate,force_publish,unpublish}`, `admin.payouts.{view,approve,reject,export}`

---

## Data Model

### ✅ Architecture Decision: Shared Models (Not Separate)
**Use existing models with supplier-specific fields rather than creating separate models**

- users (existing; HasRoles)
  - optional convenience: `is_supplier` boolean (policy relies on role)
  - **MISSING**: `supplierProducts()` relationship method
- supplier_profiles
  - user_id FK, business_name, business_email, phone, tax_id, address JSON
  - verification_status enum(pending, approved, rejected, banned)
  - verification_notes text, default_commission_rate decimal(5,2)
  - payout_method JSON, created_by_admin_id nullable
- **products (existing - SHARED MODEL)**
  - add `supplier_id` (FK to users.id) - nullable for platform products
  - `moderation_status` enum(draft, pending_review, approved, rejected, suspended)
  - `visibility` enum(private, public)
  - `rejection_reason` text, `listing_fee_applied` boolean
  - **Uses same category_id as platform products (shared category system)**
- **orders, order_items (existing - ENHANCED)**
  - orders: `marketplace_type` enum(first_party, supplier, mixed)
  - order_items: `supplier_id`, `vendor_earnings` decimal, `platform_commission` decimal
- supplier_earnings_ledger
  - supplier_id, order_id, order_item_id, amount, commission, net_amount
  - status enum(pending, accrued, paid, reversed), settled_at, notes
- supplier_payout_requests (phase 2)
  - supplier_id, amount, status enum(requested, approved, paid, rejected), method JSON, reference, processed_by, processed_at, notes

Indexes:
- products(supplier_id, moderation_status), order_items(supplier_id), supplier_earnings_ledger(supplier_id, status)

---

## Core Flows
### Supplier Onboarding
1) User submits supplier profile (KYC). Status: pending.
2) Admin reviews: approve → assign `supplier` role; reject/ban with notes.

### Product Publishing
1) Supplier creates a product: starts as `draft`.
2) Submit for review → `pending_review`.
3) Admin moderates → `approved` (visible) or `rejected` (with reason); edits may requeue.

### Orders & Earnings
- Checkout unchanged for shoppers.
- When a payment is captured and admin-approved, per order_item with `supplier_id`:
  - Calculate commission = price × commission_rate; net = price − commission.
  - Write ledger entry with status `accrued`.
- Refunds reverse related ledger entries.

### Payouts
- Phase 1: Reporting-only; finance performs manual payout; admin marks ledger entries `paid`.
- Phase 2: Supplier-initiated payout requests with admin workflow (approve/reject) and optional provider integration.

---

## Admin Integration
- Menus: Suppliers, Supplier Products (Moderation), Earnings & Payouts.
- Controllers (admin-only):
  - AdminSupplierController: index/show/approve/reject/ban/search
  - AdminSupplierProductController: moderation queue list/approve/reject/bulk
  - AdminPayoutsController (phase 2): payout requests, approve/reject/export
- Policies: suppliers manage only their data/products; admin full control.

---

## Supplier UX (Inertia)

### ✅ Architecture Decision: Dedicated Supplier Dashboard
**Separate dashboard for suppliers (not shared with customers)**

- **Dashboard**: onboarding status, catalog cards (draft/pending/approved/rejected), orders, earnings
- **Product Editor**: draft → submit for review; clear moderation/rejection messaging
- **Navigation**: Dedicated supplier layout with role-specific menu items
- **Role Switching**: Multi-role users can switch between customer and supplier views
- **Storefront** (phase 2): `/store/{supplier_slug}` with approved/public products

### Required Supplier Pages
- Dashboard Overview (`/supplier/dashboard`)
- Product Management (`/supplier/products/*`)
- Order Management (`/supplier/orders/*`)
- Earnings & Payouts (`/supplier/earnings/*`)
- Settings (`/supplier/settings`)

---

## Payments Integration (Phase 1)
- Reuse existing payment flow (`PaymentTransaction` + `PaymentFinalizer`).
- On gateway paid + admin approval, write supplier ledger entries for relevant items.
- Supplier dashboard shows accrued and paid totals; admin reports include revenue splits.

---

## Notifications
- Supplier: profile review updates; product moderation results; relevant order events.
- Admin: counters for pending supplier verifications and product moderation.

---

## Config & Feature Flags
- `config/marketplace.php`:
  - `enabled`, `default_commission_rate`, `moderation.required`, `payouts.enabled`

---

## Migrations (Incremental)
1) M1: `supplier_profiles`; products add `supplier_id`, `moderation_status`; order_items add `supplier_id`.
2) M2: `supplier_earnings_ledger`.
3) M3 (optional): `supplier_payout_requests`.
4) Update `RoleAndPermissionSeeder` with supplier role/permissions.

---

## Non-Goals (Phase 1)
- Automated split payouts; multi-currency settlement; tax remittance automation. These belong in later phases.

---

## Integration Notes
- Works with current Spatie roles, Inertia admin dashboard, and payments approval pipeline.
- Product Request flow remains separate from supplier product moderation.
- Extend existing reporting with supplier revenue/commission summaries.

## Key Architecture Decisions Made

### 1. Shared Models Approach ✅
- **Products**: Use existing Product model with supplier fields (not separate models)
- **Categories**: Use existing Category system for all products (platform + supplier)
- **Orders**: Enhance existing Order/OrderItem models with supplier fields
- **Benefits**: Code reuse, unified search, simplified maintenance, industry standard

### 2. Dedicated Dashboard ✅
- **Supplier Dashboard**: Separate from customer dashboard
- **Layout**: Dedicated `SupplierLayout` with supplier-specific navigation
- **Routes**: All supplier routes under `/supplier/*` prefix
- **Benefits**: Focused experience, role-specific features, better UX

### 3. Missing Critical Implementation
- **User Model**: Add missing `supplierProducts()` relationship method
- **Controllers**: Implement missing `SupplierOrderController`, `AdminSupplierProductController`
- **Pages**: Complete supplier product creation, editing, and management interfaces
