## Transactional Email & Notification Plan

This document outlines how to implement robust, scalable, and compliant transactional emails/notifications for critical business events in this Laravel application.

### Goals
- Ensure customers and admins are notified at appropriate business moments (e.g., payments, approvals, orders, shipping, stock changes).
- Use queues to prevent blocking requests and to improve resilience.
- Guarantee idempotency, deliverability, observability, and compliance (SPF/DKIM/DMARC, GDPR/CAN-SPAM where applicable).

### Key Events (Initial Scope)
- Payment
  - User payment completed (from gateway/webhook).
  - Admin payment approval (for offline or post-authorization flows).
- Orders
  - Order created/confirmed.
  - Order status updated (e.g., processing, shipped, delivered, canceled, refunded).
-  - Shipment created; tracking available; delivery updates when supported.
- Inventory and Product
  - Product back in stock (notify interested users).
  - Low stock / out of stock (notify admins/suppliers).
- Account
  - Email verification; password reset; significant account changes.
- Supplier/Admin [for future]
  - Supplier registered/approved/banned; key admin alerts for payment failures.

Note: We will evolve this list with product stakeholders and map notifications to clear business rules.

### Architecture Overview (Laravel)
- Trigger sources
  - Domain events and model observers (e.g., `Order` created/status updated, `PaymentTransaction` updated/approved).
  - Webhooks (e.g., Chapa) handled in controllers/jobs, emitting domain events.
- Notification layer
  - Prefer Laravel Notifications for user/admin routing (email now; add SMS/push later).
  - Use Mailables for rich, reusable email templates when needed by Notifications.
- Async delivery
  - Queue all notifications via `queue` (Redis recommended). Jobs must be idempotent.
  - Configure `failed_jobs` table and dead-letter strategy.
- Templating and localization
  - Blade-based email templates with translation strings and simple partials.
  - Keep transactional emails concise, mobile-friendly, and accessible.
- Preferences and targeting
  - Maintain a user notification preferences table for optional categories.
  - Always send mandatory transactional emails (e.g., receipt, password reset) regardless of marketing opt-outs.
- Flow variants: advance vs checkout
  - The app has two distinct flows:
    - Advance payments for product feature (e.g., product request/feature placement or pre-commitment payments).
    - Normal product buying/checkout.
  - Strategy:
    - Use distinct domain events per context where helpful, or include a `context` payload (e.g., `payment_context: advance|checkout`).
    - FINAL completion is on admin approval (regardless of gateway/offline). Gateway completion alone does not trigger customer-facing “final” emails.
    - Keep shared infrastructure (idempotency, queueing, preferences) identical.
- Deliverability and compliance
  - Configure SPF, DKIM, and DMARC for sending domain.
  - Use a reputable ESP (e.g., Amazon SES, SendGrid, Mailgun). Start with one provider; abstract for future failover.
  - Set friendly, monitored sender (avoid no-reply). Include postal address and reason for email where applicable.
- Observability
  - Structured logs with correlation IDs (order_id, payment_txn_id).
  - Store minimal send metadata (provider message ID, status) for troubleshooting.
  - Metrics: volumes, success/failure rates, latency; alerts on failure spikes.

### Current Project Mapping
- Existing code artifacts
  - Jobs: `app/Jobs/*` includes email-related jobs (e.g., `SendOrderConfirmationEmail`, `SendPaymentConfirmationEmail`).
  - Mailables: `app/Mail/*` has `OrderConfirmation`, `PaymentConfirmation`, etc.
  - Notifications: `app/Notifications/*` include product and supplier notices.
  - Webhook handling: `app/Http/Controllers/ChapaWebhookController.php` processes payment webhooks.
- Direction
  - Standardize on Notifications orchestrating Mailables for email channel.
  - Define domain events for payment and order lifecycle transitions.
  - Ensure all send actions are queued and idempotent with deduplication keys.

### Idempotency and Safety
- For each event, compute a deterministic idempotency key, e.g.:
  - Payment completion: `payment:{transaction_reference}:completed`
  - Admin approval: `payment:{payment_transaction_id}:approved`
  - Order confirmation: `order:{order_id}:confirmed:v1`
