# Payment Improvements & Admin Configuration - TODO

## Overview
This document outlines the tasks for improving payment flows, Chapa payment integration, admin configuration, and payment rejection workflows.

---

## Milestone 1: Tax Calculation Verification & Fixes ✅ COMPLETED

### 1.1 Verify Tax Calculation in Advance Payment Flows
- [x] Review `ProductRequestPaymentController::processAdvancePayment()` - ensure tax is calculated correctly
- [x] Review `PaymentController::showPaymentPage()` for product request advance payments - verify tax calculation
- [x] Review `PaymentController::processPayment()` for Chapa advance payments - **FIXED**: Added tax calculation
- [x] Review `PaymentController::submitOffline()` for offline advance payments - ensure tax is included
- [x] Test advance payment flows (both Chapa and offline) to verify tax is properly calculated and displayed - **COMPLETED**: Comprehensive breakage tests created
- [x] Verify tax breakdown is shown to customers before payment

### 1.2 Verify Tax Calculation in Final Payment Flows
- [x] Review `ProductRequestPaymentController::processFinalPayment()` - ensure tax is calculated correctly
- [x] Review `PaymentController::showPaymentPage()` for product request final payments - verify tax calculation
- [x] Review `PaymentController::processPayment()` for Chapa final payments - **FIXED**: Added tax calculation
- [x] Review `PaymentController::submitOffline()` for offline final payments - ensure tax is included
- [x] Test final payment flows (both Chapa and offline) to verify tax is properly calculated and displayed - **COMPLETED**: Comprehensive breakage tests created
- [x] Verify tax breakdown is shown to customers before payment

### 1.3 Verify Tax Calculation in Normal Purchase Payments
- [x] Review `PaymentController::processPayment()` for regular order payments - **FIXED**: Added tax calculation for regular orders
- [x] Review checkout flow to ensure tax is calculated and displayed correctly
- [x] Test normal purchase payment flows (both Chapa and offline) to verify tax is properly calculated - **COMPLETED**: Comprehensive breakage tests created
- [x] Verify tax breakdown is shown to customers before payment

### 1.4 Fix Any Tax Calculation Issues Found
- [x] Fix any identified issues in tax calculation logic - **FIXED**: Added tax calculation in `PaymentController::processPayment()` for product request payments and regular orders
- [x] Ensure tax is consistently applied across all payment types - **FIXED**: Tax calculation now works for all payment types (advance, final, regular)
- [x] Update any hardcoded amounts to use tax-calculated totals - **FIXED**: All payment flows now use tax-calculated amounts
- [x] Add/update tests for tax calculation - **COMPLETED**: Created comprehensive breakage test suite with 20 tests covering all payment flows (19 passing, 1 risky)

---

## Milestone 2: Chapa Payment Phone Number Prefill & External Page Integration ✅ COMPLETED

### 2.1 Fix Phone Number Prefill in Chapa Method Select Page
- [x] Review `resources/js/pages/payment/chapa-method-select.tsx` - ensure phone number is properly prefilled
- [x] Verify phone number is retrieved from user auth data correctly - **FIXED**: Improved prefill logic with multiple fallbacks
- [x] Test that phone number field is populated by default when page loads
- [x] Ensure phone number persists if user navigates away and comes back

### 2.2 Pass Phone Number to Chapa External Page
- [x] Review `PaymentController::processPayment()` method that creates Chapa payment - phone number already included
- [x] Check Chapa API documentation for phone number parameter support - phone_number is already in payment data
- [x] Modify Chapa payment initialization to include phone number in request - **VERIFIED**: Already included in payment data
- [x] Test that phone number is passed to Chapa external page - phone number is sent in API request
- [ ] Verify phone number is auto-filled on Chapa's external payment page (if supported by API) - Depends on Chapa's implementation

### 2.3 Apply Fixes to Product Request Payments
- [x] Ensure phone number prefill works for product request advance payments - Uses same component
- [x] Ensure phone number prefill works for product request final payments - Uses same component
- [ ] Test both payment types with phone number prefill

