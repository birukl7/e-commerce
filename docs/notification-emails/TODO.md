## Transactional Notifications: Implementation TODO

Priority order: Payment → Orders → Inventory and Product → Account → Supplier/Admin [for future]

Legend: [ ] pending, [x] done, [~] in progress

### 0. Foundation
- [x] Create plan document at `docs/notification-emails/PLAN.md` (done)
- [x] Create this checklist file `docs/notification-emails/TODO.md` (done)
- [ ] Decide primary ESP and configure credentials (SES/SendGrid/Mailgun)
- [ ] Set sender addresses/policies (e.g., `notifications@domain`), prod/stage separation
- [ ] Configure SPF, DKIM, DMARC for sending domain

### Milestone 1: Payments core (checkout + advance) + idempotency + events/listeners
- Domain events
  - [x] Define `PaymentCompleted` (context: checkout/advance)
  - [x] Define `PaymentApproved` (context: checkout/advance)
- Emitters
  - [x] Emit checkout completion from `ChapaWebhookController` with `context=checkout`
  - [x] Emit advance completion from `ChapaWebhookController` with `context=advance`
  - [x] Emit admin approval (checkout/advance) from approval actions
- Listeners (queued)
  - [x] On checkout completion -> queue `PaymentConfirmation`
  - [x] On advance completion -> queue `AdvancePaymentConfirmation`
  - [x] On checkout approval -> queue `PaymentApproved`
  - [x] On advance approval -> queue `AdvancePaymentApproved`
- Notifications/Mailables
  - [ ] Skip customer-facing send on gateway completion; final emails go out on admin approval
  - [x] `PaymentApproved`
  - [x] `AdvancePaymentApproved`
  - [ ] `PaymentFailed` (shared)
- Idempotency
  - [x] `notification_outbox` migration + model + unique key
  - [x] Listener idempotency with context-aware key
- Templates & i18n
  - [x] HTML templates for approved and advance emails
  - [ ] Add plain-text parts and translations
- Tests (required to close M1)
  - [ ] Unit: outbox idempotency reservation; listener routing by context
  - [ ] Feature: webhook (checkout) -> event -> queued notification
  - [ ] Feature: webhook (advance) -> event -> queued notification
  - [ ] Feature: admin approval (checkout/advance) -> event -> queued notification
  - [ ] Regression baseline (pre-M1): ensure prior code paths remain intact

### Test Guidelines (Laravel 12)
- Use `Queue::fake()` / `Queue::assertPushed` for `ShouldQueue` jobs.
- Use `Event::fake()` / `Event::assertDispatched` for domain event assertions.
- Unit-test listeners directly via `handle($event)`.
- No queue worker needed in tests; sync or fakes suffice.
- Always refer to `rules.md` and Laravel 12 docs before altering test strategy.

### Milestone 2: Orders (includes Shipping)
- Domain events
  - [ ] Define `OrderCreated` (checkout) event
  - [ ] Define `OrderCreatedFromAdvance` (if advance converts to order)
  - [ ] Define `OrderStatusChanged` event
  - [ ] Define/emit `ShipmentCreated` (optional if shipping exists)
- Emitters
  - [ ] Emit events in checkout order creation/status update code paths
  - [ ] Emit event when advance payment converts/links to an order
  - [ ] Emit shipment event when tracking is created
- Listeners (queued)
  - [ ] Listener: `OrderCreated` (checkout) -> `OrderConfirmation`
  - [ ] Listener: `OrderCreatedFromAdvance` -> `AdvanceOrderConfirmation` (if applicable)
  - [ ] Listener: `OrderStatusChanged` -> status update email
  - [ ] Listener: `ShipmentCreated` -> shipment email with tracking
- Notifications/Mailables
  - [ ] `OrderConfirmation` mailable/notification
  - [ ] `AdvanceOrderConfirmation` mailable/notification (if applicable)
  - [ ] `OrderStatusUpdate` mailable/notification
  - [ ] `ShipmentCreated` mailable/notification
- Templates & i18n
  - [ ] Blade templates (HTML + plain-text) for order emails
  - [ ] Translations for subjects/bodies
- Tests (required to close M2)
  - [ ] Comprehensive order/shipping tests for all events
  - [ ] Regression: re-run full M1 suite + targeted regressions

### Milestone 3: Inventory and Product
- Domain events
  - [ ] Define `InventoryBackInStock`
  - [ ] Define `InventoryLow`/`OutOfStock`
- Emitters
  - [ ] Emit inventory events from stock update logic/observers
- Listeners (queued)
  - [ ] Listener: back in stock -> notify interested users
  - [ ] Listener: low/out of stock -> notify admins/suppliers
- Notifications/Mailables
  - [ ] `ProductBackInStock` notification (exists)
  - [ ] `ProductLowStock`/`ProductOutOfStock` notifications (exist)
- Tests (required to close M3)
  - [ ] Comprehensive inventory tests for all events
  - [ ] Regression: re-run M1 + M2 suites

### Milestone 4: Account
- [ ] Ensure email verification and password reset flows use queued mail
- [ ] Add notification for significant account changes (email change, security alert)
- [ ] Templates and translations
 - Tests (required to close M4)
  - [ ] Comprehensive account tests
  - [ ] Regression: re-run M1–M3 suites

### Milestone 5: Supplier/Admin [for future]
- [ ] `SupplierRegistered` -> admin alert
- [ ] `SupplierApproved`/`SupplierBanned` -> supplier alert
- [ ] Admin alerts for payment failures/operational issues
 - Templates, translations, and tests (required to close M5)
  - [ ] Comprehensive supplier/admin tests
  - [ ] Regression: re-run M1–M4 suites

### Cross-cutting
- Preferences & Targeting
  - [ ] Add `user_notification_preferences` table and model
  - [ ] Enforce preferences for optional categories (not transactional essentials)
- Observability
  - [ ] Structured logs with correlation IDs
  - [ ] Store provider message IDs for troubleshooting
  - [ ] Metrics/alerts for send failures and queue backlog
- Queue & Reliability
  - [ ] Ensure Redis queue driver; configure Supervisor/systemd process
  - [ ] Set retry/backoff policy; monitor `failed_jobs`
  - [ ] Consider rate limiting/throttling for burst scenarios

### Rollout
- [ ] Feature flag per event
- [ ] Staged rollout (internal -> % of traffic -> full)
- [ ] Monitor deliverability, errors, template feedback