- Persist a simple `notification_outbox` table recording keys that have been processed.
- Jobs check/insert atomically; if exists, skip sending.
- Retry policy: exponential backoff, max attempts (e.g., 5). Move to failed jobs after max; alert.
- Rate limiting: throttle per recipient for bursty events when needed.

### Provider and Sending Strategy
- Start with primary ESP (SES/Mailgun/SendGrid). Configure domain auth (SPF/DKIM/DMARC) and monitored sender.
- Use a single `MailTransport` abstraction via Laravel config; later consider fallback provider.
- Sandbox and staging: use separate subdomains and credentials; seed test recipients; disable real sends for e2e tests.

### Content & UX Guidelines
- Subject lines precise: e.g., "Payment approved for Order #{order_number}".
- First line states the outcome and next steps.
- Include key facts: order number, amount, items count, links to order and invoice.
- Keep promotional content out of transactional emails to avoid compliance issues.
- Mobile-first templates; high contrast; avoid image-only content; include plain-text part.

### Notification Matrix (Initial)

| Event | Recipient | Channel | Template | Trigger Source |
|---|---|---|---|---|
| Payment Completed (Checkout) | — | — | — | Gateway webhook -> domain event (no customer email; pending admin review) |
| Payment Completed (Advance) | — | — | — | Gateway webhook -> domain event (no customer email; pending admin review) |
| Payment Approved (Admin, Checkout) | User | Email | `PaymentApproved` (new) | Admin action -> domain event |
| Payment Approved (Admin, Advance) | User | Email | `AdvancePaymentApproved` (new) | Admin action -> domain event |
| Payment Failed | User | Email | `PaymentFailed` (new) | Webhook/controller error -> event |
| Order Confirmed (Checkout) | User | Email | `OrderConfirmation` | Order created -> event |
| Order Confirmed (Advance-linked) | User | Email | `AdvanceOrderConfirmation` (new, if applicable) | Advance -> order linkage event |
| Order Status Updated | User | Email | `OrderStatusUpdate` | Status change -> event |
| Shipment Created | User | Email | `ShipmentCreated` (new) | Shipment created -> event |
| Back In Stock | User(s) | Email | `ProductBackInStock` | Inventory update -> event |
| Low/Out of Stock | Admin/Supplier | Email | `ProductLowStock`/`ProductOutOfStock` | Inventory update -> event |
| Supplier Registered | Admin | Email | `SupplierRegistered` | Registration -> event |
| Supplier Approved/Banned | Supplier | Email | `SupplierApproved`/`SupplierBanned` | Admin action -> event |

### Implementation Steps
1) Events and observers
  - Create domain events: `PaymentCompleted`, `PaymentApproved`, `OrderCreated`, `OrderStatusChanged`, `ShipmentCreated`, `InventoryLow`, `InventoryBackInStock`.
  - Emit events from controllers/webhooks/observers (e.g., in `ChapaWebhookController` after verification, dispatch `PaymentCompleted`).
2) Notification jobs
  - For each event, create a queued listener that composes and sends a Notification.
  - Implement idempotency check using `notification_outbox`.
3) Notifications and mailables
  - Create Notification classes per row in the matrix; prefer channel routing via Notifiable models.
  - Implement Mailables for reusable layout/content and localization.
4) Templates and localization
  - Add Blade templates for each email; create translations for subjects/body strings.
5) Preferences
  - Add `user_notification_preferences` for optional categories; enforce in listeners (not for mandatory emails).
6) Infrastructure
  - Ensure queue driver (Redis) configured; workers supervised (e.g., Supervisor/systemd).
  - Configure ESP credentials; set up SPF/DKIM/DMARC; define senders (e.g., `notifications@yourdomain`).
7) Observability
  - Add structured logs with correlation IDs; store provider message IDs.
  - Add metrics and alerting for failure spikes and backlog growth.
8) Testing
  - Unit tests for listeners and idempotency logic.
  - Feature tests simulating webhooks and admin approvals, asserting queued notifications and rendered content.
  - Mailable snapshot tests for critical templates.
9) Rollout
  - Enable per-event behind feature flags; monitor deliverability and failures.
  - Iterate templates based on feedback.