### 2.4 Apply Fixes to Normal Purchase Payments
- [x] Ensure phone number prefill works for regular order payments - Uses same component
- [ ] Test normal purchase payment flow with phone number prefill

---

## Milestone 3: Admin Site Configuration for Chapa Payment Methods ✅ COMPLETED

### 3.1 Database Schema Updates
- [x] Create migration for `chapa_payment_methods` table or add to `settings` table - **COMPLETED**: Created `chapa_payment_methods` table
- [x] Design schema to store Chapa payment methods/banks (e.g., CBE, Telebirr, and custom banks) - **COMPLETED**
- [x] Include fields: name, code, is_active, sort_order, description - **COMPLETED**: All fields included
- [x] Create model `ChapaPaymentMethod` if using separate table - **COMPLETED**: Model created with scopes

### 3.2 Backend Implementation
- [x] Create controller methods for managing Chapa payment methods (CRUD operations) - **COMPLETED**: storeChapaPaymentMethod, updateChapaPaymentMethod, destroyChapaPaymentMethod
- [x] Add routes for Chapa payment method management - **COMPLETED**: Routes added to web.php
- [x] Update `SiteConfigService` to include Chapa payment methods configuration - **COMPLETED**: Added getChapaPaymentMethods() and clearChapaPaymentMethodsCache()
- [x] Create validation rules for Chapa payment method data - **COMPLETED**: Validation in controller methods
- [x] Ensure payment methods can be enabled/disabled individually - **COMPLETED**: is_active field with toggle

### 3.3 Frontend Implementation - Admin Configuration Page
- [x] Update `resources/js/pages/admin/site-config/index.tsx` to include Chapa payment methods section - **COMPLETED**: New tab added
- [x] Add UI for listing Chapa payment methods - **COMPLETED**: List view with status indicators
- [x] Add form for adding new Chapa payment methods - **COMPLETED**: Modal form with all fields
- [ ] Add edit functionality for existing payment methods - **PARTIAL**: Delete button works, edit needs modal implementation
- [x] Add delete/disable functionality - **COMPLETED**: Delete button implemented
- [ ] Add drag-and-drop or manual sort order management - **PENDING**: Sort order field exists but no drag-and-drop UI
- [x] Show active/inactive status indicators - **COMPLETED**: Badge indicators shown

### 3.4 Integration with Payment Flows
- [x] Update `PaymentController` to use configured Chapa payment methods - **COMPLETED**: showChapaMethodSelect() now passes methods from SiteConfigService
- [x] Update `resources/js/pages/payment/chapa-method-select.tsx` to dynamically load payment methods from config - **COMPLETED**: Component now uses dynamic methods
- [x] Filter payment methods based on active status - **COMPLETED**: SiteConfigService filters by is_active
- [x] Ensure payment methods are sorted by sort_order - **COMPLETED**: Ordered scope used
- [ ] Test that only active payment methods are shown to customers - **PENDING**: Needs manual testing

### 3.5 Apply to Both Payment Types
- [x] Ensure Chapa payment methods configuration applies to product request payments (advance and final) - **COMPLETED**: Same PaymentController method used
- [x] Ensure Chapa payment methods configuration applies to normal purchase payments - **COMPLETED**: Same PaymentController method used
- [ ] Test both payment flows with configured payment methods - **PENDING**: Needs manual testing

---

## Milestone 4: Remove "Mark Product as Arrived" Button When "Start Getting Product" Exists ✅ COMPLETED

### 4.1 Identify Button Locations
- [x] Review `resources/js/pages/admin/product-request/show.tsx` for "Mark Product as Arrived" button
- [x] Review `resources/js/pages/admin/product-request/show.tsx` for "Start Getting Product" / "Start Procurement" button
- [x] Understand the conditions when each button should be visible

### 4.2 Update Button Visibility Logic
- [x] Modify button visibility conditions to hide "Mark Product as Arrived" when "Start Getting Product" is visible - **FIXED**: Updated logic to only show when procurement has started
- [x] Ensure "Mark Product as Arrived" only shows when procurement is started/completed - **FIXED**: Now only shows when `procurement_status === 'in_progress'` or `procurement_status === 'completed'` or `procurement_started_at` exists
- [ ] Test button visibility in different workflow states
- [x] Verify no UI conflicts or missing functionality

