# Chapa Payment Flow Explanation

## Overview

This document explains how the Chapa payment integration works in the e-commerce system, clarifying the roles of admin configuration, merchant accounts, and customer phone numbers.

---

## 1. Admin "Chapa Methods" Tab - What It Does

The **"Chapa Methods"** tab in the admin site config page is **NOT** for configuring merchant account details. Instead, it only manages which payment options are available to customers.

### What's Stored in Chapa Payment Methods:

- **Name** (e.g., "Telebirr", "CBE", "M-Pesa") - Display name for customers
- **Code** (e.g., "telebirr", "cbe", "mpesa") - Used in API calls to Chapa
- **Description** - Customer-facing description text
- **Logo** - Optional image/icon for the payment method
- **Active Status** - Whether the method is enabled/disabled

**Important:** No phone numbers or account details are stored here. This is purely metadata about which payment options customers can choose from.

---

## 2. Merchant Account Configuration

The merchant's Chapa account (where payments are received) is configured via **environment variables** in your `.env` file:

```env
CHAPA_SECRET_KEY=your_secret_key_here
CHAPA_PUBLIC_KEY=your_public_key_here
CHAPA_BASE_URL=https://api.chapa.co/v1
```

### How It Works:

- These API keys identify **your merchant account** to Chapa
- When a payment is processed, Chapa automatically routes the money to **your account** based on these keys
- **No phone numbers or account details need to be stored in the database** - Chapa handles this via your API credentials

### ⚠️ IMPORTANT: You Only Need ONE Merchant Account

**Question:** Does the merchant/business owner need to have separate wallets/accounts for each payment method (Telebirr, CBE, etc.)?

**Answer: NO!** You only need **ONE Chapa merchant account**, regardless of how many payment methods you offer to customers.

#### How Chapa Handles Multiple Payment Methods:

Chapa acts as a **payment aggregator/gateway** (similar to Stripe or PayPal). Here's how it works:

1. **You have ONE Chapa merchant account** (identified by your API keys)
2. **Customers can pay using various methods** (Telebirr, CBE Birr, M-Pesa, etc.)
3. **Chapa handles the complexity:**
   - When a customer pays with Telebirr → Chapa processes it through Telebirr's system
   - When a customer pays with CBE → Chapa processes it through CBE's system
   - When a customer pays with M-Pesa → Chapa processes it through M-Pesa's system
4. **All payments settle into YOUR single Chapa merchant account**, regardless of which payment method the customer used

#### Example Flow:

```
Customer pays with Telebirr → Chapa processes via Telebirr → Money goes to YOUR Chapa account
Customer pays with CBE      → Chapa processes via CBE      → Money goes to YOUR Chapa account
Customer pays with M-Pesa   → Chapa processes via M-Pesa    → Money goes to YOUR Chapa account
```

**You do NOT need:**
- ❌ A separate Telebirr wallet
- ❌ A separate CBE account
- ❌ A separate M-Pesa account
- ❌ Multiple merchant accounts

**You only need:**
- ✅ ONE Chapa merchant account (with API keys)
- ✅ Chapa handles all payment method integrations for you

### Location in Code:

- Configuration: `config/services.php`
- Usage: `app/Http/Controllers/PaymentController.php` (lines 32-34)

---

## 3. Customer Payment Flow - Two Phone Number Inputs

### First Phone Number Input (On Your Site)

**Location:** Customer-facing payment pages (`chapa-method-select.tsx` or `payment-process.tsx`)

**Purpose:** Customer's contact/identification phone number

- Used to identify the customer in Chapa's system
- Sent to Chapa API when initializing payment
- Pre-filled from user profile if available
- Required for payment processing

**Code Reference:**
```typescript
// Customer enters their phone number
phone_number: data.phone_number  // e.g., "+251911223344"
```

**Backend Processing:**
```php
// PaymentController.php (line 1177)
'phone_number' => $customerPhone,  // Customer's phone from form
```

### Second Phone Number Input (On Chapa's External Page)

**Location:** Chapa's hosted payment page (external redirect after payment initialization)

**Purpose:** Depends on the payment method selected:

- **Telebirr:** Customer's Telebirr wallet phone number (may be same or different from contact phone)
- **CBE:** Customer's bank account phone number (for mobile banking)
- **Other methods:** Varies by payment method

**Why Two Inputs?**

1. **Your site** collects the customer's **contact phone** (for identification and communication)
2. **Chapa's page** collects the phone number associated with their **payment method** (wallet/bank account)

These can be the same number, but they serve different purposes in the payment flow.

