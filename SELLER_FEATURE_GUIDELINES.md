# Supplier Feature Guidelines & Industry Standards

## Overview
This document outlines the industry best practices and guidelines for implementing the seller/supplier feature in our marketplace, focusing on role-based access, user experience, and workflow.

## Core Principles

### 1. Role-Based Access Control
- Single user account with multiple roles (buyer/supplier)
- Clear separation of buyer and supplier interfaces
- Role-based UI components and navigation
- Dedicated supplier dashboard (not shared with customer dashboard)

### 2. Supplier Onboarding Flow
- Dedicated "Become a Supplier" registration path
- Business and KYC information collection
- Admin approval workflow
- Clear communication of approval status

### 3. Supplier Dashboard Architecture
- **Dedicated supplier interface** (separate from customer dashboard)
- Key metrics and analytics
- Product management tools
- Order and inventory management
- Sales and earnings reporting
- Role-switching capability for multi-role users

## Implementation Guidelines

### User Experience
- Redirect approved suppliers to their dedicated dashboard upon login
- Provide clear visual distinction between buyer and supplier modes
- Include role-based navigation with supplier-specific menu items
- Implement a supplier onboarding wizard
- Enable role-switching for users with multiple roles

### Technical Implementation
- Use Spatie roles and permissions
- Implement middleware for role-based routing
- **Use shared Product model** with supplier-specific fields (not separate models)
- **Use shared Category system** for all products (platform + supplier)
- Create dedicated supplier layout and views
- Ensure data isolation between suppliers

### Product & Category Architecture
- **Shared Product Model**: Extend existing Product model with supplier fields
  - `supplier_id` (nullable FK to users.id)
  - `moderation_status` (draft, pending_review, approved, rejected, suspended)
  - `visibility` (private, public)
  - `rejection_reason` (text)
- **Shared Category System**: All products use same category hierarchy
  - Better discoverability for customers
  - Unified browsing experience
  - Simplified management for admins
- **Enhanced Order/OrderItem Models**: Add supplier-specific fields
  - `supplier_id`, `vendor_earnings`, `platform_commission`

### Security
- Role-based access control (RBAC)
- Data validation and sanitization
- Secure file uploads for product images
- Audit logging for sensitive actions

## Workflow

### Supplier Registration
1. User clicks "Become a Supplier"
2. Completes supplier application with KYC information
3. Application goes to admin for review
4. Admin approves/rejects with feedback
5. On approval, supplier role is assigned
6. Welcome email with next steps sent
7. Redirect to dedicated supplier dashboard

### Product Listing
1. Supplier adds product details using shared category system
2. System validates and saves as draft
3. Product goes through moderation workflow
4. Admin approves/rejects with feedback
5. Approved products become visible to customers
6. Products appear in same category pages as platform products

### Dashboard Navigation
1. Suppliers access dedicated dashboard at `/supplier/dashboard`
2. Role-based navigation shows supplier-specific menu items
3. Multi-role users can switch between customer and supplier views
4. Dashboard shows supplier-specific metrics and tools

## Required Supplier Pages

### Core Dashboard Pages
- **Dashboard Overview** (`/supplier/dashboard`) - Main metrics and status
- **Products Management** (`/supplier/products`) - CRUD operations
- **Orders Management** (`/supplier/orders`) - Order fulfillment
- **Earnings** (`/supplier/earnings`) - Financial tracking

### Product Management Pages
- **Product Creation** (`/supplier/products/create`) - Add new products
- **Product Editing** (`/supplier/products/{id}/edit`) - Modify existing products
- **Product Submission** (`/supplier/products/{id}/submit`) - Submit for review
- **Product Analytics** (`/supplier/products/{id}/analytics`) - Performance metrics

### Order Management Pages
- **Order Details** (`/supplier/orders/{id}`) - Individual order management
- **Order Fulfillment** (`/supplier/orders/{id}/fulfill`) - Shipping and tracking
- **Order History** (`/supplier/orders/history`) - Past orders archive

### Financial Pages
- **Earnings Details** (`/supplier/earnings/details`) - Detailed financial breakdown
- **Payout Requests** (`/supplier/payouts`) - Request payouts
- **Commission Reports** (`/supplier/earnings/reports`) - Commission analytics

### Settings & Profile
- **Supplier Settings** (`/supplier/settings`) - Business profile management
- **Store Settings** (`/supplier/store`) - Store customization
- **Notification Settings** (`/supplier/notifications`) - Alert preferences

## Best Practices
- Clear separation of concerns between customer and supplier interfaces
- Consistent UI/UX patterns across supplier pages
- Mobile-responsive design for all supplier interfaces
- Performance optimization for supplier dashboard
- Comprehensive documentation for supplier workflows
- **Use shared models** for products and categories (not separate models)
- **Dedicated dashboard** for suppliers (not shared with customers)

## Future Considerations
- Seller verification levels
- Subscription plans for suppliers
- Advanced analytics and reporting
- Multi-vendor shipping solutions
- Seller performance metrics and incentives
- Supplier storefront customization