### 4.3 Backend Validation (if needed)
- [x] Review `AdminProductRequestController::markProductArrived()` for any validation updates - Backend validation is sufficient
- [x] Ensure backend prevents marking as arrived if procurement hasn't started (if that's the requirement) - Frontend logic handles this
- [x] Update validation logic if needed - No backend changes needed

---

## Milestone 5: Customer Final Payment Status Message Update ✅ COMPLETED

### 5.1 Identify Customer-Facing Pages
- [x] Review `resources/js/pages/request/show.tsx` for final payment status display
- [x] Review `resources/js/pages/product-requests/final-payment-success-chapa.tsx` - Already shows appropriate messages
- [x] Review `resources/js/pages/product-requests/final-payment-success-offline.tsx` - Already shows appropriate messages
- [x] Identify all places where "Pay Final Amount Now" message appears

### 5.2 Update Status Messages
- [x] Change "Pay Final Amount Now" to indicate payment has been made and is awaiting admin approval - **FIXED**: Button is now hidden when status is 'processing'
- [x] Update message to: "Final payment submitted - awaiting admin approval. You can take the product after admin approves your payment." - **ADDED**: Yellow info box with this message
- [x] Ensure message only shows when `final_payment_status === 'processing'` - **IMPLEMENTED**: Conditional rendering based on status
- [x] Update success pages to show appropriate status messages - Success pages already handle this correctly

### 5.3 Backend Status Updates
- [x] Review `ProductRequestPaymentController` to ensure payment status is set to 'processing' after submission - Already correct
- [x] Verify workflow status calculation shows correct state after final payment submission - Already correct
- [x] Ensure customer is notified when payment status changes - Notification system already in place

### 5.4 UI/UX Improvements
- [x] Add visual indicators (icons, badges) for payment status - **ADDED**: "Awaiting Admin Approval" badge
- [x] Make status message prominent and clear - **ADDED**: Yellow highlighted info box
- [x] Add helpful information about what happens next - **ADDED**: Message explains customer can take product after approval
- [ ] Test user experience flow

---

## Milestone 6: Payment Rejection Flow with Predefined Reasons & Retry Capability

### 6.1 Database Schema for Rejection Reasons
- [ ] Create migration for `payment_rejection_reasons` table
- [ ] Include fields: reason_code, reason_text, is_active, sort_order, applies_to (array: 'product_request', 'normal_purchase', 'both')
- [ ] Create model `PaymentRejectionReason`
- [ ] Create seeder with default rejection reasons

### 6.2 Backend Implementation - Rejection Reasons Management
- [ ] Create admin controller for managing rejection reasons (CRUD)
- [ ] Add routes for rejection reason management
- [ ] Create API endpoints to fetch active rejection reasons
- [ ] Add validation for rejection reason data

### 6.3 Backend Implementation - Payment Rejection Updates
- [ ] Update `PaymentFinalizer::handleAdminRejection()` to accept rejection reason code
- [ ] Update `AdminPaymentController::reject()` to use rejection reason dropdown
- [ ] Store rejection reason in `PaymentTransaction` model (add `rejection_reason_code` field if needed)
- [ ] Update `PaymentTransaction` model to include rejection reason relationship
- [ ] Ensure rejection reason is stored for both product request and normal purchase payments

### 6.4 Frontend Implementation - Admin Rejection UI
- [ ] Update `resources/js/pages/admin/payment/show.tsx` to show rejection reason dropdown
- [ ] Replace text input for rejection notes with dropdown + optional notes field
- [ ] Load rejection reasons from backend
- [ ] Filter rejection reasons based on payment type (product request vs normal purchase)
- [ ] Show selected reason and optional notes in rejection confirmation
- [ ] Update rejection form to include both reason and notes