---

## 4. Complete Payment Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. Customer selects payment method (Telebirr, CBE, etc.)       │
│    on YOUR site                                                 │
└────────────────────────────┬────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. Customer enters THEIR phone number on YOUR site             │
│    (Contact/identification phone)                               │
└────────────────────────────┬────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│ 3. Your system sends payment request to Chapa API with:         │
│    - Customer's phone number                                    │
│    - Selected payment method (telebirr, cbe, etc.)             │
│    - Amount, order details                                      │
│    - YOUR merchant secret key (identifies where money goes)     │
└────────────────────────────┬────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│ 4. Chapa redirects customer to Chapa's external payment page   │
└────────────────────────────┬────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│ 5. On Chapa's page, customer may enter:                        │
│    - Their payment method phone (Telebirr wallet #, bank #, etc)│
│    - Payment PIN/OTP                                           │
└────────────────────────────┬────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│ 6. Chapa processes payment:                                     │
│    - Money comes FROM customer's account (Telebirr/CBE/etc.)   │
│    - Money goes TO your merchant account (via your secret key) │
└────────────────────────────┬────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│ 7. Chapa sends callback to your system with payment status     │
└────────────────────────────┬────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│ 8. Customer is redirected back to your site                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. Key Points to Remember

### ✅ What Customers DON'T Need to Know:

- **Customers don't need to know your merchant phone/account number**
- Chapa automatically routes payments to your account using your API keys
- The payment destination is handled transparently by Chapa

### ✅ What the "Chapa Methods" Tab Does:

- **Only controls which payment options customers see**
- Does NOT control where money goes (that's handled by API keys)
- Is purely for managing the customer-facing payment method list

### ✅ What Your Merchant Account Configuration Does:

- **Configured via `.env` file, NOT in the database**
- API keys identify your merchant account to Chapa
- All payments automatically go to the account associated with these keys
- **You only need ONE merchant account** - Chapa handles routing from all payment methods (Telebirr, CBE, etc.) to your single account

### ✅ About the Phone Numbers:

- **Both phone numbers belong to the customer:**
  - First: Contact/identification phone (entered on your site)
  - Second: Payment method phone (entered on Chapa's page)
- These can be the same number or different
- They serve different purposes in the payment flow

---

## 6. What Admins Should Configure

### In the "Chapa Methods" Tab (Admin Site Config):

- ✅ Add/remove payment methods (Telebirr, CBE, etc.)
- ✅ Set display names and descriptions
- ✅ Upload logos/icons
- ✅ Enable/disable specific methods

### In `.env` File (NOT in Admin Panel):

- ✅ `CHAPA_SECRET_KEY` - Your merchant secret key from Chapa dashboard
- ✅ `CHAPA_PUBLIC_KEY` - Your merchant public key from Chapa dashboard
- ✅ `CHAPA_BASE_URL` - Chapa API endpoint (usually `https://api.chapa.co/v1`)

**Note:** These API keys should be obtained from your Chapa merchant dashboard and kept secure. Never commit them to version control.

---

## 7. Code References

### Frontend:
- Payment method selection: `resources/js/pages/payment/chapa-method-select.tsx`
- Payment processing: `resources/js/pages/payment/payment-process.tsx`
- Admin config: `resources/js/pages/admin/site-config/index.tsx`

### Backend:
- Payment controller: `app/Http/Controllers/PaymentController.php`
- Chapa service: `app/Services/ChapaService.php`
- Configuration: `config/services.php`

### Database:
- Chapa payment methods table: `database/migrations/2025_11_09_162647_create_chapa_payment_methods_table.php`
- Model: `app/Models/ChapaPaymentMethod.php`

---

## Summary

The admin "Chapa Methods" tab is for managing **customer-facing payment options**, not merchant account details. The merchant account is configured via environment variables. Both phone number inputs are the customer's - one for identification, one for their payment method. Chapa handles routing payments to your merchant account automatically based on your API keys.

**Key Takeaway:** You only need **ONE Chapa merchant account** to accept payments from all payment methods (Telebirr, CBE, M-Pesa, etc.). Chapa acts as an aggregator and handles all the payment method integrations, settling all funds into your single merchant account.

---

## Questions?

If you have questions about:
- Adding new payment methods → See admin site config "Chapa Methods" tab
- Configuring merchant account → See `.env` file and Chapa dashboard
- Payment processing issues → Check `app/Http/Controllers/PaymentController.php` logs
- Customer payment flow → Review `resources/js/pages/payment/chapa-method-select.tsx`

