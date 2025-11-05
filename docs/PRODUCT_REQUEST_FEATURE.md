# Product Request Feature - Comprehensive Documentation

## Table of Contents
1. [Overview](#overview)
2. [Feature Architecture](#feature-architecture)
3. [Workflow States](#workflow-states)
4. [Payment System](#payment-system)
5. [Admin Approval Process](#admin-approval-process)
6. [Customer Actions](#customer-actions)
7. [Procurement Workflow](#procurement-workflow)
8. [Termination States](#termination-states)
9. [Tax Calculation](#tax-calculation)
10. [Database Schema](#database-schema)
11. [Controllers & Services](#controllers--services)
12. [Frontend Components](#frontend-components)
13. [Notifications](#notifications)
14. [Security & Validation](#security--validation)

---

## Overview

The Product Request feature allows customers to request products that are not currently available in the e-commerce platform. The system manages the complete lifecycle from initial request submission through admin approval, customer confirmation, payment processing, procurement, and delivery.

### Key Features
- **Customer-driven product requests** with detailed specifications
- **Two-phase payment system**: Advance payment (before procurement) and Final payment (after product arrival)
- **Dual payment methods**: Online (Chapa) and Offline (Pay & Upload Proof)
- **Admin approval workflow** for both product requests and payments
- **Customer willingness confirmation** with ability to indicate lost interest
- **Procurement tracking** from initiation to product arrival
- **Automatic tax calculation** for all payments
- **Comprehensive status tracking** throughout the lifecycle

---

## Feature Architecture

### Core Components
1. **ProductRequest Model** - Central model managing all request data and business logic
2. **PaymentTransaction Model** - Tracks all payment transactions (advance and final)
3. **PaymentFinalizer Service** - Centralizes payment approval and status updates
4. **TaxService** - Calculates taxes for advance and final payments
5. **Multiple Controllers** - Handle various aspects of the workflow

### Data Flow
```
Customer Submission → Admin Review → Approval/Rejection
    ↓ (if approved)
Customer Willingness Confirmation → Advance Payment → Admin Payment Approval
    ↓ (after payment approved)
Procurement Process → Product Arrival → Final Payment → Admin Payment Approval
    ↓ (after final payment approved)
Order Creation → Completion
```

---

## Workflow States

The system uses a sophisticated workflow status system that dynamically determines the current state of a product request.

### Workflow Status Values

| Status | Description | Triggered When |
|--------|-------------|----------------|
| `pending_approval` | Waiting for admin to review | Request created, status = 'pending' |
| `rejected` | Admin rejected the request | Admin sets status = 'rejected' |
| `customer_lost_interest` | Customer indicated lost interest | `lost_interest_at` is set |
| `awaiting_customer_willingness` | Customer needs to confirm willingness | Status = 'approved', `customer_willing_to_buy` = false |
| `awaiting_advance_payment` | Customer needs to pay advance | Willingness confirmed, advance not paid |
| `pending_payment_approval` | Payment submitted, awaiting admin approval | `advance_payment_status` or `final_payment_status` = 'processing' |
| `awaiting_procurement` | Advance paid, waiting for procurement start | Advance paid, procurement = 'not_started' |
| `procurement_in_progress` | Product is being procured | Procurement = 'in_progress' |
| `awaiting_delivery` | Procurement completed, product not arrived | Procurement = 'completed', `product_arrived_at` = null |
| `awaiting_final_payment` | Product arrived, final payment required | `product_arrived_at` set, final payment not paid |
| `completed` | All payments completed | Final payment paid |

### Status Calculation Logic

The `getWorkflowStatus()` method in `ProductRequest` model calculates the status based on:
1. Request status (pending/rejected/approved)
2. Customer lost interest flag
3. Customer willingness confirmation
4. Advance payment status
5. Procurement status
6. Product arrival status
7. Final payment status

**Priority Order:**
1. Termination states (rejected, lost_interest) take highest priority
2. Payment approval states come before payment requirement states
3. Workflow progresses sequentially through procurement stages

---

## Payment System

### Payment Structure

The feature implements a **two-phase payment system**:

#### 1. Advance Payment
- **Purpose**: Secures the procurement process
- **Amount**: Set by admin when approving request
- **Timing**: After customer confirms willingness to buy
- **Status Flow**: `pending` → `processing` → `paid`

#### 2. Final Payment
- **Purpose**: Completes the transaction after product arrival
- **Amount**: Calculated as `total_amount - advance_amount`
- **Timing**: After product arrives at facility
- **Status Flow**: `pending` → `processing` → `paid`

### Payment Methods

#### Online Payment (Chapa)
- **Gateway**: Chapa payment gateway
- **Flow**:
  1. Customer initiates payment
  2. Redirected to Chapa checkout
  3. Webhook processes payment callback
  4. Status set to `processing` (awaiting admin approval)
  5. Admin approves in payment dashboard
  6. Status updated to `paid`
- **Transaction Reference Format**: 
  - Advance: `ADV-{product_request_id}-{timestamp}`
  - Final: `FINAL-{product_request_id}-{timestamp}`

#### Offline Payment (Pay & Upload Proof)
- **Flow**:
  1. Customer uploads payment proof
  2. Status immediately set to `processing`
  3. Admin reviews proof in payment dashboard
  4. Admin approves or rejects
  5. If approved, status updated to `paid`

### Payment Status Values

| Status | Meaning | Next Action |
|--------|---------|-------------|
| `pending` | No payment initiated | Customer can initiate payment |
| `processing` | Payment submitted, awaiting admin approval | Admin must approve/reject |
| `paid` | Payment approved and confirmed | Proceed to next workflow stage |

### Admin Payment Approval

**All payments require admin approval**, regardless of payment method:
- Payments appear in admin sales dashboard
- Payments are labeled as:
  - "Request Advance" for advance payments
  - "Request Final" for final payments
  - "Normal Purchase" for regular orders
- Admin must view payment details before approving
- Approval triggers workflow progression

---

## Admin Approval Process

### Request Approval

When a customer submits a product request, admin can:
1. **Review** request details
2. **Approve** with price and estimated arrival date
3. **Reject** with a reason

#### Approval Options
- **Status**: `pending` → `approved` or `rejected`
- **Price Setting**: 
  - Total amount
  - Advance amount (percentage or fixed)
  - Final amount (auto-calculated)
  - Currency
- **Estimated Arrival Date**: Helps customers make informed decisions
- **Rejection Reason**: Predefined reasons for transparency

#### Rejection Reasons
- Product not available
- Request doesn't meet criteria
- Other (with admin notes)

### Payment Approval

After a payment is submitted (online or offline):
1. Payment appears in admin dashboard with type label
2. Admin views payment details including:
   - Product request information
   - Payment amount and tax breakdown
   - Payment method (Chapa/Offline)
   - Proof of payment (for offline)
3. Admin approves or rejects
4. On approval:
   - Payment status → `paid`
   - Workflow progresses automatically
   - Customer receives notification

---

## Customer Actions

### 1. Submit Product Request
Customer fills out a form with:
- Product name, URL, description
- Image upload
- Specifications (brand, model, color, size, quantity)
- Shipping preferences
- Budget constraints
- Additional notes

### 2. Confirm Willingness
After admin approval:
- Customer sees approved request with price and estimated arrival date
- Customer can:
  - **Confirm Willingness**: Proceed with advance payment
  - **Indicate Lost Interest**: Exit the process with reason

#### Lost Interest Reasons
- Price Too High
- Delivery Date Too Long
- Simply Lost Interest
- Changed My Mind
- Found It Elsewhere
- Other (with notes)

**Lost Interest Behavior:**
- Request becomes "terminated"
- No further workflow updates allowed
- Status shows "Lost Interest" with reason
- Visible to both customer and admin

### 3. Pay Advance
After confirming willingness:
- Customer sees payment options:
  - **Online (Chapa)**: Redirects to payment gateway
  - **Offline (Pay & Upload Proof)**: Upload payment screenshot
- Tax is calculated and displayed
- After submission, status shows "Pending Payment Approval"
- Customer cannot pay again while approval is pending

### 4. Pay Final Payment
After product arrives:
- Customer receives notification
- Final payment amount displayed (with tax)
- Same payment options available
- Process mirrors advance payment

---

## Procurement Workflow

After advance payment is approved, procurement begins:

### Procurement Stages

1. **Not Started** (`not_started`)
   - Default state
   - Advance payment must be approved first

2. **In Progress** (`in_progress`)
   - Admin starts procurement
   - Sets expected completion date
   - Adds procurement notes
   - Customer receives notification with timeline

3. **Completed** (`completed`)
   - Admin marks procurement complete
   - System automatically marks product as arrived
   - Customer notified to make final payment
   - Final payment becomes available

### Procurement Actions

**Start Procurement:**
- Requires: Advance payment approved
- Admin sets: Expected completion date, notes
- Triggers: Notification to customer

**Complete Procurement:**
- Requires: Procurement must be in progress
- Auto-actions: Marks `product_arrived_at` (only if not already marked)
- Triggers: Notification to customer for final payment (only if product wasn't already marked as arrived)
- Note: If product was already marked as arrived independently, preserves existing arrival date and notes

**Mark Product as Arrived (Independent Action):**
- **New Feature**: Allows admin to mark product as arrived independently of procurement workflow
- Requires: 
  - Request must be approved
  - Advance payment must be paid
  - Request must not be terminated
- Features:
  - Optional arrival date (defaults to current date/time)
  - Optional arrival notes (stored in dedicated `arrival_notes` field)
  - Can update arrival date if already marked
  - Sends notification to customer
  - Updates workflow status automatically
- Use Cases:
  - Product arrives before procurement is completed
  - Need to mark arrival separately from procurement workflow
  - Update arrival date or add notes after initial marking
  - Admin wants more control over arrival timing

---

## Termination States

The system recognizes two termination states that prevent further workflow progression:

### 1. Rejected Request
- **Trigger**: Admin rejects the product request
- **State**: `status = 'rejected'`
- **Reason**: Admin provides rejection reason visible to customer
- **Effect**: All workflow operations blocked

### 2. Customer Lost Interest
- **Trigger**: Customer indicates lost interest after approval
- **State**: `lost_interest_at` is set
- **Reason**: Customer provides reason (visible to admin)
- **Effect**: All workflow operations blocked

### Termination Protection

The `isTerminated()` method checks both conditions. When terminated:
- **No payments** can be processed (advance or final)
- **No workflow updates** (willingness, procurement, arrival)
- **Payment webhooks** are ignored
- **Admin actions** are blocked
- **All attempts logged** with warnings

**Key Methods Protected:**
- `markCustomerWillingness()`
- `markAdvancePaid()`
- `markFinalPaid()`
- `startProcurement()`
- `completeProcurement()`
- `markProductArrived()`

---

## Tax Calculation

### Tax Service Integration

All payments (advance and final) include automatic tax calculation:

```php
TaxService::calculateTaxes($subtotal)
```

Returns:
- Individual tax components
- Total tax amount
- Grand total (subtotal + taxes)

### Tax Display

Both customer and admin see:
- **Subtotal**: Base amount (advance or final)
- **Tax Breakdown**: Individual tax components
- **Total Tax**: Sum of all taxes
- **Grand Total**: Amount to pay

### Tax Calculation Points

1. **Advance Payment Calculation**
   - Applied to `advance_amount`
   - Displayed before payment
   - Stored in payment transaction `gateway_payload`

2. **Final Payment Calculation**
   - Applied to `final_amount`
   - Displayed before payment
   - Stored in payment transaction `gateway_payload`

---

## Database Schema

### ProductRequest Table Fields

#### Basic Request Fields
- `user_id` - Customer who submitted request
- `product_name` - Name of requested product
- `product_url` - Link to product (if available)
- `description` - Detailed description
- `image` - Product image path
- `status` - Request status: `pending`, `approved`, `rejected`
- `admin_response` - Admin's response message
- `admin_id` - Admin who processed request

#### Price & Payment Fields
- `amount` - Total product price
- `advance_amount` - Advance payment amount
- `final_amount` - Final payment amount
- `advance_payment_status` - `pending`, `processing`, `paid`
- `final_payment_status` - `pending`, `processing`, `paid`
- `advance_paid_at` - Timestamp of advance payment approval
- `final_paid_at` - Timestamp of final payment approval
- `currency` - Payment currency (e.g., ETB)
- `payment_method` - Method used: `chapa`, `offline`
- `payment_reference` - Transaction reference

#### Procurement Fields
- `procurement_status` - `not_started`, `in_progress`, `completed`
- `procurement_notes` - Admin notes on procurement
- `procurement_started_at` - When procurement began
- `procurement_expected_completion_date` - Expected completion date
- `procurement_completed_at` - When procurement completed
- `product_arrived_at` - When product arrived at facility
- `arrival_notes` - Admin notes about product arrival (optional)

#### Customer Interaction Fields
- `customer_willing_to_buy` - Boolean: has customer confirmed?
- `willingness_confirmed_at` - Timestamp of confirmation
- `lost_interest_at` - Timestamp of lost interest indication
- `lost_interest_reason` - Reason for lost interest

#### Admin Management Fields
- `estimated_arrival_date` - Estimated arrival date (set by admin)
- `rejection_reason` - Reason for rejection (if rejected)
- `order_id` - Link to created order (after final payment)

### PaymentTransaction Table

Links to product requests via:
- `product_request_id` - Foreign key to ProductRequest
- `tx_ref` - Transaction reference (ADV- or FINAL- prefix)
- `gateway_payload` - JSON containing payment details:
  - `payment_type`: `advance` or `final`
  - `subtotal`: Base amount
  - `tax_amount`: Total taxes
  - `taxes`: Array of tax components
- `admin_status` - `unseen`, `seen`, `approved`, `rejected`

### OfflinePaymentSubmission Table

For offline payments:
- `product_request_id` - Links to request
- `payment_proof` - Path to uploaded proof image
- `payment_type` - `advance` or `final`

---

## Controllers & Services

### ProductRequest Model

**Core Business Logic:**
- `getWorkflowStatus()` - Calculates current workflow state
- `requiresAdvancePayment()` - Checks if advance payment needed
- `requiresFinalPayment()` - Checks if final payment needed
- `isTerminated()` - Checks if request is terminated
- `isActive()` - Checks if request can continue workflow

**Workflow Methods:**
- `markCustomerWillingness()` - Marks customer willingness (with termination check)
- `markAdvancePaid()` - Marks advance as paid (with termination check)
- `markFinalPaid()` - Marks final as paid (with termination check)
- `startProcurement()` - Starts procurement (with termination check)
- `completeProcurement()` - Completes procurement (with termination check)
- `markProductArrived()` - Marks product arrived (with termination check) - Model method
- `createOrder()` - Creates order after final payment

**Controller Methods:**
- `markProductArrived()` - Admin controller method for independent arrival marking (with validation, notes, date)

### RequestController

**Customer-facing actions:**
- `index()` - Lists customer's product requests
- `show()` - Shows single request details
- `confirmWillingness()` - Handles willingness confirmation
- `markLostInterest()` - Handles lost interest indication

**Features:**
- Refresh request before displaying (prevents stale data)
- Validation for lost interest (can't indicate after payment)
- Workflow status calculation

### AdminProductRequestController

**Admin management:**
- `index()` - Lists all product requests
- `show()` - Shows request details with payment info
- `update()` - Approves/rejects requests
  - Sets price (total, advance, final)
  - Sets estimated arrival date
  - Provides rejection reason
- `startProcurement()` - Initiates procurement
- `completeProcurement()` - Completes procurement
- `markProductArrived()` - Marks product as arrived independently (with arrival date and notes)

**Features:**
- Refresh before actions (prevents stale data)
- Termination checks
- Validation for procurement workflow
- Enhanced notifications with context
- Independent arrival marking (not tied to procurement completion)
- Smart notification handling (prevents duplicate notifications)

### PaymentController

**Payment processing:**
- `processPayment()` - Handles Chapa payment initiation
  - Creates PaymentTransaction
  - Sets status to `processing`
  - Redirects to Chapa
  - Termination checks
- `submitOffline()` - Handles offline payment submission
  - Creates PaymentTransaction
  - Creates OfflinePaymentSubmission
  - Sets status to `processing`
  - Termination checks
- `paymentReturn()` - Handles Chapa return callback
  - Updates status to `processing` if webhook delayed
  - Renders success/failure pages
  - Termination checks

**Features:**
- Tax calculation integration
- Product request detection (via tx_ref prefix or product_request_id)
- Distinct success/failure pages for product requests
- Race condition handling (webhook delays)

### ProductRequestPaymentController

**Product request specific payments:**
- `showAdvancePaymentMethod()` - Shows advance payment options
- `processAdvancePayment()` - Processes advance payment
- `processFinalPayment()` - Processes final payment
- `advancePaymentSuccess()` - Advance payment success page
- `finalPaymentSuccess()` - Final payment success page

**Features:**
- Tax calculation
- Refresh before processing (prevents duplicate payments)
- Termination checks
- Validation (advance before final, etc.)

### ChapaWebhookController

**Webhook handling:**
- `handle()` - Processes Chapa webhook callbacks
- `handleProductRequestPayment()` - Specific handling for product requests
  - Identifies payment type (ADV/FINAL)
  - Sets status to `processing`
  - Links PaymentTransaction
  - Sets `admin_status` to `unseen`
  - Termination checks

**Features:**
- Payment type detection from `tx_ref` prefix
- Idempotent processing
- Notification sending

### PaymentFinalizer Service

**Centralized payment approval:**
- `finalizeOrder()` - Main entry point for payment finalization
- `canFinalizeOrder()` - Checks if payment can be finalized
- Handles both normal orders and product requests
- Calls appropriate model methods:
  - `markAdvancePaid()` for advance payments
  - `markFinalPaid()` for final payments
- Creates order if needed (for final payments)
- Termination checks

**Features:**
- Idempotent processing (returns false if already processed)
- Comprehensive logging
- Notification sending
- Error handling

### OfflinePaymentController

**Offline payment management:**
- `adminUpdateStatus()` - Admin approval/rejection
- Calls `PaymentFinalizer::finalizeOrder()` on approval
- Handles both normal orders and product requests

---

## Frontend Components

### Customer Views

#### Request Dashboard (`request/request-dashboard.tsx`)
- Lists all customer's product requests
- Shows workflow status badges
- Displays rejection reasons (if applicable)
- Action buttons:
  - "Confirm Willingness" (if approved, not paid)
  - "Lost Interest" (if approved, not paid)
  - "Pay Advance" (if willingness confirmed)
  - "View Details"
- Status color coding

#### Request Detail (`request/show.tsx`)
- Full request details
- Price breakdown (total, advance, final)
- Tax calculation display
- Estimated arrival date
- Workflow status badge
- **Product Arrived Banner** (new):
  - Prominent green banner when product arrives
  - Displays arrival date
  - Shows arrival notes if provided
  - Clear call-to-action for final payment
- Action buttons:
  - "Confirm Willingness" dialog
  - "Lost Interest" dialog (with reason dropdown)
  - "Pay Advance" / "Pay Final" buttons (enhanced styling when product arrived)
- Payment pending messages
- Rejection reason display

#### Payment Success Pages
- `product-requests/advance-payment-success-chapa.tsx`
- `product-requests/advance-payment-success-offline.tsx`
- `product-requests/final-payment-success-chapa.tsx`
- `product-requests/final-payment-success-offline.tsx`
- "Back to Requests" navigation
- "View Product Request Details" link

#### Payment Failure Pages
- `product-requests/advance-payment-failure.tsx`
- `product-requests/final-payment-failure.tsx`
- Error messages
- "Try Again" option
- "Back to Product Request" navigation

### Admin Views

#### Product Request Index (`admin/product-request/index.tsx`)
- Lists all product requests
- Status filters
- Workflow status badges
- Shows lost interest status (if applicable)
- Links to detail view

#### Product Request Detail (`admin/product-request/show.tsx`)
- Complete request information
- Customer willingness status
- Lost interest display (if applicable)
- Payment status (advance and final)
- Procurement status and controls
- **Product Arrival Status** (new):
  - Displays arrival date
  - Shows arrival notes if provided
  - Visual indicator when product has arrived
- Payment transaction list
- Price information
- Estimated arrival date
- Rejection reason (if rejected)
- Action buttons:
  - Edit (approve/reject)
  - Start Procurement
  - Complete Procurement
  - **Mark Product as Arrived** (new independent action)
    - Dialog with arrival date picker
    - Optional arrival notes field
    - Can update arrival date if already marked

#### Payment Dashboard (`admin/payment/index.tsx` & `admin/sales/index.tsx`)
- Lists all payments
- Payment type badges:
  - "Request Advance" (product request advance)
  - "Request Final" (product request final)
  - "Normal Purchase" (regular orders)
- Payment method indicators
- Status indicators
- "View Details" button (approve/reject removed from list)
- Bulk actions (Mark Seen)

#### Payment Detail (`admin/payment/show.tsx`)
- Payment transaction details
- Product request information (if applicable)
- Payment type badge
- Payment amount and tax breakdown
- Payment method
- Gateway status
- Admin status
- Approve/Reject buttons
- Order items (for normal purchases)

---

## Notifications

### Notification Types

#### ProductRequestStatusUpdated
Sent for various state changes:

1. **Request Approved**
   - Subject: "Product Request Approved"
   - Message: Includes price, advance, final amounts, estimated arrival date
   - Action: View request details

2. **Request Rejected**
   - Subject: "Product Request Rejected"
   - Message: Includes rejection reason with user-friendly explanation
   - Action: View request details

3. **Advance Payment Pending Approval** (Chapa/Offline)
   - Subject: "Advance Payment Pending Approval"
   - Message: Payment received, awaiting admin approval
   - Action: View request details

4. **Advance Payment Approved**
   - Subject: "Advance Payment Approved"
   - Message: Payment approved, procurement will start
   - Action: View request details

5. **Procurement Started**
   - Subject: "We're Getting Your Product"
   - Message: Includes expected completion date and timeline
   - Action: View request details

6. **Product Arrived**
   - Subject: "Product Arrived - Final Payment Required" (when marked independently)
   - Subject: "Product Arrived - Payment Required" (when marked via procurement completion)
   - Message: Product ready, final payment required
   - Action: View request details
   - Triggered when: Admin marks product as arrived (independently or via procurement completion)

7. **Final Payment Pending Approval**
   - Subject: "Final Payment Pending Approval"
   - Message: Payment received, awaiting admin approval
   - Action: View request details

8. **Final Payment Approved**
   - Subject: "Final Payment Approved"
   - Message: Order complete, delivery will proceed
   - Action: View order details

---

## Security & Validation

### Authorization Checks

**Customer Actions:**
- Customers can only view/edit their own requests
- Ownership verified via `user_id` check
- 403 errors for unauthorized access

**Admin Actions:**
- Admin role required for:
  - Request approval/rejection
  - Payment approval
  - Procurement management
- Middleware protection on routes

### Validation Rules

**Request Submission:**
- Required fields: product_name, description
- Optional: image, product_url, specifications
- File upload validation for images

**Payment Processing:**
- Advance payment: Requires willingness confirmation
- Final payment: Requires advance payment completion
- Duplicate payment prevention
- Termination state checks

**Admin Actions:**
- Procurement start: Requires advance payment approval
- Procurement complete: Requires procurement in progress
- Price validation: Positive amounts, currency valid

### Data Integrity

**Termination Protection:**
- All workflow methods check `isTerminated()`
- No updates allowed for terminated requests
- Logging of all blocked attempts

**State Consistency:**
- Model refresh before critical operations
- Idempotent payment methods
- Workflow state validation

**Race Condition Handling:**
- Webhook delays handled in `paymentReturn()`
- Status updates synchronized
- Database transactions for critical operations

---

## Key Design Decisions

### 1. Two-Phase Payment System
**Why**: Secures commitment before procurement, reduces risk of abandoned orders after product arrival.

### 2. Admin Approval for All Payments
**Why**: Ensures payment verification, prevents fraudulent transactions, gives admin control over workflow.

### 3. Processing Status
**Why**: Clearly separates "payment submitted" from "payment confirmed", prevents duplicate payments.

### 4. Termination States
**Why**: Prevents workflow progression for requests that shouldn't continue, maintains data integrity.

### 5. Tax Calculation Integration
**Why**: Ensures accurate pricing, transparent cost breakdown for customers.

### 6. Distinct Success/Failure Pages
**Why**: Better user experience, clear navigation, context-specific messaging.

### 7. Model Refresh Before Actions
**Why**: Prevents stale data issues, ensures UI reflects current database state.

### 8. Centralized Payment Finalization
**Why**: Single source of truth for payment approval logic, consistent behavior across payment methods.

---

## Future Enhancements

Potential improvements (not yet implemented):
- Automatic procurement status updates via supplier integration
- Email notifications for admin on payment submissions
- Bulk procurement management
- Payment refund handling
- Request modification after approval
- Customer rating/review after completion
- Automated workflow transitions
- Integration with shipping providers
- Real-time status updates via WebSockets

---

## Testing

### Test Coverage

Comprehensive test suites exist:
- `ProductRequestPaymentBreakageTest.php` - Payment flow breakage tests
- `WillingnessPaymentSyncBreakageTest.php` - Willingness/payment synchronization
- `ChapaPaymentStatusSyncBreakageTest.php` - Chapa payment status sync
- `StatusDisplayBreakageTest.php` - Status display accuracy

### Test Groups
- `product-request-payment-breakage`
- `willingness-payment-sync`
- `thisgroup` (Chapa status sync)
- `status-display-breakage`

---

## API Routes

### Customer Routes
- `GET /requests` - List customer's requests
- `GET /requests/{id}` - View request details
- `POST /requests/{id}/confirm-willingness` - Confirm willingness
- `POST /requests/{id}/lost-interest` - Indicate lost interest
- `GET /product-requests/{id}/advance-payment` - Show advance payment options
- `POST /product-requests/{id}/advance-payment` - Process advance payment
- `POST /product-requests/{id}/final-payment` - Process final payment

### Admin Routes
- `GET /admin/product-requests` - List all requests
- `GET /admin/product-requests/{id}` - View request details
- `PUT /admin/product-requests/{id}` - Update request (approve/reject)
- `POST /admin/product-requests/{id}/start-procurement` - Start procurement
- `POST /admin/product-requests/{id}/complete-procurement` - Complete procurement
- `POST /admin/product-requests/{id}/mark-arrived` - Mark product as arrived (independent action)
- `GET /admin/payments` - List all payments
- `GET /admin/payments/{id}` - View payment details
- `POST /admin/payments/{id}/approve` - Approve payment
- `POST /admin/payments/{id}/reject` - Reject payment

### Payment Routes
- `POST /payment/process` - Process Chapa payment
- `POST /payment/submit-offline` - Submit offline payment proof
- `GET /payment/return` - Chapa payment return callback
- `POST /chapa/webhook` - Chapa webhook endpoint

---

## Conclusion

The Product Request feature provides a comprehensive solution for handling custom product requests with a sophisticated workflow, secure payment processing, and complete admin oversight. The system is designed with data integrity, user experience, and business requirements in mind.

For questions or issues, refer to the codebase or contact the development team.

---

**Last Updated**: December 2024
**Version**: 1.1

## Recent Updates (Version 1.1)

### Product Arrival Feature
- Added independent "Mark Product as Arrived" action for admins
- Product arrival can now be marked separately from procurement completion
- Added `arrival_notes` field for admin notes about product arrival
- Enhanced customer UI with prominent arrival banner
- Improved final payment card visibility when product arrives
- Updated dashboard status badges to highlight product arrival
- Smart notification handling prevents duplicate notifications