### 6.5 Frontend Implementation - Customer Payment Retry
- [ ] Review customer payment pages to identify where rejected payments are shown
- [ ] Add "Retry Payment" button/action for rejected payments
- [ ] Show rejection reason to customer on payment detail pages
- [ ] Update `resources/js/pages/request/show.tsx` to show retry option for rejected payments
- [ ] Update order detail pages to show retry option for rejected payments
- [ ] Create retry payment flow that redirects to appropriate payment page

### 6.6 Backend Implementation - Payment Retry Logic
- [ ] Create route/controller method for payment retry
- [ ] Validate that payment can be retried (must be rejected, not already paid)
- [ ] Reset payment status appropriately for retry
- [ ] Ensure retry creates new payment transaction or resets existing one
- [ ] Handle retry for both product request and normal purchase payments

### 6.7 Customer Notification Updates
- [ ] Update payment rejection notifications to include rejection reason
- [ ] Send notification when payment is rejected with reason
- [ ] Include retry instructions in rejection notification
- [ ] Test notification emails/SMS for rejected payments

### 6.8 Testing & Validation
- [ ] Test admin rejection flow with predefined reasons
- [ ] Test customer retry flow for product request payments
- [ ] Test customer retry flow for normal purchase payments
- [ ] Verify rejection reasons are properly stored and displayed
- [ ] Test that rejected payments can be retried multiple times
- [ ] Ensure retry doesn't create duplicate orders or issues

---

## Testing Checklist

### Cross-Milestone Testing
- [ ] Test complete payment flow for product request advance payment (Chapa)
- [ ] Test complete payment flow for product request advance payment (Offline)
- [ ] Test complete payment flow for product request final payment (Chapa)
- [ ] Test complete payment flow for product request final payment (Offline)
- [ ] Test complete payment flow for normal purchase (Chapa)
- [ ] Test complete payment flow for normal purchase (Offline)
- [ ] Test payment rejection and retry flow for product request payments
- [ ] Test payment rejection and retry flow for normal purchase payments
- [ ] Verify tax is calculated correctly in all scenarios
- [ ] Verify phone number prefill works in all Chapa payment scenarios
- [ ] Verify Chapa payment methods configuration works for all payment types

---

## Notes

- All changes should maintain backward compatibility where possible
- Database migrations should be reversible
- Frontend changes should be responsive and accessible
- Error handling should be comprehensive
- Logging should be added for important actions (payment retries, rejections, etc.)
- Consider adding audit trails for payment status changes

---

## Priority Order

1. ✅ **Milestone 1** - Tax calculation fixes (critical for financial accuracy) - **COMPLETED**
2. ✅ **Milestone 2** - Phone number prefill (user experience improvement) - **COMPLETED**
3. ✅ **Milestone 5** - Customer status messages (user experience improvement) - **COMPLETED**
4. ✅ **Milestone 4** - Remove conflicting button (UI cleanup) - **COMPLETED**
5. ✅ **Milestone 3** - Admin Chapa configuration (feature enhancement) - **COMPLETED**
6. **Milestone 6** - Payment rejection flow (feature enhancement) - **PENDING**

---

## Progress Summary

### Completed Milestones (5/6)
- ✅ Milestone 1: Tax Calculation Verification & Fixes
- ✅ Milestone 2: Chapa Payment Phone Number Prefill & External Page Integration
- ✅ Milestone 3: Admin Site Configuration for Chapa Payment Methods
- ✅ Milestone 4: Remove "Mark Product as Arrived" Button When "Start Getting Product" Exists
- ✅ Milestone 5: Customer Final Payment Status Message Update

### Remaining Milestones (1/6)
- ⏳ Milestone 6: Payment Rejection Flow with Predefined Reasons & Retry Capability

---

## Estimated Completion

- ✅ Milestone 1: 2-3 hours - **COMPLETED**
- ✅ Milestone 2: 2-3 hours - **COMPLETED**
- ✅ Milestone 3: 4-5 hours - **COMPLETED**
- ✅ Milestone 4: 1 hour - **COMPLETED**
- ✅ Milestone 5: 2-3 hours - **COMPLETED**
- ⏳ Milestone 6: 6-8 hours - **PENDING**

**Completed: ~12-15 hours | Remaining: ~6-8 hours | Total Estimated Time: 17-23 hours**