### Data Model Additions
- `notification_outbox`
  - `id`, `key` (unique), `event_type`, `model_type`, `model_id`, `recipient`, `created_at`.
- `user_notification_preferences`
  - `user_id`, `category` (enum), `enabled` (bool), `updated_at`.

### Security & Compliance
- Do not include sensitive PII or full card data in emails.
- Include why the user is receiving the email.
- Physical address footer where required; link to preferences for optional emails.
- Maintain separate marketing vs transactional streams/IPs if volume grows.

### Milestones

#### Milestone 1: Payments core (checkout + advance) + idempotency + events/listeners
- Scope
  - Implement payment events: `PaymentCompleted` (checkout/advance), `PaymentApproved` (checkout/advance).
  - Listener to dispatch queued email jobs with idempotency via `notification_outbox`.
  - Mailables/Jobs: checkout payment confirmation + approval; advance payment confirmation + approval.
  - Views for approved/advance confirmations.
  - Wire dispatches: webhook paid → completed; admin approval → approved.
- Done in this milestone (implemented)
  - `notification_outbox` migration + model.
  - Events: `PaymentCompleted`, `PaymentApproved` with `context`.
  - Listener: `SendPaymentNotifications` (queued, idempotent).
  - Jobs/Mailables: checkout and advance confirmations/approvals.
  - Views: approved, advance-confirmation, advance-approved.
  - Wiring in `ChapaWebhookController`, `AdminPaymentController` (and offline path safeguard).
- Tests (to add before closing M1)
  - Unit: outbox idempotency reservation; listener routing by `context`.
  - Feature: webhook → event → queued job (checkout and advance).
  - Feature: admin approval → event → queued job (checkout and advance).
  - Regression (pre-M1 baseline): verify legacy mail flows and unrelated features remain unaffected.

### Test Guidelines (Laravel 12)
- Queued jobs (ShouldQueue): use `Queue::fake()` and `Queue::assertPushed(Job::class)`.
- Domain events: use `Event::fake()` and `Event::assertDispatched(Event::class)` when testing emitters.
- Listener behavior: unit-test listeners by instantiating and calling `handle($event)`, then assert queued jobs via `Queue::assertPushed`.
- No queue worker needed in tests; test env uses sync queue or fakes.
- Ensure listeners are registered (see `App\Providers\EventServiceProvider`) and provider is listed in `bootstrap/providers.php`.
- Always refer to `rules.md` for framework/version guidance before changing test patterns.

#### Milestone 2: Orders (includes shipping)
- Scope
  - Events: `OrderCreated` (checkout), `OrderCreatedFromAdvance` (if applicable), `OrderStatusChanged`, `ShipmentCreated`.
  - Notifications/Mailables: `OrderConfirmation`, `AdvanceOrderConfirmation` (if applicable), `OrderStatusUpdate`, `ShipmentCreated`.
  - Templates (HTML + plain-text), translations.
  - Failure handling moved here: user/admin notifications for payment failure/rejection (`PaymentFailed` or admin rejection) aligned with business rules.
- Tests
  - Comprehensive tests for new order/shipping notifications.
  - Regression: re-run M1 tests + dedicated regressions to ensure payments flow unchanged.

#### Milestone 3: Inventory and Product
- Scope
  - Events: `InventoryBackInStock`, `InventoryLow`/`OutOfStock`.
  - Notifications: `ProductBackInStock`, `ProductLowStock`, `ProductOutOfStock`.
- Tests
  - Comprehensive tests for inventory notifications.
  - Regression: M1 + M2 suites.

#### Milestone 4: Account
- Scope
  - Queue email verification and password reset; account-change alerts.
- Tests
  - Comprehensive account tests; regression M1–M3.

#### Milestone 5: Supplier/Admin [for future]
- Scope
  - `SupplierRegistered` (admin), `SupplierApproved`/`SupplierBanned` (supplier), admin payment failure alerts.
- Tests
  - Comprehensive supplier/admin tests; regression M1–M4.

### References (best practices)
- Deliverability/auth: SPF, DKIM, DMARC.
- Prefer queued, idempotent jobs; exponential backoff; dead-letter and alerting.
- Concise subjects, clear outcomes, monitored sender, plain-text part, mobile-first.


