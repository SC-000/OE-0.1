# billings.systems — Client Integration Master Guide

The complete reference for integrating a client application (your backend + your frontend) with billings.systems. If you follow this end to end, you should hit zero integration bugs.

This document is dense. It is intentionally a reference, not a tutorial. Read once top-to-bottom to build a mental model, then come back to specific sections when implementing.

> **Audience:** engineers integrating a client SaaS, e-commerce site, or admin tool with billings.systems.
> **Scope:** every token type, every API endpoint you'll touch, every webhook event, every browser widget, every money-flow nuance, every known failure mode and how to defend against it.

---

## Table of contents

1. [What billings.systems is](#1-what-billingssystems-is)
2. [System architecture](#2-system-architecture)
3. [Authentication and tokens](#3-authentication-and-tokens)
4. [Data model](#4-data-model)
5. [Server-to-server API](#5-server-to-server-api)
6. [Browser widgets](#6-browser-widgets)
7. [Outbound webhooks](#7-outbound-webhooks-billings--your-server)
8. [Money flow — charges, refunds, fees, balance, payouts](#8-money-flow--charges-refunds-fees-balance-payouts)
9. [Subscription lifecycle](#9-subscription-lifecycle)
10. [Disputes and chargebacks](#10-disputes-and-chargebacks)
11. [Best practices](#11-best-practices)
12. [Security](#12-security)
13. [Self-healing patterns](#13-self-healing-patterns)
14. [Common errors — what they mean and how to fix](#14-common-errors)
15. [Known issues and operator playbook](#15-known-issues-and-operator-playbook)
16. [End-to-end integration checklist](#16-end-to-end-integration-checklist)
17. [Testing](#17-testing)
18. [Multi-currency handling](#18-multi-currency-handling)
19. [Customer lifecycle and operational patterns](#19-customer-lifecycle-and-operational-patterns)
20. [Subscription advanced topics — upgrades, downgrades, dunning, proration](#20-subscription-advanced-topics)
21. [Disputes operational playbook](#21-disputes-operational-playbook)
22. [Reconciliation strategy](#22-reconciliation-strategy)
23. [Monitoring and alerting on your side](#23-monitoring-and-alerting-on-your-side)
24. [Disaster recovery playbook](#24-disaster-recovery-playbook)
25. [Customer support diagnosis runbook](#25-customer-support-diagnosis-runbook)
26. [Migration patterns](#26-migration-patterns)
27. [Token scope catalog](#27-token-scope-catalog)
28. [Advanced widget topics — CSP, mobile, custom styling](#28-advanced-widget-topics)
29. [PCI compliance scope](#29-pci-compliance-scope)
30. [Performance and scaling](#30-performance-and-scaling)
31. [Frequently asked scenarios](#31-frequently-asked-scenarios)

---

## 1. What billings.systems is

A multi-tenant Stripe-on-top billing platform. You give it customers and invoices. It charges cards, manages subscriptions, takes a platform fee, and pays out the rest to you.

Three integration surfaces:

| Surface | What it does | Who calls it |
|---|---|---|
| **Server REST API** | CRUD customers, invoices, subscriptions, payments | Your backend |
| **Browser widgets** | Pre-built UI for collecting cards, paying invoices, showing receipts | Your frontend (browsers) |
| **Outbound webhooks** | Real-time notifications when state changes | billings.systems → your backend |

Under the hood, billings.systems orchestrates Stripe. Cards are tokenized via Stripe Elements; charges go through Stripe; settlements come back through Stripe. You never touch Stripe directly — billings.systems is the broker.

Each client (you) is a tenant with its own user record, its own customers, invoices, payment methods, balance ledger, and optional its own Stripe Connect-style credentials. Cross-tenant access is impossible by design — every query is scoped by the authenticated user.

---

## 2. System architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                       YOUR APPLICATION                          │
│                                                                 │
│   ┌──────────────┐                       ┌──────────────────┐  │
│   │  Your        │  REST (Bearer billing)│ Your backend     │  │
│   │  customer's  │ ────────────────────► │ ◄─────────────── │  │
│   │  browser     │                       │  receives outbound│  │
│   │  (widgets)   │                       │  webhooks (HMAC) │  │
│   └──────────────┘                       └──────────────────┘  │
│          │                                       │              │
│          │ Bearer billing_publishable             │              │
│          │ + Stripe.js                           │              │
└──────────┼───────────────────────────────────────┼──────────────┘
           │                                       │
           ▼                                       │
┌─────────────────────────────────────────────────────────────────┐
│                       billings.systems                          │
│                                                                 │
│   /api/v1/widget/*  ◄──── browser-safe, zero-scope auth         │
│   /api/v1/*         ◄──── server-side, scoped auth              │
│   /api/v1/admin/*   ◄──── platform super admins                 │
│                                                                 │
│   ┌──────────────────────────────────────────────────────────┐  │
│   │  StripeGateway::forUser(userId)                          │  │
│   │  → per-tenant Stripe credentials when configured,        │  │
│   │    otherwise platform Stripe                             │  │
│   └─────────────────────┬────────────────────────────────────┘  │
└─────────────────────────┼───────────────────────────────────────┘
                          │
                          ▼
                    ┌──────────┐
                    │  Stripe  │
                    └────┬─────┘
                         │ inbound webhooks
                         ▼
                  /api/v1/webhooks/stripe
                  (signature verified against
                   STRIPE_WEBHOOK_SECRET)
```

Three independent flows you need to handle on your side:

1. **You → billings (REST):** server-side mutations (create customer, invoice, etc.).
2. **Browser → billings (REST):** widget-driven, scoped to a single customer's resources.
3. **billings → you (outbound webhook):** asynchronous state-change notifications.

Stripe sits behind billings. You shouldn't talk to Stripe directly (other than including their `Stripe.js` script for browser-side card tokenization, which the widgets handle for you).

---

## 3. Authentication and tokens

Four token slots in your client config. Confusing the wrong token with the wrong endpoint is the #1 integration mistake.

| Slot | Type | Where it lives | Who sees it |
|---|---|---|---|
| `billing` | Passport OAuth Bearer | Your backend `.env` or settings table | Server-side only |
| `billing_publishable` | Passport OAuth Bearer (zero scopes) | Your frontend (in HTML/JS) | Public — assume compromised |
| `billing_webhook` | HMAC shared secret | Your backend `.env` | Server-side only |
| `billing_admin` | Passport OAuth Bearer | Platform `.env` (NOT client-side) | Super-admin only |

### 3.1 `billing` — server-side full-access token

**Issue this once via billings.systems admin UI → Tokens → Create Token, with these 13 scopes:**

```
customers:create customers:read customers:update
payments:create payments:read payments:update
invoices:create invoices:read invoices:update
subscriptions:create subscriptions:read subscriptions:update
payouts:read disputes:read
```

**Do not include:**
- Any `*:delete` (destructive — you can soft-delete via your own data layer).
- Any `webhooks:*` unless you want your backend to programmatically manage webhook endpoints. Most setups don't.
- Any `admin:*` — those belong to the platform super-admin only.
- Any `fees:*` — fee profiles are admin-managed; clients have no programmatic access.

**Usage:** `Authorization: Bearer {billing}` on every server → billings.systems call to `/api/v1/*` (non-widget, non-admin endpoints).

**Lifetime:** 1 year, then expires. Rotate before expiry. There is no refresh-token flow you'd actually use server-side — when it expires, issue a new one.

**Storage:** treat it like a database password. Environment variable or sealed secrets store. Never log it. Never commit it. Never ship it to the browser.

### 3.2 `billing_publishable` — browser widget token

**Issue this with ZERO scopes** (empty array). It is meant to be embedded in HTML/JavaScript and visible to anyone who views your page.

**Why zero scopes is safe AND correct:**

- The widget endpoints (`/api/v1/widget/*`) require a valid bearer token but no specific scope.
- If the token leaks, an attacker can hit widget endpoints — but every widget endpoint is scoped to the token's owning user, so the attacker can only see/modify *your* tenant's data (which is bad, but not a cross-tenant breach).
- Crucially, they **cannot hit `/api/v1/customers`, `/api/v1/invoices`, etc.** because those routes enforce `scope:customers:read`, `scope:invoices:create`, etc., and your publishable token has none.

If you give the publishable token any scope (e.g. `payments:create`), you widen the attacker's surface to include the non-widget scoped routes. **Don't.**

**Usage:** `Authorization: Bearer {billing_publishable}` from the browser, set by your widget embed code.

**Lifetime:** 1 year. Bake this into a "publishable key rotation" task in your operational runbook — rotate every 6–12 months.

**Storage:** put it in your page's HTML (in a `<script>` tag) or pass it from server-rendered context. It's already public — there's nothing to hide.

**Critical constraint:** must be issued under the **same user** as the customer IDs the widget operates on. Issue it under user A, then try to load customer B's checkout page → `Customer not found or access denied` → widget displays an error.

### 3.3 `billing_webhook` — HMAC signing secret

Not a Passport token. A shared secret (random ~32 bytes, base64 or hex) used to verify the authenticity of inbound webhooks from billings.systems.

**How to get it:** generated when you register a webhook endpoint via billings admin UI or `POST /api/v1/webhooks` API call. The response shape is:

```json
{
  "data": {
    "endpoint": { "id": "...", "url": "...", "events": [...] },
    "secret": "..."        // ← THIS is the signing secret. Save it now.
  },
  "message": "Webhook endpoint created. Store the secret securely — it will not be shown again."
}
```

Note the field is named `secret` in the API response. Throughout this doc we call it `signing_secret` for clarity, but on the wire it's `data.secret`.

**Format:** typically prefixed `whsec_...` and ~64 chars.

**Usage:** never send it anywhere. Use it locally to compute HMAC of inbound webhook bodies.

```
HMAC-SHA256("{timestamp}.{raw_body}", signing_secret)
```

This must equal the `v1` segment of the `X-Billings-Signature` header. Details in [§7.3](#73-verifying-webhook-signatures).

**Storage:** your `.env` or secrets store, server-side only.

### 3.4 `billing_admin` — platform super-admin token

You almost certainly don't need this. It exists for the platform operator (the people running billings.systems itself) to do cross-tenant admin operations (e.g., "list invoices across all clients"). Issued only to users with `role = admin`.

Scopes:

```
admin:invoices:create admin:invoices:read admin:invoices:update admin:invoices:delete
admin:clients:read
```

Hits `/api/v1/admin/*` endpoints. Skip if you're not running the platform.

### 3.5 Token rotation

When a token leaks or you suspect compromise:

1. Issue a new token in admin UI immediately.
2. Update your client config (env var, settings table).
3. Revoke the old token in admin UI.

There is currently no rotate-in-place endpoint. You must create-then-revoke, with a brief window where both exist.

For routine hygiene, rotate every 6–12 months. Server tokens that haven't been used in 30+ days are a sign of stale config — audit and rotate.

---

## 4. Data model

The objects you'll interact with. All IDs are UUID v4 unless noted.

### Customer
A billable party. You create customers via `POST /customers`. Each customer belongs to your tenant (`user_id`). Each has an optional Stripe customer ID (`provider_ref` of the form `cus_...`), created lazily on first card setup.

Key fields:
- `id` (uuid) — billings.systems ID; use this everywhere.
- `external_ref` (string, nullable) — your own ID for this customer (e.g., your DB's user ID). Save this so you can map back. Indexed.
- `email`, `name`, `meta` (JSON).
- `provider_ref` (string, nullable) — Stripe customer ID. Filled in when a card is first set up.

Location fields (denormalized for filtering/segmentation; populated from billing details on card setup/charge when available):
- `postal_code` (string, nullable) — billing postal/ZIP code.
- `country` (char(2), nullable) — ISO 3166-1 alpha-2 country code, e.g. `US`.
- `city` (string, nullable) — billing city.
- `intelligence` (JSON, nullable) — a denormalized "last seen" snapshot of this customer's most recent card and location data. Best-effort; keys are nullable. Shape:
  ```json
  {
    "last_card_brand": "visa",
    "last_card_funding": "credit",
    "last_card_country": "US",
    "last_wallet_type": null,
    "last_card_network": "visa",
    "last_risk_level": "normal",
    "address_line1": "123 Main St",
    "address_line2": null,
    "address_state": "CA",
    "contact_name": "Acme Corp",
    "contact_phone": "+15555550100",
    "last_seen_at": "2026-06-20T15:30:00Z"
  }
  ```
  `last_risk_level` is Stripe Radar's best-effort risk level (`normal` | `elevated` | `highest`) and may be `null`; the paid numeric risk score is **not** provided. None of these fields contain PAN or CVC — they are SAQ-A safe.

### PaymentMethod
A saved card (or other payment instrument) belonging to a customer. Created when a customer completes the SetupWidget flow.

Key fields:
- `id` (uuid) — billings.systems ID.
- `customer_id` (uuid) — owner.
- `provider` (string, always `stripe`).
- `provider_ref` (string) — Stripe `pm_...` ID.
- `type` (`card` | `paypal` | etc.).
- `fingerprint` (string) — Stripe-derived; used to deduplicate the same physical card across attaches.
- `last4`, `expiry_month`, `expiry_year`.
- `status` (`active` | `inactive`).
- `is_default` (boolean) — used by autopay and "pay with default" endpoints.

Card intelligence fields (best-effort; populated from Stripe on attach/charge, nullable):
- `card_brand` (string, nullable) — `visa` | `mastercard` | `amex` | etc.
- `card_funding` (string, nullable) — `credit` | `debit` | `prepaid` | `unknown`.
- `card_country` (char(2), nullable) — issuing country, ISO 3166-1 alpha-2.
- `wallet_type` (string, nullable) — `apple_pay` | `google_pay` | etc. when the card was presented via a wallet.
- `intelligence` (JSON, nullable) — richer detail about this instrument. Shape:
  ```json
  {
    "network": "visa",
    "three_d_secure": "authenticated",
    "checks": { "avs": "pass", "cvc": "pass", "line1": "pass" },
    "card_shared": false,
    "card_shared_customer_count": 1
  }
  ```
  `card_shared` is `true` when the same physical card (by fingerprint) is attached to more than one of your customers; `card_shared_customer_count` is how many. `three_d_secure` and the `checks` are Stripe's authentication/verification results. SAQ-A safe — no PAN/CVC stored.

### Invoice
A demand for payment. States: `draft` → `pending` → `open` → `paid` (or `void` or `past_due` or `disputed`).

Key fields:
- `id`, `user_id`, `customer_id`.
- `number` (string) — `INV-YYYYMM-####` or `PAY-...` for widget-created direct payments.
- `currency` (lowercase, e.g., `usd`).
- `amount_due`, `amount_paid` (integers in minor units — cents for USD).
- `fee_amount`, `net_amount` (integers — what you get after platform fee + Stripe fee).
- `due_date` (date).
- `paid_at`, `voided_at`, `finalized_at` (timestamps).
- `status`.
- `auto_bill` (boolean) — if true, the autopay service charges the customer's default card automatically when due.
- `meta` (JSON).

Items live in a separate `invoice_items` table.

### Transaction
A money movement. Created when you charge or refund.

- `id`, `invoice_id`, `customer_id`, `payment_method_id`.
- `provider` (`stripe`), `provider_ref` (`pi_...` for charges, `re_...` for refunds).
- `amount` (integer, minor units).
- `currency` (uppercase ISO — note the inconsistency: invoices use lowercase, transactions use uppercase).
- `type` (`charge` | `refund` | `payout`).
- `status` (`pending` | `processing` | `succeeded` | `failed` | `requires_action` | `canceled`).
- `platform_fee`, `stripe_fee`, `net_amount` (cents).
- `settled_amount`, `settled_currency`, `settled_fee`, `settled_net`, `exchange_rate`, `balance_transaction_id` — populated when settlement data arrives from Stripe (may be delayed up to a few seconds).
- `settlement_status` (`pending` | `settled`).
- `meta` (JSON, includes the full Stripe payload).

### Subscription
Recurring billing.

- `id`, `user_id`, `customer_id`.
- `name`, `description`.
- `amount`, `currency`, `interval` (`day` | `week` | `month` | `year`), `interval_count`.
- `start_date`, `end_date`, `next_billing_date`, `trial_days`.
- `status` (`active` | `paused` | `cancelled` | `past_due`).
- `auto_bill` (boolean), `payment_method_id`.

When `next_billing_date` arrives, a daily scheduled job generates an invoice and, if `auto_bill = true`, charges the default payment method.

### BalanceLedgerEntry
The audit trail for money in/out of your platform balance. Every charge generates a credit; every refund/dispute/payout generates a debit. The "available balance" is `SUM(credits matured beyond hold period) - SUM(debits)`.

- `user_id`, `currency`, `credit`, `debit`.
- `type` (`charge` | `refund` | `dispute` | `payout` | `adjustment`).
- `reference_id` — the transaction/refund/dispute/payout this entry corresponds to.
- `created_at` — relevant for the hold period (default 7 days).
- `meta` — fee breakdown, exchange rate, etc.

### Payout
A withdrawal of funds from your platform balance to your bank.

- `id`, `user_id`, `amount`, `currency`, `status` (`pending` | `processing` | `completed` | `failed`), `provider_ref`, `destination` (masked).

### Dispute
A chargeback from a cardholder.

- `id`, `transaction_id`, `provider_ref`, `amount`, `currency`, `status` (`needs_response` | `under_review` | `won` | `lost`), `reason`, `due_by`, `evidence`.

### FeeProfile
Per-user (per-tenant) platform fee config, managed and viewed entirely by the platform admin via the admin UI. **Not exposed to clients via the API.** If you need to know your platform fee rate, ask your account manager — there is no client-facing endpoint for this.

### WebhookEndpoint / WebhookDelivery
Your registered URLs for outbound webhooks and the per-event delivery records.

---

## 5. Server-to-server API

All requests:
- Base URL: `https://billings.systems/api/v1`
- `Authorization: Bearer {billing}`
- `Content-Type: application/json`
- `Accept: application/json`
- `Idempotency-Key: <unique-string>` — **required on POST/PUT/PATCH/DELETE**. See [§11.1](#111-idempotency).

Common response envelope on success:

```json
{
  "success": true,
  "message": "...",
  "data": { ... },
  "timestamp": "2026-05-12T15:30:00Z"
}
```

On error:

```json
{
  "success": false,
  "message": "Human-readable reason",
  "errors": { ... },          // present on 422 validation errors
  "timestamp": "2026-05-12T15:30:00Z"
}
```

HTTP status codes used:
- `200` — success (read or update).
- `201` — created (POST returning new resource).
- `400` — bad request (missing required field that isn't validated, e.g., `Missing Idempotency-Key`).
- `401` — unauthenticated (token missing/invalid).
- `402` — payment required (Stripe `CardException` — wrong CVC, declined, etc.).
- `403` — forbidden (scope insufficient OR resource belongs to another user).
- `404` — not found.
- `422` — validation error (response includes `errors` field with per-field messages).
- `429` — rate limited (you exceeded `600/min` global or specific limits).
- `500` — server error.
- `502` — payment gateway error (Stripe connection or auth failure on our end).
- `503` — payment gateway unavailable.

### 5.1 Customers

#### `POST /customers` — create
Scope: `customers:create`.

```json
{
  "name": "Acme Corp",
  "email": "ap@acme.com",
  "phone": "+15555550100",
  "address": { "line1": "...", "city": "...", "postal_code": "...", "country": "US" },
  "metadata": { "your_user_id": 12345 }
}
```

Response 201:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "external_ref": "cus_StripeID",
    "provider_ref": "cus_StripeID",
    "name": "Acme Corp",
    "email": "ap@acme.com",
    "meta": { ... }
  }
}
```

A Stripe customer is created server-side at the same time. The Stripe ID lands in `provider_ref`.

**Save the `id` in your DB** keyed against your own user — you'll need it for every other call.

#### `GET /customers` — list
Scope: `customers:read`. Query params: `search`, `email`, `per_page` (default 15), `page`.

#### `GET /customers/{id}` — fetch one
Scope: `customers:read`. Includes nested `invoices`, `paymentMethods`, `subscriptions`.

The response is additively enriched with denormalized location and card-intelligence data (all existing keys preserved). Top-level `postal_code`, `country`, `city`, and `intelligence` are returned, and each `payment_methods[]` entry now also carries `last4`, `card_brand`, `card_funding`, `card_country`, `wallet_type`, `expiry_month`, `expiry_year`, and `intelligence`:

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "external_ref": "cus_StripeID",
    "provider_ref": "cus_StripeID",
    "name": "Acme Corp",
    "email": "ap@acme.com",
    "postal_code": "94107",
    "country": "US",
    "city": "San Francisco",
    "intelligence": {
      "last_card_brand": "visa",
      "last_card_funding": "credit",
      "last_card_country": "US",
      "last_wallet_type": null,
      "last_card_network": "visa",
      "last_risk_level": "normal",
      "address_line1": "123 Main St",
      "address_line2": null,
      "address_state": "CA",
      "contact_name": "Acme Corp",
      "contact_phone": "+15555550100",
      "last_seen_at": "2026-06-20T15:30:00Z"
    },
    "meta": { ... },
    "payment_methods": [
      {
        "id": "uuid",
        "type": "card",
        "is_default": true,
        "status": "active",
        "last4": "4242",
        "card_brand": "visa",
        "card_funding": "credit",
        "card_country": "US",
        "wallet_type": null,
        "expiry_month": 12,
        "expiry_year": 2029,
        "intelligence": {
          "network": "visa",
          "three_d_secure": "authenticated",
          "checks": { "avs": "pass", "cvc": "pass", "line1": "pass" },
          "card_shared": false,
          "card_shared_customer_count": 1
        }
      }
    ],
    "invoices": [ ... ],
    "subscriptions": [ ... ]
  }
}
```

All intelligence fields are best-effort and nullable. `intelligence.last_risk_level` may be `null`; the paid numeric Stripe risk score is **not** exposed. See [§4 Data model](#4-data-model) for full field definitions.

#### `PUT /customers/{id}` — update
Scope: `customers:update`. Body fields are optional: `name`, `email` (uniqueness validated within your tenant), `phone`, `address`, `metadata`.

#### `DELETE /customers/{id}` — delete
Scope: `customers:delete`. Rejected with 400 if the customer has any invoices. Soft-delete in your DB instead if you need to "delete" customers with payment history.

#### `GET /customers/{id}/invoices` — customer's invoices
Scope: `customers:read`. Query: `status`. Returns all (non-paginated).

#### `GET /customers/{id}/payment-methods` — customer's cards
Scope: `customers:read`. Returns only `status = active`.

### 5.2 Invoices

#### `POST /invoices` — create
Scope: `invoices:create`.

```json
{
  "customer_id": "uuid",
  "currency": "usd",
  "due_date": "2026-06-12",
  "status": "draft",
  "auto_bill": true,
  "items": [
    { "description": "Service Q2", "quantity": 1, "unit_amount": 50000 }
  ],
  "meta": {}
}
```

- `unit_amount` is in cents.
- If `customer_id` doesn't belong to your tenant, you'll get 403. (Confirmed: this used to be a bug — fixed.)
- If `auto_bill = true` and the customer has a default `PaymentMethod`, the autopay scheduler will charge automatically when `due_date` is reached.

Response 201: full invoice with items.

#### `GET /invoices` — list
Scope: `invoices:read`. Query: `customer_id`, `status`, `from_date`, `to_date`, `per_page`.

#### `GET /invoices/{id}`, `PATCH /invoices/{id}`
Standard. `PATCH` accepts `due_date`, `auto_bill`, `items` (replaces all). Cannot update once paid.

#### `POST /invoices/{id}/finalize` — make payable
Scope: `invoices:update`. Transitions `draft` → `pending`. Fires `invoice.finalized` event.

#### `POST /invoices/{id}/void` — cancel
Scope: `invoices:update`. Rejects if already paid. Fires `invoice.voided` event.

#### `POST /invoices/{id}/pay` — pay now with a specific PM
Scope: `payments:create`.
```json
{ "payment_method_id": "uuid" }
```
Charges synchronously. Returns the `transaction`. May 402 if the card is declined (you'll see the actual Stripe message — surface to the user).

#### `POST /invoices/{id}/pay-with-default` — pay with the customer's default card
Scope: `payments:create`. Same as above but uses `is_default = true` PM.

#### `POST /invoices/{id}/enable-autopay` / `disable-autopay`
Scope: `invoices:update`. Toggles `auto_bill`.

#### `POST /invoices/{id}/process-autopay` — manually trigger autopay now
Scope: `payments:create`. Useful for retries.

### 5.3 Payment methods

#### `GET /payment-methods` — list
Scope: `payments:read`.

#### `POST /customers/{customer}/payment-methods` — attach (rarely used directly)
Scope: `payments:create`. Almost always you'll use the SetupWidget for this — it handles the Stripe Elements + tokenization dance. Use this endpoint only if you have a pre-existing Stripe `pm_...` ID from another flow.

#### `GET /customers/{customer}/payment-methods`, `GET /payment-methods/{id}`
Scope: `payments:read`.

#### `DELETE /payment-methods/{id}` — remove
Scope: `payments:delete`. Detaches from Stripe and marks `status = inactive` locally. Rejected if the PM has pending transactions.

#### `POST /payment-methods/{id}/set-default`
Scope: `payments:update`. Sets this PM as the customer's default. Used by autopay.

### 5.4 Transactions

#### `GET /transactions` — list
Scope: `payments:read`. Query: `type` (charge/refund), `status`, `customer_id`, `invoice_id`, `from_date`, `to_date`.

#### `GET /transactions/stats`, `GET /transactions/recent`
Scope: `payments:read`. Aggregated summaries.

#### `POST /transactions/refund` — issue refund
Scope: `payments:create`.

```json
{
  "transaction_id": "uuid",
  "amount": 5000,    // optional; omit for full refund
  "reason": "requested_by_customer"
}
```

Returns the refund Transaction. Full refunds void the invoice; partial refunds decrement `amount_paid` but leave status as `paid`. See [§8.3](#83-refund-lifecycle).

#### `GET /transactions/{id}`
Scope: `payments:read`.

### 5.5 Subscriptions

#### `POST /subscriptions` — create
Scope: `subscriptions:create`.

```json
{
  "customer_id": "uuid",
  "name": "Pro Plan",
  "amount": 2900,
  "currency": "usd",
  "interval": "month",
  "interval_count": 1,
  "start_date": "2026-05-12",
  "trial_days": 14,
  "auto_bill": true,
  "payment_method_id": "uuid"
}
```

`trial_days > 0` defers the first charge by that many days. `payment_method_id` is optional but recommended — if absent, the customer must set up a card before the first billing date or the charge will fail.

#### `GET /subscriptions`, `GET /subscriptions/stats`, `GET /subscriptions/{id}`
Scope: `subscriptions:read`. Filter by `customer_id`, `status`, `interval`, etc.

#### `PUT /subscriptions/{id}` — update
Scope: `subscriptions:update`. Can change `amount`, `next_billing_date`, `payment_method_id`, `auto_bill`, etc.

#### `POST /subscriptions/{id}/cancel`, `/pause`, `/resume`
Scope: `subscriptions:update`. Cancellation is immediate (no proration). Pause halts billing until resumed.

#### `POST /subscriptions/{id}/generate-invoice`
Scope: `subscriptions:create`. Manually generate the next invoice early (useful for off-cycle billing).

#### `GET /subscriptions/{id}/invoices`
Scope: `subscriptions:read`. All invoices associated with this subscription.

### 5.6 Payouts and balance

#### `GET /balance`
Scope: `payouts:read`. Returns matured (post-hold) and held credits, debits, and currently available amount.

```json
{
  "data": {
    "total_credits": 100000,
    "total_debits": 5000,
    "incoming": 20000,         // credits within hold period
    "matured": 80000,
    "available": 75000,        // matured - debits
    "pending_payouts": 0,
    "withdrawable": 75000,     // available - pending_payouts
    "currency": "USD",
    "hold_days": 7
  }
}
```

The hold period (default 7 days) is configured per-platform; recent charges count as `incoming` and are excluded from `available` until they age past the hold.

#### `GET /payouts`, `GET /payouts/{id}`
Scope: `payouts:read`.

#### `POST /payouts` — request a payout
Scope: `payouts:create`.

```json
{ "amount": 50000, "currency": "USD" }
```

Server validates `amount <= withdrawable`. Creates a Payout in `pending`. Platform admin processes it (or a scheduled job, if configured). Fires `payout.created`, then later `payout.completed` or `payout.failed`.

#### `GET /ledger`
Scope: `payouts:read`. The full balance ledger, paginated. Useful for reconciliation against your own records.

### 5.7 Disputes

#### `GET /disputes`, `GET /disputes/{id}`
Scope: `disputes:read`. Read-only — disputes are created by Stripe via webhook, not by you. Evidence submission happens through the Stripe dashboard.

### 5.8 Webhook endpoint management

If your `billing` token has `webhooks:*` scopes (you'd add these manually to enable this), you can manage your registered webhook endpoints via API. Most clients don't need this — they configure their endpoint once in the admin UI and forget about it.

#### `POST /webhooks` — register endpoint
Scope: `webhooks:create`.

```json
{
  "url": "https://your-backend.example.com/webhooks/billings",
  "events": ["payment.succeeded", "invoice.paid", "refund.processed"],
  "description": "Primary production receiver"
}
```

Response includes `data.secret` — **save it once, it's not retrievable later**.

#### `GET /webhooks`, `GET /webhooks/{id}`, `PUT /webhooks/{id}`, `DELETE /webhooks/{id}`

#### `POST /webhooks/{id}/rotate-secret`
Scope: `webhooks:update`. Returns a new signing secret. Update your verifier immediately or you'll start rejecting events.

#### `POST /webhooks/{id}/test` — send a synthetic test event
Scope: `webhooks:create`. Useful during integration to verify your verifier works.

#### `GET /webhooks/{id}/deliveries`
Scope: `webhooks:read`. Per-delivery history with status, attempt count, response body. Use this to diagnose failures.

### 5.10 System

#### `GET /api/v1/ping`
Health check. Returns `{ "pong": true, "user": { "id": ..., "email": ... }, "timestamp": ... }`. Use this to verify a token is valid and you're hitting the right environment.

---

## 6. Browser widgets

Browser widgets are pre-built JavaScript modules that handle card collection, payment, and account self-service. They live at `https://billings.systems/widgets/{Name}.js`. They use Stripe Elements internally so PCI scope on your side stays minimal (SAQ-A).

### 6.1 Common embed pattern

Every widget follows the same shape:

```html
<!-- 1. Stripe.js — required for any widget that touches a card -->
<script src="https://js.stripe.com/v3/"></script>

<!-- 2. The widget script — exposes a global function -->
<script src="https://billings.systems/widgets/SetupWidget.js"></script>

<!-- 3. A container element -->
<div id="my-widget"></div>

<!-- 4. The instantiation -->
<script>
  SetupWidget({
    config: {
      customerId: '...',
      apiKey: '{{ billing_publishable }}',
      onSuccess: (data) => { /* ... */ },
      onError: (err) => { /* ... */ },
    },
    container: document.getElementById('my-widget'),
  });
</script>
```

`apiKey` is your `billing_publishable` token. Render it server-side into the page — never bake it into a static asset that gets cached at a CDN you don't control.

### 6.2 SetupWidget — save a card

Use when: you want to collect and save a card for future use (no charge now). Typical for subscription signup or "add a card" flows.

**Required config:** `customerId`, `apiKey`, `container`, `logoImage` (if `showLogo` is true).

**Optional config:** `theme` (`modern`|`minimal`|`gradient`|`dark`), `borderRadius`, `title`, `subtitle`, `buttonText`, `collectBillingDetails`, `collectAddress`, `allowedCountries`, `colors`, `typography`, `spacing`, `onSuccess`, `onError`, `onValidationError`, `debug`.

When billing-address collection is enabled (see [§6.12](#612-collecting-the-billing-address-collect_address)), the widget mounts a Stripe `AddressElement` and the captured address is merged into the saved payment method's `billing_details`, feeding the customer/PM location and intelligence fields.

**Callbacks:**

```javascript
onSuccess: (data) => {
  // data.payment_method = { id, type, last4, expiry_month, expiry_year, fingerprint, status }
  // data.customer_id, data.setup_intent_id
}

onError: (error) => {
  // error.message is sanitized — already user-safe.
  // Common: "Your card's security code is incorrect.", "Customer not found or access denied"
}
```

**Internal flow (you don't see this, but understanding it helps debug):**

1. Widget calls `GET /widget/config` to fetch Stripe publishable key + feature flags.
2. Widget initializes Stripe Elements in `mode: 'setup'`.
3. On submit:
   a. Calls `stripe.elements.submit()` (Stripe-side validation).
   b. Calls `stripe.createPaymentMethod()` → returns a `pm_...` ID.
   c. POSTs to `/widget/setup/attach` with `customer_id` and `payment_method_id`.
4. Server attaches the PM to the customer in Stripe, saves the PM locally, deduplicates by fingerprint, fires `payment_method.attached` event.

**If `/widget/setup/attach` fails after step 3b, the `pm_` exists in Stripe but is not attached.** Stripe garbage-collects unattached payment methods after about an hour. We don't currently have a cleanup job for this — see [§15](#15-known-issues-and-operator-playbook).

### 6.3 PaymentWidget — pay an invoice or one-shot charge

Use when: you want to charge a card. Two modes:
- **Invoice mode**: pass `invoiceId` — the widget fetches the invoice amount and charges it.
- **Direct payment mode**: pass `amount` and `currency` — the widget creates a new invoice on the fly and charges it.

**Required config:** `customerId`, `apiKey`, `container`, plus either `invoiceId` or `amount` + `currency`.

**Internal flow:**

1. Same config fetch as SetupWidget.
2. Stripe Elements in `mode: 'payment'`.
3. On submit:
   a. `stripe.elements.submit()`.
   b. `stripe.createPaymentMethod()` → `pm_...`.
   c. POST `/widget/payment/attach-and-pay` (invoice mode) or `/widget/payment/pay` (direct mode).
4. Server attaches PM, charges via Stripe, marks invoice paid, fires `payment.succeeded` and `invoice.paid` events.

**Callback data shape:**

```javascript
onSuccess: (data) => {
  // data.transaction = { id, amount, currency, status, provider_ref }
  // data.invoice    = { id, status: 'paid', paid_at, ... }
  // data.payment_method = { id, last4, type }
}
```

**Post-payment navigation (precedence):** a `successUrl` (an `http(s)`/relative URL)
wins and the widget redirects there; unsafe schemes (`javascript:`, `data:`) are
ignored. If you pass `onSuccess` **without** `successUrl`, the widget fires the callback
and stays put (you navigate). With neither, a legacy `/thank-you` shim runs only on
hosted `/pay/...` pages. Set `successUrl` and/or `onSuccess` and you no longer need a
`/thank-you` route.

**No Stripe Link / no "save your info" prompt.** The Payment Element is built with an
explicit `paymentMethodTypes` list that **excludes Link**, so neither Link nor its save
prompt appears — independent of your Stripe account's Link setting. **Apple Pay / Google
Pay wallets still appear** (controlled by your `/widget/config` flags).

**Reliability:** writes carry an `Idempotency-Key`, and a double-submit guard prevents
duplicate charges from rapid clicks/Enter.

### 6.4 InvoiceWidget — create/manage invoices

Use when: you want a customer-facing or merchant-facing UI for invoice CRUD without building it yourself. Most clients build their own invoice UI server-side; this widget is for quick embedding.

**Required:** `apiKey`, `container`. Set `customerId` to pre-select, or `allowCustomerSelection: true` to show a picker.

### 6.5 PortalWidget — customer self-service portal

Use when: you want to embed a "my account" page showing the customer's balance, recent invoices, transaction history. Read-only display.

**Required:** `customerId`, `apiKey`, `container`, `logoImage` (if showing logo).

Calls `GET /widget/portal/{customer}` once on load. No further server calls. Refresh by re-instantiating.

### 6.6 ReceiptWidget — display a receipt

Use when: you want to show a paid-invoice receipt on a thank-you page or printable view.

**Required:** `container`, plus either `invoiceId` (auth required) or `token` (public share token, no auth — useful for emailing receipt links).

### 6.7 SubscriptionWidget — subscription plan picker + checkout

Use when: you want a pre-built plan selector + payment form for subscription signup.

Pass `plans` array (or have the widget fetch from your API), `customerId`, `apiKey`. Many optional config flags: `enableTrials`, `defaultTrialDays`, `paymentOnly` (skip plan selection), `preselectedPlan`, etc.

### 6.8 AnalyticsWidget — embedded dashboard

Platform-admin-only. Requires a token whose user has `role = admin`. Shows revenue, refunds, MRR, disputes, balance, etc. across all clients. Not for client integrations.

### 6.9 Widget customization

All payment-touching widgets accept these consistent style props:

```javascript
{
  theme: 'modern' | 'minimal' | 'gradient' | 'dark',
  borderRadius: 'none' | 'small' | 'medium' | 'large' | 'xl' | 'full',
  colors: {
    primary: '#3b82f6',
    danger: '#ef4444',
    success: '#10b981',
    text: '#f8fafc',
    background: '#0f172a',
    // ...
  },
  typography: {
    fontFamily: '"Inter", sans-serif',
    titleSize: '24px',
    // ...
  },
  spacing: {
    padding: '32px',
    fieldSpacing: '24px',
    // ...
  },
  showLogo: true,
  logoImage: 'https://your.cdn.example.com/logo.png',  // REQUIRED if showLogo is true
}
```

The widget renders into its container element using inline styles. It does not pollute your global CSS namespace.

**PaymentWidget also accepts** (in addition to the props above):

- `labels` — override every UI string, e.g. `{ pay: 'Complete order', secure: 'Secure checkout', paymentMethod: 'Card details', success: 'Thanks!', loading: 'Loading…', invoiceLabel: 'Invoice', dueLabel: 'Due' }`. Omit `labels.pay` to keep the default `Pay $X`.
- `classNames` — append your own classes to key elements: `{ container, form, button }`. The stable `billing-*` classes always remain, so existing CSS keeps working.
- **CSS variables** — the widget exposes `--billing-accent`, `--billing-accent-hover`, `--billing-text`, `--billing-text-secondary`, `--billing-error`, `--billing-success`, and `--billing-radius` on `.billing-widget`. Override them from your own stylesheet to fully restyle without forking. (`colors` seeds these from JS.)

For total UI control, skip the widget and use the headless `PaymentCore` client — see [§6.11](#611-headless-integration-paymentcore--bring-your-own-ui).

### 6.10 Widget error handling on your side

Every widget exposes an `onError` callback. The error message has already been sanitized (Stripe test-mode hints stripped, internal stack traces removed). You can:

- Display it inline (the widget also does this automatically).
- Send it to your error tracking (Sentry, etc.).
- Trigger a fallback flow.

```javascript
onError: (error) => {
  // Surface to user — message is safe
  showToast('error', error.message);

  // Telemetry
  Sentry.captureException(error, { tags: { component: 'PaymentWidget' } });

  // Optional: offer alternative flow
  if (error.message.toLowerCase().includes('declined')) {
    showSecondaryPaymentMethodPicker();
  }
}
```

### 6.11 Headless integration (`PaymentCore`) — bring your own UI

When you want to design the entire checkout UI yourself and just pass the payment logic
through, use the headless client at `https://billings.systems/widgets/PaymentCore.js`
(global `PaymentCore`). It uses the same zero-scope `/widget/*` endpoints, idempotent
writes, and 3DS handling as PaymentWidget — but renders nothing.

```html
<script src="https://js.stripe.com/v3/"></script>
<script src="https://billings.systems/widgets/PaymentCore.js"></script>
<script>
  const billing = PaymentCore({ apiKey: 'pk_live_...' });

  const cfg    = await billing.getConfig();          // { stripe.publishable_key, payment_methods }
  const stripe = Stripe(cfg.stripe.publishable_key);
  // ...mount YOUR OWN Stripe Elements...

  const { paymentMethod } = await stripe.createPaymentMethod({ elements });
  let res = await billing.payInvoice({ customerId, invoiceId, paymentMethodId: paymentMethod.id });
  res = await billing.confirmIfRequired(stripe, res, paymentMethod.id);  // handles 3DS/SCA
  if (res.success) { /* your success UI */ }
</script>
```

Methods: `getConfig()`, `getInvoice(invoiceId)`,
`payInvoice({ customerId, invoiceId, paymentMethodId, idempotencyKey? })`,
`payAmount({ customerId, amount, currency?, paymentMethodId, idempotencyKey? })`,
`confirmIfRequired(stripe, response, paymentMethodId)`. A response with
`data.client_secret` means SCA/3DS is required — pass it to `confirmIfRequired`. Supply
your own `idempotencyKey` to make retries safe.

### 6.12 Collecting the billing address (`collect_address`)

The card-touching widgets (SetupWidget and PaymentWidget) can optionally mount a Stripe
`AddressElement` (`mode: 'billing'`) so the customer enters a full billing address. When
on, the captured address is merged into the payment method's `billing_details` and flows
into the customer/PM location columns (`postal_code`, `country`, `city`) and the
`intelligence{}` snapshots, and improves AVS results. **Off by default** (opt-in).

It can be set at three levels, in increasing order of precedence:

1. **Per-client (admin gateway settings).** Your platform admin toggles **"Collect Billing
   Address"** on your Stripe gateway credential (Admin → Clients → your client → gateway
   `payment_methods.collect_address`). This becomes the default for all your embeds and is
   surfaced to widgets via `GET /widget/config` as `defaults.collect_address`.

2. **Per-invoice.** Set `meta.collect_address: true` (or `false`) when you create or update
   an invoice. This overrides the client default for that invoice's payment flow:
   ```json
   { "customer_id": "uuid", "currency": "usd", "items": [ ... ], "meta": { "collect_address": true } }
   ```

3. **Per-embed widget prop.** Pass `collectAddress: true` (camelCase) in the widget config
   to force address collection on a single embed, overriding the server default:
   ```javascript
   SetupWidget({
     config: { customerId: '...', apiKey: '{{ billing_publishable }}', collectAddress: true },
     container: document.getElementById('my-widget'),
   });
   ```

You can also override it server-side per request via `POST /widget/config` with
`overrides.collect_address`. If none of the above are set, address collection stays off.

---

## 7. Outbound webhooks (billings → your server)

Real-time push notifications when state changes. Subscribe to specific events; receive HTTP POST with HMAC-signed JSON body.

### 7.1 Registering an endpoint

Two ways:

1. **Billings.systems admin UI** → Webhooks → Add endpoint. Specify URL and events. Copy the signing secret immediately.
2. **API** (if your `billing` token has `webhooks:create`): `POST /api/v1/webhooks`. See [§5.9](#59-webhook-endpoint-management).

Use multiple endpoints if you want different destinations for different events (e.g., production receives all events, staging receives only test events).

### 7.2 Delivery envelope

Every webhook POST contains:

```http
POST /your-webhook-url HTTP/1.1
Content-Type: application/json
X-Billings-Signature: t=1715526125,v1=5257a869e7ecebeda32affa62cdca3fa51cad7e77a0e56ff536d0ce8e108d8bd

{
  "id": "uuid-of-this-delivery",
  "type": "payment.succeeded",
  "created_at": "2026-05-12T15:30:00Z",
  "data": { /* event-specific payload — see §7.5 */ }
}
```

- `X-Billings-Signature` carries the timestamp and HMAC.
- Body is JSON with a stable envelope (`id`, `type`, `created_at`, `data`).
- The same delivery ID is reused on retry — use it to dedupe.

### 7.3 Verifying webhook signatures

Pseudocode:

```python
def verify(request_headers, raw_body, signing_secret, tolerance_seconds=300):
    sig_header = request_headers["X-Billings-Signature"]
    parts = dict(p.split("=", 1) for p in sig_header.split(","))
    timestamp = int(parts["t"])
    given_sig = parts["v1"]

    if abs(time.time() - timestamp) > tolerance_seconds:
        raise WebhookError("Stale timestamp — replay protection rejected")

    expected = hmac_sha256(f"{timestamp}.{raw_body}", signing_secret).hex()

    if not hmac.compare_digest(expected, given_sig):
        raise WebhookError("Invalid signature")
```

**Critical rules:**

- **Hash the RAW request body** before any JSON parsing. Most frameworks parse JSON before handing you the body — you have to opt out of that or read the raw bytes first.
- **Use constant-time comparison** (`hmac.compare_digest` in Python, `crypto.timingSafeEqual` in Node, `hash_equals` in PHP). Don't use `==`.
- **Enforce a 5-minute timestamp tolerance** to reject replayed events.

PHP/Laravel example:

```php
public function verify(Request $request, string $signingSecret): bool
{
    $sigHeader = $request->header('X-Billings-Signature');
    if (!$sigHeader) return false;

    parse_str(str_replace(',', '&', $sigHeader), $parsed);
    $timestamp = (int) ($parsed['t'] ?? 0);
    $given = $parsed['v1'] ?? '';

    if (abs(time() - $timestamp) > 300) return false;

    $expected = hash_hmac('sha256', $timestamp . '.' . $request->getContent(), $signingSecret);

    return hash_equals($expected, $given);
}
```

Node.js example:

```javascript
const crypto = require('crypto');

function verify(headers, rawBody, secret) {
  const sigHeader = headers['x-billings-signature'];
  const parts = Object.fromEntries(sigHeader.split(',').map(p => p.split('=')));
  const timestamp = parseInt(parts.t, 10);
  const given = parts.v1;

  if (Math.abs(Date.now() / 1000 - timestamp) > 300) return false;

  const expected = crypto
    .createHmac('sha256', secret)
    .update(`${timestamp}.${rawBody}`)
    .digest('hex');

  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(given));
}
```

### 7.4 Retry behavior

If your endpoint returns anything other than 2xx, billings.systems will retry with exponential backoff: **10s, 1 min, 5 min, 30 min, 2h**. After 5 attempts the delivery is marked `failed`. After 10 cumulative failures across deliveries, the *endpoint* is marked `failing` and stops receiving new deliveries until you re-activate it in the admin UI.

**Implications for your handler:**

- Return 200 (or any 2xx) as fast as possible. Do real work in a background job.
- If you can't process the event right now (DB read-only, downstream service down), return 5xx — billings.systems will retry.
- Don't return 4xx on a transient error — that signals "permanent failure, give up" semantically (though our system still retries).
- Be prepared to receive the same event multiple times (retry, manual replay, or Stripe-initiated double delivery). **Dedupe on the envelope `id`**.

### 7.5 Event reference

Every event uses the standard envelope. The `data` field's shape depends on event type. Below is the complete list.

#### `payment.succeeded`

Fired when a charge succeeds. From `PaymentService::payInvoice()` and from the inbound `payment_intent.succeeded` Stripe webhook.

```json
{
  "id": "transaction-uuid",
  "invoice_id": "uuid",
  "customer_id": "uuid",
  "payment_method_id": "uuid",
  "provider": "stripe",
  "provider_ref": "pi_xxx",
  "amount": 10000,
  "currency": "USD",
  "type": "charge",
  "status": "succeeded",
  "platform_fee": 290,
  "stripe_fee": 130,
  "net_amount": 9580,
  "settlement_status": "pending",
  "meta": { ... },
  "card": {
    "brand": "visa",
    "funding": "credit",
    "last4": "4242",
    "country": "US",
    "network": "visa",
    "wallet_type": null,
    "three_d_secure": "authenticated",
    "checks": { "avs": "pass", "cvc": "pass", "line1": "pass" }
  },
  "risk": {
    "level": "normal",
    "network_status": "approved_by_network",
    "seller_message": "Payment complete."
  }
}
```

The `card{}` and `risk{}` blocks are additive (existing keys unchanged) and best-effort — all of their fields are nullable. `risk.level` is Stripe Radar's risk level (`normal` | `elevated` | `highest`) and may be `null`; no numeric risk score is provided. The full Stripe payload also remains available under `meta`.

Idempotent on `id`. May arrive after `invoice.paid` due to event ordering.

#### `payment.failed`

Fired when a charge fails. Note: includes `failure_code` and `failure_message` — use these to display useful errors.

```json
{
  "id": "uuid",
  "invoice_id": "uuid",
  "amount": 10000,
  "status": "failed",
  "failure_code": "card_declined",
  "failure_message": "Your card was declined."
}
```

Common `failure_code` values: `card_declined`, `insufficient_funds`, `expired_card`, `incorrect_cvc`, `processing_error`.

#### `invoice.created`

Fired on `POST /invoices`.

```json
{
  "id": "uuid",
  "user_id": "uuid",
  "customer_id": "uuid",
  "number": "INV-202605-0001",
  "currency": "usd",
  "amount_due": 50000,
  "amount_paid": 0,
  "status": "draft",
  "due_date": "2026-06-12",
  "auto_bill": true,
  "items": [ ... ]
}
```

#### `invoice.finalized`

Fired when invoice transitions `draft` → `pending`. Payload is same shape as `invoice.created`.

#### `invoice.paid`

Fired when invoice transitions to `paid`. Same shape, plus `paid_at`, `fee_amount`, `net_amount`.

#### `invoice.voided`

Fired when invoice is voided. Includes `voided_at`.

#### `refund.processed`

Fired when a refund completes (synchronous from your `POST /transactions/refund` or asynchronous via Stripe `charge.refunded` webhook).

```json
{
  "id": "refund-transaction-uuid",
  "invoice_id": "uuid",
  "amount": 5000,
  "currency": "USD",
  "type": "refund",
  "status": "succeeded",
  "provider_ref": "re_xxx",
  "meta": { "original_transaction_id": "uuid", "original_provider_ref": "ch_xxx" }
}
```

#### `payment_method.attached`

Fired when a card is saved (SetupWidget success).

```json
{
  "id": "uuid",
  "customer_id": "uuid",
  "type": "card",
  "provider": "stripe",
  "provider_ref": "pm_xxx",
  "fingerprint": "abc123",
  "last4": "4242",
  "expiry_month": 12,
  "expiry_year": 2029,
  "card_brand": "visa",
  "card_funding": "credit",
  "card_country": "US",
  "wallet_type": null,
  "intelligence": {
    "network": "visa",
    "three_d_secure": "authenticated",
    "checks": { "avs": "pass", "cvc": "pass", "line1": "pass" },
    "card_shared": false,
    "card_shared_customer_count": 1
  },
  "billing_details": { "name": "...", "address": { "line1": "...", "city": "...", "postal_code": "...", "country": "US" } },
  "status": "active",
  "is_default": false
}
```

**Note:** `encrypted_payload` has been **removed** from this payload — it is no longer sent. The new `card_brand` / `card_funding` / `card_country` / `wallet_type` columns and the `intelligence{}` block (including `card_shared` / `card_shared_customer_count`) are additive and best-effort/nullable.

#### `payment_method.detached`

Fired when a card is deleted (`DELETE /payment-methods/{id}`) or detached out-of-band in Stripe.

#### `customer.created`

Fired on `POST /customers`. Payload is the full `CustomerPayload` shape, now including the denormalized location fields and the `intelligence{}` snapshot (both may be empty/`null` on a freshly created customer that has no card yet).

```json
{
  "id": "uuid",
  "user_id": "uuid",
  "external_ref": "...",
  "provider_ref": "cus_xxx",
  "name": "Acme Corp",
  "email": "ap@acme.com",
  "postal_code": "94107",
  "country": "US",
  "city": "San Francisco",
  "intelligence": {
    "last_card_brand": null,
    "last_card_funding": null,
    "last_card_country": null,
    "last_wallet_type": null,
    "last_card_network": null,
    "last_risk_level": null,
    "address_line1": "123 Main St",
    "address_line2": null,
    "address_state": "CA",
    "contact_name": "Acme Corp",
    "contact_phone": "+15555550100",
    "last_seen_at": null
  },
  "meta": { ... },
  "created_at": "2026-06-20T15:30:00Z",
  "updated_at": "2026-06-20T15:30:00Z"
}
```

#### `customer.updated`

Fired on `PUT /customers/{id}` or `customer.updated` Stripe webhook. Same `CustomerPayload` shape as `customer.created` (including `postal_code`, `country`, `city`, and `intelligence{}`).

#### `customer.intelligence.updated`

Fired when a customer's denormalized location or "last seen" card-intelligence snapshot **materially changes** — for example when they pay with a card from a different country, switch funding type, or their billing address changes. The check is diff-guarded, so you will not receive this event for no-op updates. Useful for fraud/segmentation pipelines without polling.

Payload is the full `CustomerPayload` shape (identical to `customer.created` / `customer.updated`), reflecting the new snapshot:

```json
{
  "id": "uuid",
  "user_id": "uuid",
  "external_ref": "...",
  "provider_ref": "cus_xxx",
  "name": "Acme Corp",
  "email": "ap@acme.com",
  "postal_code": "10001",
  "country": "US",
  "city": "New York",
  "intelligence": {
    "last_card_brand": "mastercard",
    "last_card_funding": "debit",
    "last_card_country": "GB",
    "last_wallet_type": "apple_pay",
    "last_card_network": "mastercard",
    "last_risk_level": "elevated",
    "address_line1": "456 Broadway",
    "address_line2": "Suite 5",
    "address_state": "NY",
    "contact_name": "Acme Corp",
    "contact_phone": "+15555550100",
    "last_seen_at": "2026-06-20T18:42:00Z"
  },
  "meta": { ... },
  "created_at": "2026-06-18T09:00:00Z",
  "updated_at": "2026-06-20T18:42:00Z"
}
```

`intelligence.last_risk_level` is best-effort and may be `null` (no numeric risk score is provided). Register for it like any other event — its type string is `customer.intelligence.updated`.

#### `subscription.created`, `subscription.updated`, `subscription.cancelled`, `subscription.paused`, `subscription.resumed`

Fired on subscription state transitions. Data is the full Subscription object.

#### `dispute.created`

Fired when Stripe notifies us of a chargeback (`charge.dispute.created`).

```json
{
  "id": "uuid",
  "transaction_id": "uuid",
  "provider_ref": "dp_xxx",
  "amount": 10000,
  "currency": "USD",
  "status": "needs_response",
  "reason": "fraudulent",
  "due_by": "2026-06-11T23:59:00Z"
}
```

**Important:** the disputed amount is debited from your balance *immediately* (see [§10](#10-disputes-and-chargebacks)). The funds are held until the dispute is resolved.

#### `dispute.updated`

Fired when dispute status changes.

#### `dispute.closed`

Fired when dispute resolves. `data.status` will be either `won` (you keep the money) or `lost` (customer keeps the money + the chargeback fee). On `won`, the debit is reversed.

#### `payout.created`

Fired when you (or admin) request a payout.

#### `payout.completed`

Fired when funds successfully reach your bank account. Typically 2-3 business days after `payout.created`.

#### `payout.failed`

Fired when a payout fails (bank rejected, invalid routing info). The original debit is reversed and funds return to your available balance.

### 7.6 Recommended handler pattern

```python
@app.post("/webhooks/billings")
async def billings_webhook(request):
    body = await request.body()  # RAW bytes — do NOT parse yet
    if not verify_signature(request.headers, body, BILLINGS_WEBHOOK_SECRET):
        return Response(status_code=401)

    event = json.loads(body)

    # Dedupe — store event.id in a table with unique constraint
    if event_already_processed(event["id"]):
        return Response(status_code=200, content="duplicate")

    # Fast ack — enqueue real work
    enqueue_event_processing(event)

    return Response(status_code=200, content="ok")
```

Process events asynchronously. The handler itself should do nothing but verify + dedupe + enqueue. This minimizes the chance of returning 5xx (and triggering retries).

---

## 8. Money flow — charges, refunds, fees, balance, payouts

The single most important section. Get this wrong and you'll have ghost charges, double refunds, or unpaid invoices marked as paid.

### 8.1 Charge lifecycle

```
1. POST /invoices/{id}/pay or widget /widget/payment/...
                  │
                  ▼
2. Server: lock invoice row, validate PM
                  │
                  ▼
3. Server: call Stripe charges.create with idempotency key
                  │
                  ▼
4. Server: write Transaction (status='processing' or 'succeeded')
   Server: write BalanceLedgerEntry (credit, settlement_status='pending')
   Server: update Invoice (status='paid', amount_paid=amount_due)
                  │
                  ├──────► fire payment.succeeded event
                  ├──────► fire invoice.paid event
                  │
                  ▼
5. Async: Stripe webhook `payment_intent.succeeded` arrives
                  │
                  ▼
6. Server: backfill stripe_fee, settled_amount, exchange_rate,
           balance_transaction_id on the Transaction
   Server: update BalanceLedgerEntry with correct fee breakdown
   Server: settlement_status='settled'
```

**Critical timing notes:**

- The invoice is marked `paid` *immediately* on synchronous Stripe success (step 4), before settlement data arrives. This is fast for UX but means `fee_amount` is approximate until the webhook in step 5 corrects it.
- The balance ledger entry is created in step 4 with only `platform_fee` known (no `stripe_fee` yet). Total credit is `chargedAmount - platformFee`. After step 6, the entry is corrected to include the actual Stripe fee.
- If the webhook in step 5 never arrives, the hourly `stripe:reconcile-charges` job will recover.

### 8.2 Currency conversion

If your charge is in one currency and your Stripe account settles in another (e.g., customer pays USD, you settle in EUR), the `Transaction` records both:

- `amount` + `currency` = what the customer paid (USD).
- `settled_amount` + `settled_currency` + `exchange_rate` = what arrived in your balance (EUR).

The `BalanceLedgerEntry` is recorded in **settled currency** so the available balance math works.

### 8.3 Refund lifecycle

```
1. POST /transactions/refund (amount optional — omit for full refund)
                  │
                  ▼
2. Server: validate original charge is 'succeeded' and not already fully refunded
                  │
                  ▼
3. Server: call Stripe refunds.create  ←── OUTSIDE DB transaction (irreversible)
                  │
                  ▼
4. Server (in DB transaction):
   - Write refund Transaction (type='refund', status='succeeded')
   - Write BalanceLedgerEntry (debit)
   - Update invoice amount_paid; void if fully refunded
                  │
                  ├──────► fire refund.processed event
                  │
                  ▼
5. Async: Stripe webhook `charge.refunded` arrives
                  │
                  ▼
6. Server: cross-check — if our refund Transaction already exists by provider_ref,
           skip; if not, create it (catches webhook-first race)
```

**Critical edge cases:**

- **Currency-converted refunds:** the debit is in settled currency, scaled by the recorded `exchange_rate` so it offsets the original credit cleanly.
- **Platform fees on refunds:** the platform retains the original fee — you do not get the fee back when you issue a refund. The Stripe fee is also not refunded by Stripe. So a $100 refund out of a $100 charge with $5 platform fee + $3 Stripe fee results in a $100 customer-side refund, but only $92 was ever in your balance to give back. **You eat the fees.** Plan for this in your refund policies.
- **Partial refunds:** invoice stays `paid` with `amount_paid` decremented. There's no `partially_refunded` status — you'll need to derive this on your side by comparing `amount_paid` to `amount_due`.

### 8.4 Platform fees

`FeeProfile` defines `percentage_fee` (basis points; 290 = 2.90%) and `fixed_fee` (cents per transaction). Computed at charge time as:

```
platform_fee = floor(amount * percentage_fee / 10000) + fixed_fee
```

Stripe fees are reported separately by Stripe after settlement. Your `net_amount` per charge is:

```
net_amount = amount - platform_fee - stripe_fee
```

**You cannot change your own fee profile.** Only the platform operator can. If your fee profile changes between charge and refund, the refund still uses the *original* charge's fee values for ledger correctness — there's no retroactive recalculation.

### 8.5 Balance ledger

Every money movement creates a `BalanceLedgerEntry`. The available balance for a currency is:

```
matured_credits = SUM(credit) WHERE created_at < now - hold_days
                                AND currency = X
                                AND credit > 0
total_debits    = SUM(debit) WHERE currency = X

available       = matured_credits - total_debits
```

Where `hold_days` defaults to 7. Recent charges count as "incoming" and become "matured" after the hold period.

**You can request a payout** of up to `available - pending_payouts`. Excess requests are rejected with 422.

### 8.6 Payout lifecycle

```
1. POST /payouts { amount, currency }
                  │
                  ▼
2. Server: validate amount <= available
   Server: create Payout (status='pending')
   Server: write BalanceLedgerEntry (debit, type='payout')
                  │
                  ├──────► fire payout.created event
                  │
                  ▼
3. Async: admin or scheduled job processes the payout via Stripe
   - Calls Stripe payouts.create
   - Updates local Payout status='processing', provider_ref=po_xxx
                  │
                  ▼
4. Async: Stripe webhook `payout.paid` (success) or `payout.failed`
                  │
                  ▼
5a. Success: Payout status='completed', completed_at=now
    Fire payout.completed event.
    
5b. Failure: Payout status='failed'
    REVERSE the original ledger debit (return funds to available)
    Fire payout.failed event.
```

**You should treat payout completion as the source of truth.** The intermediate `pending` and `processing` statuses mean "we've taken the money out of your available balance and are sending it" — if `failed`, it comes back.

---

## 9. Subscription lifecycle

Subscriptions auto-generate invoices on schedule.

```
1. POST /subscriptions  → Subscription (status='active', next_billing_date=...)
2. Optional: trial period — no charges until trial_end_date
3. On next_billing_date: scheduler generates invoice (auto_bill=true)
4. If auto_bill: AutopayService walks the customer's saved cards starting with default
5. On success: charge → invoice paid → fire payment.succeeded + invoice.paid
   On failure (all cards): invoice status='past_due', fire payment.failed
6. Subscription.next_billing_date is advanced by interval × interval_count
7. Loop from step 3
```

**Pause:** `POST /subscriptions/{id}/pause` — sets `status='paused'`. No invoice generation until resumed.

**Resume:** `POST /subscriptions/{id}/resume` — sets `status='active'`, recalculates `next_billing_date`.

**Cancel:** `POST /subscriptions/{id}/cancel` — sets `status='cancelled'`, `end_date=now`. No proration. Fires `subscription.cancelled`. Existing invoices are unaffected.

**Handling failed autopay:** subscribe to `payment.failed`. Inspect `failure_code`:
- `card_declined`, `insufficient_funds` → email the customer asking for a new card; offer link to PortalWidget or SetupWidget.
- `expired_card` → similar, but flag urgency.
- `processing_error` → transient; the autopay job will retry on the next schedule run.

The autopay service walks ALL the customer's active payment methods, starting with `is_default`. It stops on the first success. So if a customer has multiple cards, one expired and one valid, autopay will try the default, fail, then try the next, succeed. You'll receive one `payment.failed` event (for the first card) followed by one `payment.succeeded` event.

---

## 10. Disputes and chargebacks

When a customer's bank initiates a chargeback, you'll see:

```
1. dispute.created webhook arrives
   - Local Dispute created with status='needs_response', due_by=...
   - Local Invoice status='disputed'
   - BalanceLedgerEntry (debit) created — the disputed amount is held
                  │
                  ▼
2. Submit evidence in the Stripe dashboard (not via billings.systems)
                  │
                  ▼
3. Stripe reviews. Days to weeks.
                  │
                  ▼
4. dispute.closed webhook arrives — data.status is 'won' or 'lost'
   - Won: BalanceLedgerEntry credit posted (funds released back to you)
   - Lost: debit remains (you eat the chargeback amount + any chargeback fee)
```

**Important behavior:**

- The debit is preemptive. You lose access to the funds the moment the dispute is created, not when it's lost.
- For a `won` dispute, the funds return — but the original invoice is still marked `disputed` (it doesn't revert to `paid`). The `DailyFinancialAudit` job will detect this and fix it.
- Dispute fees (separate from the chargeback amount) are charged by Stripe and reported in `meta.dispute_fee` if available. Track these for accounting.

---

## 11. Best practices

### 11.1 Idempotency

**Every mutating call to billings.systems requires an `Idempotency-Key` header.**

```
POST /api/v1/customers
Authorization: Bearer {billing}
Idempotency-Key: 5f3a8b1e-87e3-4f3c-9b27-6a3e1d2f8c4a
Content-Type: application/json
```

Rules:

- One key per logical operation. "Customer 123 paid invoice X at time T" is one operation — generate one key for it.
- **Reuse the same key on retry.** If the network drops mid-request, retry with the *same* key. The server caches the response for 5 minutes and replays it. This is how you prevent double-charges from network glitches.
- After 5 minutes, the cache expires. A retry with the same key past that window will be processed as a new request. **In practice, retry within 30 seconds and you're safe.**
- Stripe also has idempotency at its layer (24-hour window) — `charge` and `refund` use deterministic idempotency keys per (invoice, payment method, 30-second window) and (refund target) respectively. Even if our cache misses, Stripe will refuse to double-charge.

**Recommendation:** generate idempotency keys as UUID v4 per operation. Store them in your DB tagged with the operation so you can retry from the same key if your process restarts.

```python
def pay_invoice(invoice_id, payment_method_id):
    idem_key = get_or_create_idempotency_key(operation="pay_invoice", target_id=invoice_id)

    response = requests.post(
        f"{BILLINGS_URL}/api/v1/invoices/{invoice_id}/pay",
        headers={
            "Authorization": f"Bearer {BILLING_TOKEN}",
            "Idempotency-Key": idem_key,
        },
        json={"payment_method_id": payment_method_id},
    )

    if response.status_code in (200, 201):
        mark_idempotency_key_consumed(idem_key)
    return response
```

### 11.2 Retry logic

For transient failures (5xx, network timeouts, 429), retry with exponential backoff.

Recommended schedule:
- Attempt 1: immediate
- Attempt 2: after 1 second
- Attempt 3: after 5 seconds
- Attempt 4: after 30 seconds
- Attempt 5: after 5 minutes

**Always reuse the same `Idempotency-Key` across retries of the same logical operation.**

**Do NOT retry on:**
- 400 (bad request — your payload is wrong)
- 401 (token invalid)
- 403 (scope or ownership issue)
- 402 (card declined — retry would only fail again)
- 422 (validation error)
- 404 (target doesn't exist)

**Do retry on:**
- 429 (respect any `Retry-After` header)
- 500, 502, 503, 504
- Connection timeout
- DNS failure

### 11.3 Error handling philosophy

Two categories:

1. **User-actionable** (4xx with surfaced Stripe error or your own validation): show the message to the user verbatim. Examples: "Your card's security code is incorrect.", "Insufficient funds.", "Email is required."

2. **System errors** (5xx, network): show a generic "Something went wrong, please try again" to the user, log the full error to your error tracking, retry transparently if possible.

Don't show internal server errors to users. Don't bury actionable errors behind generic messages either — that's what the previous version of `BaseApiController` did, and it's now fixed.

### 11.4 Defensive customer/invoice/PM management

- **Always save the billings.systems `id`** when you create a customer, invoice, or PM. You'll need it for every future call.
- **Save `external_ref`** as your own ID on the customer when creating, so you can map back if the local DB gets out of sync.
- **Re-fetch before assuming state.** State changes asynchronously via webhooks. Before showing "your card is saved" or "invoice paid" to the user, re-fetch the resource from billings.systems unless you've just received a synchronous 201/200 response from the operation itself.
- **Use server-side fetches, not client-side**, when displaying sensitive resources. The browser publishable token is intentionally narrowly scoped — don't try to expand its scope.

### 11.5 Defensive webhook handling

- **Verify signature** before doing anything else.
- **Dedupe by envelope `id`** in a table with unique constraint.
- **Return 200 quickly.** Enqueue real work.
- **Handle out-of-order delivery.** A `payment.succeeded` can arrive before `invoice.paid` even though they're paired. Don't assume order.
- **Don't trust `data` field shape blindly.** Use type guards / schema validation.
- **Log the raw body** before parsing, for debugging.

### 11.6 Reconciliation discipline

Don't trust real-time updates to be perfect. Run a daily reconciliation job that:

1. For every Customer/Invoice/Transaction in your local DB with a billings.systems ID, fetch the current state from billings.systems.
2. Compare key fields: invoice status, amount_paid, transaction status.
3. Flag mismatches for review or auto-correct.

This catches:
- Webhook deliveries you missed (your endpoint was down).
- State changes that happened in the billings admin UI.
- Stripe-side changes that came in via webhook but your handler had a bug.

---

## 12. Security

### 12.1 Token storage

| Token | Storage | Encrypt at rest? |
|---|---|---|
| `billing` | Env var or secrets manager | Yes |
| `billing_publishable` | Page HTML, server-rendered | No (it's public) |
| `billing_webhook` | Env var or secrets manager | Yes |
| `billing_admin` | Platform-only, NOT in client config | Yes |

Never log tokens. Never commit them. Never send them to your error tracking — sanitize.

### 12.2 HMAC verification

Every webhook MUST be verified. If your verifier is wrong (e.g., parses JSON first, doesn't constant-time compare, doesn't enforce timestamp tolerance), an attacker who knows your endpoint URL can:

- Forge events to manipulate your local state.
- Replay an old event to re-trigger side effects.

See [§7.3](#73-verifying-webhook-signatures) for correct implementation.

### 12.3 Replay protection

The 5-minute timestamp tolerance is mandatory. Without it, an attacker who captures one valid webhook can replay it indefinitely. Some teams use a stricter tolerance (60 seconds) — that's fine too, as long as your clock is in sync (NTP).

### 12.4 CSP and CSRF for widget pages

Widgets load Stripe.js and our widget JS from external origins. Your Content-Security-Policy must allow:

```
script-src  'self' https://js.stripe.com https://billings.systems
connect-src 'self' https://billings.systems https://api.stripe.com
frame-src   https://js.stripe.com https://hooks.stripe.com
img-src     'self' https: data:
```

For CSRF: widgets call billings.systems directly, not your backend, so widget requests don't need your CSRF token. But the *page* that hosts the widget should still have your normal CSRF protection on any form your own backend handles.

### 12.5 Customer enumeration

The `POST /widget/config/validate` endpoint returns `valid: true/false` for a given customer_id. An attacker could iterate UUIDs to probe which exist. Mitigations:

- UUIDs are 128-bit; brute-forcing is infeasible.
- Rate limit your widget pages aggressively (1 attempt per IP per second).
- Don't expose this endpoint publicly — your widget-rendering page should require auth on your side first.

### 12.6 Logging hygiene

Don't log:
- Full request bodies on `/payment-methods/*` or `/widget/setup/*` (may contain `pm_` IDs which, while not card numbers, are still sensitive).
- Authorization headers.
- Webhook signing secrets.
- Anything in the `meta` field of a payment method's Stripe response (encrypted_payload may contain card metadata).

Do log:
- Endpoint paths and status codes.
- Customer IDs and invoice IDs (these are UUIDs, not PII on their own).
- Stripe IDs (cu_, pi_, pm_, etc. — these are public identifiers).

---

## 13. Self-healing patterns

The system is designed to recover from common failures. Here's what's automatic and what needs you to act.

### 13.1 Stripe ↔ local drift recovery

| Drift | Detection | Recovery |
|---|---|---|
| Local Customer's `provider_ref` points to deleted Stripe customer | On next charge/setup, Stripe returns 404 | `ensureStripeCustomer` re-creates the Stripe customer, updates `provider_ref`. Automatic. |
| Stripe customer created with no local record | `customer.created` webhook arrives | `handleCustomerCreated` reconciles by email; falls back to warning log if no match. |
| Stripe PM detached out-of-band | `payment_method.detached` webhook | Local PM marked `status='inactive'`. |
| Stripe subscription canceled in dashboard | `customer.subscription.deleted` webhook | Local Subscription updated to `cancelled`. |

### 13.2 Orphan recovery

| Object | Detection | Recovery |
|---|---|---|
| Pending Transaction with no webhook follow-up | Hourly `stripe:reconcile-charges` job (last 6 hours) | Matches Stripe PI to local TX, fixes status, marks invoice paid if needed. |
| Pending invoice older than 24h | Hourly `invoices:expire-pending` | Auto-void. |
| Orphan Stripe PM (created via SetupWidget, attach failed) | None currently | Stripe GC's after 1 hour. Operator could write a cleanup script. |
| WebhookDelivery stuck in pending | None (would need ops dashboard) | Operator manually retries via artisan. |
| Payout stuck in processing | `payout.paid` / `payout.failed` webhook | Update or reverse. If webhook lost, requires manual operator action. |

### 13.3 Webhook retry

- Outbound: 5 retries with backoff. After 5 failures, marked `failed`. After 10 cumulative failures across deliveries on an endpoint, the endpoint is marked `failing` and stops receiving new deliveries. **Re-enable it in admin UI after you've fixed the issue.**
- Inbound (Stripe → us): Stripe retries for 3 days on any 5xx response. Stripe-side idempotency handles dedup.

### 13.4 Reconciliation jobs (run on the platform side, you don't need to set these up)

- `stripe:reconcile-charges` (hourly): backfill orphaned Stripe charges.
- `fees:reconcile` (hourly, 6h window): backfill missing `stripe_fee` from Stripe's balance_transaction. Updates the matching ledger entry in the same pass.
- `ledger:reconcile` (06:50 daily, with `--skip-fees-reconcile`): catches any older ledger drift that survived the hourly job. Local-only pass — recalculates every charge ledger entry's credit against its transaction's current fees. Operator can also run it manually with full Stripe refresh.
- `invoices:expire-pending` (hourly): auto-void invoices stuck in `pending`.
- `audit:daily` (07:00 daily): runs `ledger:reconcile` internally first, THEN runs the full ledger ↔ transaction sanity check. Emails admins only on drift that survived the auto-fix. The morning email digest reflects post-fix state, not pre-fix.
- `system:health-check` (every 15min): general health checks.

**On-demand admin tooling:**
- `/admin/reconcile-ledger` web page — shows current drift, lets an admin run reconcile with a button (dry-run or live, with or without Stripe refresh).
- `php artisan ledger:reconcile` — same thing from CLI.
- `php artisan ledger:reconcile --dry-run` — preview without writing.

### 13.5 Your own reconciliation

In addition to the platform's jobs, run your own:

```python
# Daily reconciliation example
@daily_at("06:00")
async def reconcile_with_billings():
    for invoice in local_invoices_in_last_24h():
        remote = await fetch(f"/invoices/{invoice.billings_id}")
        if remote.status != invoice.status:
            log_mismatch(invoice, remote)
            update_local(invoice, remote)
```

---

## 14. Common errors

### "An error occurred. Please try again later."

Should now be rare (post recent fixes). Most actionable errors are surfaced verbatim. If you see this, it means a genuinely unexpected exception in production. Check server logs.

### "Your card's security code is incorrect."

The CVC entered doesn't match what the issuing bank has. User error. Ask them to retry, double-checking the 3-4 digit code on the back/front of the card.

### "Your card was declined."

Generic decline from the issuing bank. Could be insufficient funds, fraud flag, expired card, etc. Stripe sometimes provides a `decline_code` (e.g., `insufficient_funds`, `lost_card`) but often just `generic_decline`. Ask the user for a different card.

### "No such PaymentMethod: 'pm_xxx'"

Used to happen when widget Stripe key and server Stripe key were from different accounts. Fixed by per-user Stripe gateway resolution. If you see this now, it indicates a leftover misconfiguration — verify that your `GatewayCredential` (if you have one) has matching publishable + secret keys.

### "Customer not found or access denied"

The customer ID you passed doesn't belong to the user that owns the bearer token. Either:
- The publishable token was issued under a different user (most common — issue both `billing` and `billing_publishable` under the same user).
- You passed a customer ID from a different tenant by mistake.
- The customer was deleted.

### "Insufficient scope"

Your token doesn't have the required scope for the endpoint. Check the scope table in [§3.1](#31-billing--server-side-full-access-token) and re-issue with correct scopes.

### "The resource owner or authorization server denied the request."

Passport rejected the token. Causes:
- Token expired (1 year lifetime, or older 2-hour ones).
- Token revoked.
- Wrong token (e.g., `billing_admin` on a non-admin endpoint).

### "Missing Idempotency-Key"

You sent a POST/PUT/PATCH/DELETE without the header. See [§11.1](#111-idempotency).

### 422 Validation errors

Response body includes `errors` field with per-field messages:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "customer_id": ["The customer id field is required."],
    "items.0.unit_amount": ["The items.0.unit_amount must be at least 0."]
  }
}
```

### 502 / 503 — Stripe issues

`502` = Stripe returned an error to us (auth, generic API error).
`503` = couldn't reach Stripe at all.
`429` = rate limit (rare).

Retry with backoff.

---

## 15. Known issues and operator playbook

Issues that haven't been (or can't easily be) fully automated away. If you encounter these, here's the playbook.

### 15.1 Refund succeeded in Stripe but ledger debit not recorded

**Symptom:** customer was refunded by Stripe, you can see it in Stripe dashboard, but your local balance doesn't reflect the debit. Your `available` balance is overstated.

**Detection:** `Log::critical('Refund succeeded on Stripe but NO ledger debit recorded', ...)` will fire. `DailyFinancialAudit` will surface this in its daily report.

**Recovery:** operator needs to manually insert the missing `BalanceLedgerEntry` (debit) and create the local `Transaction` (refund). The Stripe refund ID is in the log.

**Prevention:** make sure your DB has spare capacity at peak — the race condition exists between Stripe's API call and the local DB transaction.

### 15.2 Orphan Stripe payment methods

**Symptom:** SetupWidget user enters a card, server returns an error before saving locally. The `pm_xxx` exists in Stripe but is not attached to any customer there or locally.

**Detection:** none automatic. You can query Stripe via dashboard or API for unattached `pm_` objects in your account.

**Recovery:** Stripe garbage collects unattached PMs after about 1 hour. No action needed unless you want to clean up sooner.

**Prevention:** the SetupWidget should re-run cleanly if the user submits again — they'll create a new `pm_`, the old one will be GC'd. Don't try to "recover" a partially-attached PM yourself; just start fresh.

### 15.3 Payout stuck in `processing` after webhook is missed

**Symptom:** payout was sent in Stripe, the `payout.paid` webhook never arrived, local Payout stays in `processing` forever. Funds appear unavailable locally even though they reached your bank.

**Detection:** local Payout records in `processing` status for more than 5 business days.

**Recovery:** operator manually marks the Payout as `completed` after verifying via Stripe dashboard. (Or re-deliver the webhook from Stripe dashboard.)

### 15.4 Webhook delivery permanently failed

**Symptom:** your endpoint was down for an extended period. Some deliveries exhausted retries and are marked `failed`.

**Recovery:** in billings admin UI → Webhooks → Deliveries, click "Replay". Or, ask the platform operator to do so. Alternatively, run a one-shot reconciliation against your local state by fetching all resources changed during the outage.

### 15.5 Endpoint marked `failing` and not receiving deliveries

**Symptom:** after 10 cumulative failed deliveries, your endpoint's `status` is set to `failing` and the dispatcher skips it.

**Recovery:** fix your endpoint, then in billings admin UI flip the status back to `active`. Replay missed deliveries.

### 15.6 Currency conversion lookup race

**Symptom:** rare — a charge in non-base currency, charge.succeeded webhook arrives while a refund is being processed, ledger entry is mid-update. You may see a single ledger entry with mixed currency state for a few milliseconds.

**Recovery:** no action needed; the entry settles within microseconds. Reconciliation jobs catch any persistent inconsistency.

### 15.7 Disputed invoice not reverting after `won`

**Symptom:** dispute closes with `status='won'`, balance is credited back, but the invoice still shows `status='disputed'`.

**Detection:** `DailyFinancialAudit` flags this.

**Recovery:** the daily audit job auto-corrects (sets status back to `paid`). No manual action needed unless you need it sooner.

### 15.8 Console commands use platform Stripe credentials only (multi-tenant gap)

**Symptom:** if a client has their own `GatewayCredential` (a per-tenant Stripe account), scheduled jobs like `subscriptions:process-due` and `invoices:process-autopay` will still charge against the PLATFORM's Stripe account, not the client's. HTTP-context API calls correctly use per-user credentials; console commands do not.

**Why:** `PaymentService` resolves its Stripe gateway via the per-request DI binding `StripeGateway::forUser(Auth::id())`. In a console command there is no authenticated user, so `Auth::id()` is `null` and the gateway falls back to platform credentials. This was true before the recent gateway refactor too — it's a long-standing gap, not a new regression.

**Impact in practice:** most clients don't use per-tenant Stripe credentials (the platform's gateway is shared). For those clients there is no impact. If you DO configure your own `GatewayCredential`, ALL automated charges (autopay, subscription renewals) still hit the platform's Stripe account.

**Workaround if you have per-tenant creds:** for now, run autopay and subscription renewals through HTTP endpoints from your own scheduler instead of relying on the platform scheduler. Example: nightly cron on your side calls `POST /api/v1/invoices/{id}/process-autopay` per invoice that's due, with your `billing` token. The HTTP path correctly resolves your user's credentials.

**Fix on the platform side:** the operator can refactor `PaymentService` and `AutopayService` to accept an explicit `$userId` and call `Auth::setUser()` before each invoice. Tracked as a roadmap item.

### 15.9 5-minute idempotency cache expiration

**Symptom:** a network hang lasting >15 minutes; you retry with the same idempotency key but the cache has expired and the request is processed as new. Result: potential duplicate operation.

**Mitigation:**
- Stripe-side idempotency (24-hour window) catches duplicates at the payment processor.
- For non-Stripe operations (e.g., creating a Customer), duplicates are possible but caught by uniqueness constraints on `email`+`user_id`.
- Don't retry indefinitely — give up after 5 attempts and surface the error to the user.

---

## 16. End-to-end integration checklist

Follow these steps in order to set up a new client integration.

### Pre-integration

- [ ] Confirm you have a billings.systems account with a user provisioned for your tenant.
- [ ] Confirm Stripe is configured for your tenant — either platform-provided or your own `GatewayCredential` set up by the operator.
- [ ] Decide which environment (production / staging) you're integrating with. Base URL: `https://billings.systems`.

### Issue tokens (in billings admin UI)

- [ ] Create `billing` token under your user with the 13 scopes from [§3.1](#31-billing--server-side-full-access-token). Store it in your backend secrets.
- [ ] Create `billing_publishable` token under the same user with **empty scopes array**. Store it in your frontend config (server-rendered into pages).
- [ ] (Optional) Register webhook endpoint(s) via UI or `POST /api/v1/webhooks`. Save the `signing_secret` immediately — it's not retrievable later. Store as `billing_webhook` in your backend.

### Server integration

- [ ] Wire up the `billing` token to your billings.systems API client.
- [ ] Verify connectivity: `GET /api/v1/ping`. Should return `pong: true` with your user's email.
- [ ] Implement customer creation: `POST /customers` from your signup flow. Save the returned `id` keyed against your local user.
- [ ] Implement invoice creation: `POST /invoices` for ad-hoc billing.
- [ ] (If using subscriptions) Implement subscription creation: `POST /subscriptions`.
- [ ] Implement the webhook receiver: verify HMAC, dedupe by envelope ID, enqueue real work.
- [ ] Subscribe to events you care about. Minimum: `invoice.paid`, `payment.failed`, `refund.processed`, `subscription.cancelled`, `dispute.created`. Add more as needed.

### Frontend integration

- [ ] Server-render `billing_publishable` into your pages where widgets will mount.
- [ ] Add Stripe.js: `<script src="https://js.stripe.com/v3/"></script>` to widget-hosting pages.
- [ ] Embed SetupWidget on your "add a card" page.
- [ ] Embed PaymentWidget on your "pay invoice" page.
- [ ] Wire `onSuccess` callbacks to refresh your local state (or redirect to a confirmation page that re-fetches server-side).
- [ ] Wire `onError` callbacks to surface errors to users and report to your error tracking.
- [ ] Update your CSP to allow Stripe and billings.systems origins. See [§12.4](#124-csp-and-csrf-for-widget-pages).

### Testing

- [ ] Test card collection with valid test card (`4242 4242 4242 4242`, any CVC, any future expiry). Confirm `payment_method.attached` webhook arrives.
- [ ] Test payment with valid test card. Confirm `payment.succeeded` and `invoice.paid` webhooks arrive.
- [ ] Test declined card (`4000 0000 0000 0002`). Confirm error surfaces in widget UI and `payment.failed` webhook arrives.
- [ ] Test refund: `POST /transactions/refund` (partial and full). Confirm balance updates and `refund.processed` webhook arrives.
- [ ] Test subscription creation + autopay cycle. (Use Stripe's "Test Clock" to fast-forward.)
- [ ] Test dispute: use Stripe's [test chargeback flow](https://stripe.com/docs/disputes/testing). Confirm `dispute.created` webhook arrives.

### Production readiness

- [ ] Confirm production Stripe keys are configured.
- [ ] Confirm `billing_publishable` is the production token (not test).
- [ ] Confirm webhook endpoint is reachable from billings.systems (test from admin UI's "Send test event").
- [ ] Confirm CSP allows production origins.
- [ ] Set up monitoring:
  - Webhook handler error rate
  - Stripe API error rate (5xx responses from billings)
  - Local-vs-remote reconciliation drift
- [ ] Set up alerts on:
  - Critical logs from your webhook handler
  - Missing webhook deliveries (no events in N hours when activity is expected)
  - Failed payouts
  - Disputes opened

### Documentation for your team

- [ ] Document token rotation procedure (who, when, how).
- [ ] Document webhook secret rotation procedure.
- [ ] Document incident response: what to do when a customer reports a payment that doesn't show up locally, a duplicate charge, a missing refund, etc.

---

## 17. Testing

### Test cards (Stripe-provided)

| Card number | Behavior |
|---|---|
| `4242 4242 4242 4242` | Success (any CVC, any future expiry, any postal) |
| `4000 0000 0000 0002` | Generic decline |
| `4000 0000 0000 9995` | Insufficient funds |
| `4000 0000 0000 9987` | Lost card |
| `4000 0000 0000 0069` | Expired card |
| `4000 0027 6000 3184` | Requires 3DS authentication |
| `4100 0000 0000 0019` | Triggers a fraud dispute |

Full list: [stripe.com/docs/testing](https://stripe.com/docs/testing).

### Test mode vs live mode

The Stripe publishable key returned by `/widget/config` will be `pk_test_...` or `pk_live_...` depending on the active gateway credentials. The widget UI shows a small "test mode" indicator when applicable.

Don't ever ship `pk_test_...` to a real customer page in production. Verify before each release.

### Test webhooks

Use billings admin UI → Webhooks → Send Test Event. This sends a synthetic event matching the real event shape but with fake data, signed with your real signing secret. Your handler should verify and accept it just like a real event.

### Test the full charge flow

1. Create a test customer: `POST /customers` with a unique email.
2. Render the SetupWidget for that customer. Save a card with `4242 4242 4242 4242`.
3. Create an invoice: `POST /invoices`.
4. Render the PaymentWidget for that invoice. Pay.
5. Verify `payment.succeeded` and `invoice.paid` webhooks arrived.
6. Verify local DB state matches (invoice paid, transaction succeeded).
7. Issue a refund: `POST /transactions/refund`.
8. Verify `refund.processed` webhook arrived and ledger debit was recorded.

### Test environment isolation

If you're using staging and production, give them separate:
- `billing` and `billing_publishable` tokens (issued under separate users).
- `billing_webhook` signing secret.
- Webhook endpoints (point to different URLs).

Do NOT share tokens or secrets across environments. Doing so means a staging test charge could fire a webhook to production (and vice versa).

---

## 18. Multi-currency handling

Two currencies are at play in every charge:

- **Presentation currency** (`Invoice.currency`, `Transaction.currency`): what the customer was billed.
- **Settlement currency** (`Transaction.settled_currency`): the currency your Stripe account settles in (set in your Stripe account dashboard).

If they match, life is simple. If they differ — for example, a customer in Germany pays EUR but your Stripe account is in GBP — the charge is currency-converted at settlement and your balance ledger entries are recorded in the settled currency.

### 18.1 What the data looks like

After a successful charge:

```json
// Transaction
{
  "amount": 5000,
  "currency": "EUR",                       // ← what customer paid
  "settled_amount": 4250,
  "settled_currency": "GBP",               // ← what arrived in your account
  "exchange_rate": 0.85,
  "settled_fee": 130,                      // ← Stripe fee in settled currency
  "settled_net": 4120,                     // ← settled_amount - settled_fee
  "balance_transaction_id": "txn_xxx",
  "settlement_status": "settled"
}
```

The `BalanceLedgerEntry` for this charge will be recorded with `currency = 'GBP'` (the settlement currency), `credit = 4120` (settled_net minus platform fee).

### 18.2 Implications you must handle

1. **Display the customer-paid currency to the customer.** Always.
2. **Track both for accounting/reporting.** Your books will need to show what you billed (`amount`/`currency`) AND what landed in your balance (`settled_amount`/`settled_currency`).
3. **Refund math is in the settled currency.** A €100 charge that settled as £85 → refunding €50 reverses ~£42.50 from your balance (via the recorded `exchange_rate`). You cannot refund more than what's settled.
4. **Hold period is in the settled currency.** Funds become available in your settlement currency, after the hold period.
5. **Payouts are in the settled currency.** You request `{amount, currency: GBP}` from a GBP balance.
6. **Multi-balance accounts:** if your Stripe account holds multiple settlement currencies (e.g., you have USD AND GBP balances), the `/balance` endpoint returns per-currency entries. You'll request payouts per-currency.

### 18.3 Refund-before-settlement (the 422 you'll see)

If a refund is requested before settlement data has arrived (~1–5 seconds typical, occasionally minutes during Stripe peak load), the API returns:

```http
HTTP/1.1 422 Unprocessable Entity
{
  "success": false,
  "message": "Stripe fees have not settled yet. Please wait a moment and try again."
}
```

Handle this by retrying after 10–30 seconds. Don't return the error verbatim to your end user — display "Processing refund, this may take a moment" and retry server-side.

### 18.4 Insufficient settled balance

```http
HTTP/1.1 422
{
  "success": false,
  "message": "Insufficient balance to process this refund. Refund amount: GBP 14.79, Total balance: GBP 0.00."
}
```

This happens when:
- The charge was currency-converted and the settled amount is still within the hold period.
- Your settled balance is already drained (other refunds + payouts have taken it).

The fix is operational, not technical: wait for the hold period to elapse, or process the payout that's holding the funds.

In your customer-facing UI: be clear about this. "Your refund will be processed and reach your account within 5–10 business days." Don't promise immediate refunds for international customers.

### 18.5 Forex / FX gain or loss

If exchange rates fluctuate between charge and refund:
- Charge: €100 at rate 0.85 → settled as £85.
- A week later, rate is 0.83 → refund €100 needs ~£83.

You debited £85, but only £83 needs to leave the customer's bank. The £2 difference is forex gain. Stripe handles this in their balance transaction; your local ledger entries should reflect the actual debit amounts (which match what the customer receives in their original currency).

### 18.6 Supported currencies

`/widget/config` returns the list. Currently: `usd`, `eur`, `gbp`, `cad`, `aud`, `jpy`, `chf`, `sek`, `nok`, `dkk`. Adding a new one requires platform-side work — check with the operator if you need others.

### 18.7 JPY and zero-decimal currencies

JPY has no decimal. ¥1000 = `amount: 1000` (not `100000`). All other supported currencies use minor units (cents/pence/etc). Stripe's full list of [zero-decimal currencies](https://stripe.com/docs/currencies#zero-decimal) — match their convention.

---

## 19. Customer lifecycle and operational patterns

### 19.1 The Customer lifecycle

```
Sign up                  → POST /customers (save id keyed against your user)
Add payment method       → SetupWidget on a page → POST /widget/setup/attach
First charge             → POST /invoices + POST /invoices/{id}/pay
Subscribes               → POST /subscriptions (links to existing PM)
Adds/removes cards       → SetupWidget for new, DELETE /payment-methods/{id} for old
Sets new default         → POST /payment-methods/{id}/set-default
Pauses subscription      → POST /subscriptions/{id}/pause
Cancels                  → POST /subscriptions/{id}/cancel
Reactivates              → POST /subscriptions (new one — no resume after cancel)
Account deletion         → DELETE /customers/{id} (only if no active invoices/subs)
```

### 19.2 Linking your user to a billings.systems customer

When a user signs up on your side:

```python
billings_customer = billings_api.post("/customers", {
    "name": user.full_name,
    "email": user.email,
    "metadata": {
        "your_user_id": str(user.id),
        "signup_source": "web",
        "signed_up_at": user.created_at.isoformat(),
    },
})

user.billings_customer_id = billings_customer["data"]["id"]
user.save()
```

**Always save the billings customer id locally.** You'll use it for every subsequent call. Use the `metadata.your_user_id` field for reverse lookup in case you ever need to reconcile from billings → your DB.

### 19.3 Updating customer details

```python
billings_api.put(f"/customers/{user.billings_customer_id}", {
    "name": user.full_name,
    "email": user.email,
    "phone": user.phone,
    "address": user.address.to_dict(),
})
```

**Email is uniqueness-enforced within your tenant.** Two of your customers cannot share an email. If a customer changes their email to one that already exists in your tenant, you'll get 422.

### 19.4 Account merges

You probably have a workflow where users can merge accounts (e.g., they signed up twice). On billings.systems:

- There's no merge endpoint. You have to manually:
  1. Move PMs from old → new: detach from old (`DELETE /payment-methods/{id}`), have customer re-add to new via SetupWidget.
  2. Move active subscriptions: cancel on old, create equivalent on new.
  3. Leave historical invoices/transactions on the old customer (you can't move them without data loss).
- Update your local mapping to point to the new customer id.
- The old customer can be deleted only if it has no invoices.

In practice: **discourage merges.** Your support team should handle them rarely.

### 19.5 Account deletion / GDPR

```
DELETE /customers/{id}
```

Restrictions:
- Rejected (400) if the customer has any invoices, even paid/void ones.
- Stripe customer remains. Stripe handles its own retention separately.

For GDPR "right to erasure":
- If the customer has invoices, you can't hard-delete on billings.systems. You can:
  - Update their PII to anonymized values (`name: "Deleted User"`, `email: "deleted+{id}@example.com"`).
  - Detach all payment methods.
  - Cancel all subscriptions.
  - This leaves the financial history (which you're legally required to retain for tax purposes anyway) but no PII.
- Coordinate with the platform operator on Stripe-side data; some Stripe data is retained by their compliance policy regardless of your wishes.

### 19.6 Customer events you'll receive

```
customer.created    — every POST /customers
customer.updated    — every PUT /customers/{id}, plus updates from Stripe webhooks
customer.deleted    — every DELETE /customers/{id}
```

If a customer is mutated via the billings admin UI (operator-side), you'll also receive `customer.updated`. Use this to detect out-of-band changes.

### 19.7 Customer-side gotchas

- **Stripe customer mismatch on reset.** If your test database is wiped but the Stripe customer still exists, the next `POST /customers` will create a NEW Stripe customer for the same email. Your old PMs are orphaned in Stripe. Avoid by using disposable test emails per integration test run.
- **Hard-deleting customers in dev breaks ledger lookups.** If you delete a customer that's referenced by a transaction or ledger entry, those records dangle. Always void/cancel first.
- **Display name vs legal name.** `name` field is unconstrained. Whatever you write here ends up on receipts, invoice PDFs, and the customer's billing display. Use legal name for invoicing.

---

## 20. Subscription advanced topics

### 20.1 The full state machine

```
[creation]                                 [pause/resume]
  │                                              │
  ▼                                              ▼
active ─────── (next_billing_date) ──── invoice generated
  │                                       │
  │ pause                                 │ autopay or manual charge
  ▼                                       ▼
paused                                  succeeded/failed
  │                                       │
  │ resume                                ▼ (if failed)
  ▼                                     past_due
active                                    │
  │                                       │ retry (auto or manual)
  │ cancel                                ▼
  ▼                                     active OR cancelled
cancelled
```

### 20.2 Upgrades and downgrades

There's no built-in proration. To upgrade:

**Option A (simple): cancel + create new.**
```
POST /subscriptions/{old}/cancel
POST /subscriptions { ... new plan ... }
```
Pro: simple. Con: no proration; customer pays full new-plan price on next billing.

**Option B (mid-cycle change with proration handled in your app):**
1. Calculate proration on your side (days remaining × new_amount / interval_days - days remaining × old_amount / interval_days).
2. Create a one-off invoice for the difference: `POST /invoices`.
3. Charge it: `POST /invoices/{id}/pay-with-default`.
4. Update the subscription: `PUT /subscriptions/{old}` with new `amount`.

You handle the math; billings.systems just records charges and updates the subscription.

**Option C (delayed change):**
1. Mark internally that the subscription will change next cycle.
2. On `next_billing_date`, the auto-generated invoice uses the CURRENT `amount`. To override, you'd need to intercept before the autopay scheduler — easier to just call `PUT /subscriptions/{id}` shortly before `next_billing_date`.

Pick one approach and document it for your support team.

### 20.3 Dunning (failed payment recovery)

When autopay fails, the invoice goes to `past_due`. Your dunning strategy:

**Day 0:** Invoice generated, autopay fails. `payment.failed` event fires.
- Email the customer: "Your card was declined. Please update."
- Link to: SetupWidget for new card OR PortalWidget to manage cards.

**Day 3:** Auto-retry via `POST /invoices/{id}/process-autopay` (manually trigger if your scheduler doesn't auto-retry).
- If success: done.
- If still failing: second email, more urgent.

**Day 7:** Third retry.
- Last email: "Your subscription will be cancelled in 24 hours."

**Day 8:** Cancel the subscription.
```
POST /subscriptions/{id}/cancel
```

You implement the schedule; billings.systems provides the primitives. The autopay scheduler runs once a day by default; for more aggressive retries, hit `/invoices/{id}/process-autopay` from your own scheduler.

### 20.4 Trial conversion

```python
sub = billings_api.post("/subscriptions", {
    "customer_id": customer_id,
    "amount": 2900,
    "currency": "usd",
    "interval": "month",
    "trial_days": 14,
    "auto_bill": True,
    "payment_method_id": pm_id,   # ← required even during trial
})
```

During the trial:
- No charges are made.
- Subscription is `active` with `next_billing_date` = trial_end + 1.
- Optionally: prompt customer to verify their card works (small auth, not capture) — see [§20.6](#206-card-verification-without-charging).

At trial end:
- Scheduler picks up the subscription on `next_billing_date`.
- Autopay charges the saved PM.
- If success → `payment.succeeded` event.
- If failure → enters dunning.

**Trial-to-paid conversion rate** is one of the most important metrics for SaaS. Track:
- Trial-started count (subscription created with `trial_days > 0`)
- Trial-converted count (subscription that had a trial AND has at least one successful charge)
- Trial-cancelled count (subscription cancelled before first charge)

### 20.5 Cancellation at end of period vs immediate

The default `POST /subscriptions/{id}/cancel` is **immediate**: subscription `end_date = now()`, no further charges, customer loses access immediately. Existing invoices are unaffected.

For "cancel at end of period" (Stripe-style behavior):
- Don't call cancel.
- Instead: `PUT /subscriptions/{id}` setting `end_date` to the next billing date.
- After that date, the scheduler will stop generating new invoices.
- Optionally: also set `auto_bill = false` to prevent the last-cycle autopay.

There's no built-in flag for this — you manage it.

### 20.6 Card verification without charging

If you want to verify a card is alive without charging:
- Use Stripe's `SetupIntent` (which the SetupWidget already does).
- Optionally: charge $0.50, then immediately refund (anti-pattern, customers hate it).
- Better: trust the SetupIntent confirmation. Stripe pre-validates the card type, CVC, and expiry during attach.

If you need stronger fraud screening (large B2B subscriptions), use Stripe Radar rules (configured in Stripe dashboard) or do a $1 auth + reverse — this is one of the rare cases where you might want to bypass billings.systems and use Stripe directly.

### 20.7 Subscription state changes from Stripe dashboard

If someone cancels a Stripe-managed subscription in the Stripe dashboard, the `customer.subscription.deleted` webhook reaches billings.systems and updates the local Subscription. Your outbound `subscription.cancelled` event fires.

In general, **don't make state changes in the Stripe dashboard.** Always go through billings.systems API. The dashboard is a debug tool, not a production interface.

### 20.8 Pricing changes for existing subscribers

```
PUT /subscriptions/{id} { amount: 3900 }
```

This changes the recurring amount starting from the NEXT billing cycle. Existing invoices are unaffected.

If you want to grandfather existing subscribers at the old price:
- Don't blanket-update.
- For new subscribers, use the new amount.
- Optionally: send existing subscribers an email notifying them their next cycle will be the same; track this as a metric.

If you want to migrate everyone (e.g., 10% price increase):
- Notify subscribers 30 days in advance (legally required in some jurisdictions).
- Update subscriptions one by one (or batch-update).
- Send a "your new price takes effect on..." email.

### 20.9 Subscriptions and payment method changes

When a customer changes their default PM:
- Existing subscriptions still reference the OLD `payment_method_id` (unless explicitly updated).
- Autopay walks ALL saved PMs starting with default, so it'll find the new one anyway.
- But for clarity, update the subscription's `payment_method_id` when default changes:

```python
# After POST /payment-methods/{id}/set-default
for sub in customer_subscriptions(customer_id):
    if sub['auto_bill']:
        billings_api.put(f"/subscriptions/{sub['id']}", {
            "payment_method_id": new_default_pm_id,
        })
```

### 20.10 Generating off-cycle invoices

```
POST /subscriptions/{id}/generate-invoice
```

This creates an invoice for the next cycle immediately, regardless of `next_billing_date`. Useful for:
- Annual subscribers who want to pay quarterly: charge them quarterly even though `interval = year`.
- Catch-up billing if the scheduler missed a cycle (rare).

The new invoice has the subscription's amount; you'd have to override via update if it should be different.

---

## 21. Disputes operational playbook

A chargeback is the only thing that can take money you've already received back from you. Treat them seriously.

### 21.1 The dispute lifecycle

```
1. Customer's bank initiates chargeback
2. Stripe receives → `charge.dispute.created` webhook → billings receives
3. Billings creates local Dispute (status='needs_response' or 'warning_under_review')
4. Billings debits your balance ledger preemptively  (you lose the money NOW)
5. Outbound `dispute.created` event fires to your endpoints
6. Invoice marked status='disputed'
7. You have N days to submit evidence (typically 7–21, varies by card network)
8. Submit evidence in Stripe dashboard
9. Stripe sends evidence to issuing bank
10. Bank reviews, decides
11. Stripe sends `charge.dispute.closed` webhook → billings → outbound `dispute.closed`
12. If 'won': ledger credit reverses the debit, you get the money back
13. If 'lost': debit stands, plus Stripe charges you a chargeback fee (usually $15)
```

### 21.2 Reasons and likelihood of winning

| Reason | Typical win rate | Strategy |
|---|---|---|
| `fraudulent` | Low (5–15%) | Evidence: customer's IP matches their address, prior successful charges, AVS/CVV verification logs. |
| `product_not_received` | Medium (40–60%) | Tracking number, delivery confirmation, signature on file. |
| `product_unacceptable` | Medium (30–50%) | Communication with customer, refund policy, product spec match. |
| `subscription_canceled` | High if you have logs (70–90%) | Cancellation timestamps, terms acknowledgment, recent charge agreement. |
| `duplicate` | High (80–95%) | Refund the duplicate, attach refund proof to evidence. |
| `credit_not_processed` | Medium-high (60–80%) | Refund record + timestamp showing refund was issued. |

Don't bother contesting `fraudulent` chargebacks under $50. The chargeback fee + your time isn't worth it. Just accept the loss.

### 21.3 The dispute response workflow

1. **Receive `dispute.created` webhook.** Your handler:
   - Records the dispute in your own DB linked to the customer.
   - Notifies customer support / billing ops.
   - Pulls the relevant customer's account state.
2. **Investigate.**
   - What product was bought? When? At what price?
   - Was it delivered/granted? When? Proof?
   - Has the customer contacted support? About what?
   - Has the customer been refunded? If yes, this is a `credit_not_processed` case — submit the refund proof.
   - Has the customer cancelled? Show the cancellation timestamp vs. the disputed charge timestamp.
3. **Submit evidence in Stripe dashboard** (not via billings.systems — there's no API for this currently).
   - PDF: relevant communication, terms of service acknowledgment, delivery proof.
   - Plain text: explanation of the charge and why it's legitimate.
   - Customer's IP, browser, device fingerprint at time of purchase (if you have it).
4. **Wait.** Resolution typically 30–75 days.
5. **Receive `dispute.closed` webhook.**
   - `data.status == 'won'`: balance restored. Reverse any internal billing-state adjustments.
   - `data.status == 'lost'`: take the L. Update internal records.

### 21.4 Dispute economics

If your dispute rate exceeds ~0.7% of transaction volume, Stripe Radar and card networks may flag your account. Sustained rates over 1% can lead to:
- Higher processing fees.
- Required reserve (Stripe holds a % of your balance).
- Account termination (rare but possible).

If your dispute rate is climbing, investigate:
- Fraud (use Radar to block / require 3DS for high-risk).
- Customer confusion (clearer billing descriptors, better receipts).
- Subscription dunning (customers forgot they subscribed).
- Product quality issues.

### 21.5 What billings.systems can't do

- **Submit evidence:** Stripe dashboard only.
- **Issue dispute-specific reports:** export from Stripe.
- **Predict dispute likelihood:** use Stripe Radar.

What it CAN do:
- Track the dispute as a local record.
- Debit your balance preemptively (so you know your true available).
- Notify you in real-time via webhook.
- Restore balance on `won`.

### 21.6 Refund-vs-dispute

If a customer threatens a chargeback, ALWAYS prefer refunding. A refund:
- Costs you the refund fee (sometimes, depending on Stripe plan).
- No chargeback fee ($15).
- No dispute rate hit.
- Maintains customer relationship.

Even if you think you'd win the dispute, the math usually favors refunding.

---

## 22. Reconciliation strategy

The platform reconciles itself with Stripe. You should reconcile your own DB with billings.systems.

### 22.1 What to reconcile

| Resource | Your DB has | Billings has | Reconcile by |
|---|---|---|---|
| Customer | id, email, phone | id, email, phone, provider_ref | Email match + your `metadata.your_user_id` field |
| Invoice | id, customer, amount, status | same + ledger entries | `id` direct match; verify `status` and `amount_paid` |
| Transaction | id, status, amount | same + Stripe data | `id` direct match; verify status |
| Subscription | id, status | same + next_billing | `id` direct match; verify status + next_billing_date |
| Payment Method | id (optional, you might not store) | id + last4 + fingerprint | If you store, by id |

### 22.2 Reconciliation cadence

- **Real-time:** trust webhooks for most state changes.
- **Hourly:** spot-check recent activity. Pull all changes in the last hour, compare. Cheap.
- **Daily:** full reconciliation of yesterday's activity. Catch missed webhooks.
- **Weekly:** balance reconciliation. Sum local credits/debits, compare with `/balance` and `/ledger`.

### 22.3 The drift detection script

```python
def reconcile_invoices_last_24h():
    cutoff = datetime.now() - timedelta(hours=24)

    local_invoices = MyInvoice.query.filter(MyInvoice.updated_at >= cutoff).all()
    remote = billings_api.get("/invoices", params={
        "from_date": cutoff.isoformat(),
    })["data"]["data"]

    remote_by_id = {inv["id"]: inv for inv in remote}

    for local in local_invoices:
        remote_inv = remote_by_id.get(local.billings_id)
        if not remote_inv:
            alert(f"Invoice {local.id} not found on billings.systems")
            continue

        if local.status != remote_inv["status"]:
            log(f"Status drift: local={local.status} remote={remote_inv['status']} on {local.id}")
            local.status = remote_inv["status"]
            local.save()

        if local.amount_paid != remote_inv["amount_paid"]:
            log(f"Amount drift on {local.id}: local={local.amount_paid} remote={remote_inv['amount_paid']}")
            local.amount_paid = remote_inv["amount_paid"]
            local.save()

    # Inverse: invoices on billings not in your DB
    local_ids = {inv.billings_id for inv in local_invoices}
    for remote_id, remote_inv in remote_by_id.items():
        if remote_id not in local_ids:
            alert(f"Invoice {remote_id} on billings but missing locally — webhook miss?")
```

Run this daily. Schedule it via your cron / scheduled jobs.

### 22.4 Balance reconciliation

```python
def reconcile_balance():
    remote_balance = billings_api.get("/balance")["data"]

    # Pull local ledger if you maintain one
    local_credits = sum(your_charges_succeeded_last_period())
    local_debits = sum(your_refunds_succeeded_last_period() + your_payouts_completed())

    delta = (local_credits - local_debits) - remote_balance["total_credits"] + remote_balance["total_debits"]
    if abs(delta) > 100:  # tolerance for in-flight differences
        alert(f"Balance drift: {delta} cents")
```

This is the most important reconciliation — drift here means money is mis-tracked.

### 22.5 Auto-fix vs alert

Generally:
- **Auto-fix** status drifts (your local state catches up to billings).
- **Auto-fix** missing-locally invoices (pull from billings, insert).
- **Alert** missing-remotely (something in your DB doesn't exist on billings — investigate).
- **Alert** balance drift over tolerance.
- **Alert** any case where local has been paid but remote shows unpaid.

Auto-fix is safe in the direction "billings is source of truth, your DB catches up." Auto-fix in the opposite direction is dangerous.

### 22.6 The catch-up after downtime

If your webhook receiver was down for hours/days:
1. Query `GET /webhooks/{id}/deliveries?status=failed&from=...` to see what was missed.
2. Use billings admin UI to bulk-replay (or operator-side artisan command).
3. Run your daily reconciliation script to catch up.
4. Audit a small sample manually to make sure auto-fix didn't mess anything up.

---

## 23. Monitoring and alerting on your side

### 23.1 Metrics worth tracking

**Revenue health:**
- Charges per hour / day
- Charge success rate (`payment.succeeded` count / total payment events)
- Average charge value
- MRR (sum of active subscription `amount`s, normalized to monthly)
- Refund rate (refunds / charges)

**Operational health:**
- Webhook delivery latency (delivery `created_at` to your-handler-acked time)
- Webhook deduplication hit rate (duplicates received / total)
- Webhook handler error rate (5xx responses to billings)
- API call latency (your → billings round trip)
- API error rate (5xx from billings)
- Reconciliation drift count per run

**Customer health:**
- Failed payment count / day
- Disputes per day
- Dispute rate (disputes / charges)
- Subscription churn (cancellations / active count)
- Payment method update rate (after a failure, do customers update?)

### 23.2 Alert thresholds

| Metric | Warning | Critical |
|---|---|---|
| Charge success rate < | 95% | 90% |
| Webhook handler error rate > | 1% | 5% |
| Webhook delivery delay > | 60s | 5min |
| API 5xx rate > | 0.5% | 2% |
| Reconciliation drift > | 0 records | 10 records |
| Dispute rate > | 0.5% | 1% |
| Refund rate > | 5% | 20% (depends on business) |
| Balance drift > | $1 | $10 |

Adjust to your business — a high-volume marketplace might tolerate higher rates; a small SaaS shouldn't see ANY disputes most weeks.

### 23.3 Sentry / Datadog / NewRelic integration

```python
# Sentry context for each request
sentry_sdk.set_context("billings", {
    "customer_id": customer_id,
    "invoice_id": invoice_id,
    "request_id": request_id,
})

# Tag your webhook handler
@app.post("/webhooks/billings")
async def webhook(request):
    with sentry_sdk.start_transaction(op="webhook", name="billings.webhook"):
        # ...
```

Tag every billings-related operation. When something breaks, you'll want to drill into a specific customer's journey.

### 23.4 Dashboards to build

1. **Real-time payments dashboard:** last 60 min of charges, by amount and status.
2. **Daily revenue summary:** charges - refunds, by currency.
3. **Subscription cohort:** sign-ups by week vs. churn.
4. **Webhook health:** delivery latency, success rate, failure reasons.
5. **Failed payments:** list with retry status and customer email.
6. **Disputes open:** unresolved disputes with `due_by` countdown.

### 23.5 Dead-man's switch (the most important alert)

```
Alert if no successful charge in N hours.
```

For a healthy SaaS with regular sign-ups, no charges in 6 hours = something broken. Could be:
- Your sign-up flow is broken.
- Stripe is down.
- Your billings token expired/revoked.
- DNS / connectivity issue.

This single alert catches more outages than any other metric.

---

## 24. Disaster recovery playbook

### 24.1 Token compromise

Symptoms: API calls from unknown IPs, charges you didn't initiate, scope errors in logs.

**Response:**
1. Immediately revoke the compromised token in billings admin UI.
2. Issue a new token with the same scopes (or narrower if appropriate).
3. Update your config (env var, secrets manager).
4. Restart your app to pick up the new token.
5. Audit recent API calls in billings admin UI → API Logs.
6. If anything suspicious: refund unauthorized charges, contact customers, file Stripe report.
7. Forensic: how did the token leak? Was it in a public repo? Logs? Browser console? Fix the leak source.

**Time to mitigate:** under 10 minutes for the rotation. Forensic can take days.

### 24.2 Webhook receiver down

Symptoms: your error tracking shows handler crashes, billings.systems endpoint marked `failing`.

**Response:**
1. Identify root cause: deployment bug, infra issue, downstream service.
2. Fix and redeploy your receiver.
3. In billings admin UI → Webhooks → Replay failed deliveries.
4. Run your reconciliation script to catch up missed state.
5. Monitor for ~1 hour to ensure deliveries are succeeding again.
6. If endpoint was marked `failing`, change status to `active` in admin UI.

**Time to mitigate:** depends on the bug. Aim for < 1 hour. Beyond that, billings.systems will eventually stop retrying (after 5 attempts per delivery, ~2hr).

### 24.3 Database loss / restore

Worst case: your DB is gone. You need to rebuild from billings.systems.

**Response:**
1. Restore from backup if available (do you back up your DB? You should).
2. If backup is stale (e.g., 24 hours old):
   - Pull all customers from billings: `GET /customers` (paginated).
   - Re-link to your users by email + `metadata.your_user_id`.
   - Pull all invoices for the last N days: `GET /invoices`.
   - Pull all transactions: `GET /transactions`.
   - Pull all subscriptions: `GET /subscriptions`.
   - Insert / update in your DB.
3. Reconcile with the platform's daily audit job to find any orphans.

This is rare — most issues are partial losses, not total. The lesson: maintain your local DB as a cache of billings, not a source of truth, and you can always rebuild.

### 24.4 Stripe outage

Stripe has occasional outages (typically a few times per year, lasting minutes-to-hours).

**During an outage:**
- Card payments fail with 502/503 from billings.
- Existing balance is still queryable.
- Webhook delivery from Stripe → billings → you is delayed.

**What to do:**
- Show a "Payment service temporarily unavailable, please try again shortly" message to users.
- Queue new sign-ups locally if they require payment, retry when service is back.
- Don't auto-cancel subscriptions for failed autopay during a known outage — wait it out.

Check Stripe status: [status.stripe.com](https://status.stripe.com).

### 24.5 Billings.systems platform issue

Symptoms: timeouts, 503s, increased error rate that's not Stripe-related.

**Response:**
1. Check billings status page (if one exists; contact operator if not).
2. Reduce non-essential traffic — pause sync jobs, batch operations.
3. Critical flows (paying out an invoice for a hot customer) — retry with backoff.
4. Wait for resolution. Reconcile after.

### 24.6 Massive fraud incident

Symptoms: spike of dispute rate, multiple chargebacks from same IP / card pattern.

**Response:**
1. Block the bad actor in Stripe Radar.
2. Refund affected customers proactively (before they dispute).
3. Audit recent sign-ups for similar patterns.
4. Tighten Radar rules for the next 48 hours.
5. Report to Stripe if the pattern is sophisticated (they have a fraud team).

---

## 25. Customer support diagnosis runbook

When a customer reports an issue, your support team needs a script.

### 25.1 "I was double-charged"

1. Get the customer's email + the charge dates.
2. Look up in billings: `GET /customers?email=...` → get id.
3. `GET /transactions?customer_id={id}&from_date=...&to_date=...`.
4. Inspect:
   - Are there actually two `succeeded` charges for the same amount within the same day?
   - Same `provider_ref` (Stripe ID)? → It's the same charge, just displayed twice somehow — UI bug, not actual double-charge.
   - Different `provider_ref` → genuinely two separate charges. Investigate why.
5. If genuine double-charge:
   - Refund one: `POST /transactions/refund` with the duplicate txid.
   - Apologize, send email confirmation of refund.
   - Investigate root cause (retry without idempotency? two browser tabs?).

### 25.2 "My refund hasn't arrived"

1. Get refund txid or original charge txid.
2. `GET /transactions/{id}` — verify it has `type: refund` and `status: succeeded`.
3. If yes:
   - The refund left billings.systems within milliseconds.
   - Bank settlement typically 5–10 business days.
   - Tell customer: "Refunded on {date}, will reach your bank in 5–10 business days."
4. If no `succeeded` refund:
   - Either it was never issued (check your audit logs for who attempted what), OR
   - It was attempted but failed (likely `Insufficient balance` — see [§18.4](#184-insufficient-settled-balance)).
   - Retry from your operator dashboard or via API.

### 25.3 "My subscription wasn't renewed but my card is fine"

1. Get subscription id.
2. `GET /subscriptions/{id}` — check `status` and `next_billing_date`.
3. If `status: active` and `next_billing_date` is in the past → autopay scheduler didn't run. Check operator-side cron.
4. If `status: paused` → it was paused. Was it the customer? Your app? Logs.
5. If `status: past_due` → autopay tried but failed. Check `/transactions?invoice_id=...` for failure reason. Reach out to customer.
6. If `status: cancelled` → cancelled. Who? When? Logs.

### 25.4 "I never got my invoice"

1. Email delivery is operator-side. Check operator's email dashboard.
2. Common causes: customer's email server rejected (corporate Outlook quarantine), email in spam, customer mistyped email at signup.
3. Manual workaround: get the receipt URL from `/widget/receipt/{invoice}` and send it directly via your own communication channel.

### 25.5 "Webhook didn't fire for my event"

This one is for YOUR operator, not the customer:

1. Find the event in billings admin UI → Webhooks → Deliveries.
2. If status `delivered`: it was sent. Your receiver did or didn't process it; check your logs.
3. If status `pending` or `failed`: it didn't reach you. Why?
   - Your endpoint URL changed? (Update in billings UI.)
   - Your receiver was down? (Check your uptime.)
   - Endpoint marked `failing`? (Re-activate.)
4. Replay: click "Replay" in admin UI for that delivery.

### 25.6 "My card was charged but I don't have the product"

1. Verify the charge: get txid, confirm `succeeded` in billings.
2. Verify the invoice: confirm `paid`.
3. Investigate YOUR side: was the product/service granted? Probably a downstream bug in your provisioning flow.
4. If your provisioning failed: grant manually + email the customer + file a bug.
5. If product was granted but customer doesn't see it: account access issue on your side.

### 25.7 General diagnostic flow

For any "billing-related issue", the chain to walk:

1. **Customer says X happened.**
2. **Verify in billings:** does billings.systems record show X? If yes, billings is consistent.
3. **Verify in Stripe:** does Stripe dashboard show X? If yes, the flow worked through processing.
4. **Verify in your DB:** does your local state show X? If no, you have a sync issue (webhook miss / reconciliation gap).
5. **Verify customer-visible state:** does your UI show X? If no, you have a presentation bug.

Walk top-down; identify the first layer where the answer is "no" and fix there.

---

## 26. Migration patterns

### 26.1 From Stripe direct → billings.systems

You're currently using Stripe directly and want to move to billings as a middle layer.

**Step 1: Run both in parallel.**
- For new customers: create on billings.
- For existing customers: leave them on Stripe direct; gradually migrate.

**Step 2: Migrate customers in batches.**
```python
for stripe_customer in stripe.Customer.list(limit=100):
    # Create on billings, link Stripe customer
    billings_api.post("/customers", {
        "name": stripe_customer.name,
        "email": stripe_customer.email,
        "metadata": {
            "stripe_customer_id": stripe_customer.id,
            "migrated_from": "stripe_direct",
        },
    })
```

After creation, billings creates a NEW Stripe customer. To re-use the existing one, the operator can manually link them in admin UI, OR you can update `provider_ref` directly in DB (operator only). Talk to the platform operator before doing batch migrations.

**Step 3: Migrate payment methods.**
- Stripe payment methods cannot be transferred between Stripe customers via API.
- Easiest: prompt customers to re-add their card via SetupWidget. Email them: "We're updating our billing system, please verify your card."
- Alternative (if you want zero customer friction): operator-side script to copy PMs between Stripe customers (advanced; requires operator coordination).

**Step 4: Migrate subscriptions.**
- Cancel Stripe subscription.
- Create equivalent on billings.systems with matching `next_billing_date`.
- Email customers to confirm.

**Step 5: Cut over.**
- Stop creating new things on Stripe direct.
- Run reconciliation for 30 days.
- Eventually decommission your direct Stripe code.

### 26.2 From Chargebee / Recurly / other PSP

Similar pattern:
1. Export customers from source system.
2. Import via billings API (with `metadata` to track origin).
3. Prompt customers to re-add payment methods (no PSP-to-PSP card transfer for non-Stripe sources).
4. Recreate subscriptions on billings with carryover dates.
5. Run parallel for a billing cycle. Reconcile.
6. Decommission old system.

### 26.3 Within billings.systems: moving a customer to another tenant

Rare but happens (e.g., your platform splits into multiple sub-brands).

Currently: not supported via API. Operator-side migration.

### 26.4 Test → production cutover

You're done with staging, ready for live.

**Before cutover:**
- New `billing` token issued under production user.
- New `billing_publishable` token (zero scopes).
- New webhook endpoint registered, secret saved.
- Production environment variables set.
- Production CSP allows production billings URLs.
- Production Stripe keys configured (operator-side).

**At cutover:**
- Deploy your application with production env vars.
- Make a small real charge ($1 on a real card you control) — see [§13 of MANUAL_TESTING_CHECKLIST.md](MANUAL_TESTING_CHECKLIST.md).
- Refund it.
- Confirm webhook arrives at production receiver.
- Verify Stripe dashboard shows the live charge.

**After cutover (first 24h):**
- Watch error rates closely.
- Have rollback plan ready (revert deployment, switch traffic to staging).
- Monitor first ~10 customers' billing journeys end-to-end.

---

## 27. Token scope catalog

Detailed reference of every scope, what it permits, and when you actually need it.

### 27.1 Customer scopes

| Scope | Permits |
|---|---|
| `customers:create` | `POST /customers` |
| `customers:read` | `GET /customers`, `GET /customers/{id}`, `GET /customers/{id}/invoices`, `GET /customers/{id}/payment-methods` |
| `customers:update` | `PUT /customers/{id}` |
| `customers:delete` | `DELETE /customers/{id}` |

**When you need delete:** rare. Use cancel/anonymize patterns instead. Most production setups omit delete.

### 27.2 Invoice scopes

| Scope | Permits |
|---|---|
| `invoices:create` | `POST /invoices` |
| `invoices:read` | `GET /invoices`, `GET /invoices/{id}` |
| `invoices:update` | `PATCH /invoices/{id}`, `POST /invoices/{id}/finalize`, `POST /invoices/{id}/void`, `POST /invoices/{id}/enable-autopay`, `POST /invoices/{id}/disable-autopay` |

There's intentionally no `invoices:delete` — invoices are immutable for audit. Void instead.

### 27.3 Payment scopes

| Scope | Permits |
|---|---|
| `payments:create` | Charging cards: `POST /invoices/{id}/pay`, `POST /invoices/{id}/pay-with-default`, `POST /payment-intents/*`, `POST /customers/{id}/payment-methods`, `POST /transactions/refund` |
| `payments:read` | `GET /transactions`, `GET /payment-methods` |
| `payments:update` | `POST /payment-methods/{id}/set-default` |
| `payments:delete` | `DELETE /payment-methods/{id}` |

**Bundled with `payments:create`:** refund. There's no separate `payments:refund` — if a token can charge, it can also refund. Keep this scope server-side only.

### 27.4 Subscription scopes

| Scope | Permits |
|---|---|
| `subscriptions:create` | `POST /subscriptions`, `POST /subscriptions/{id}/generate-invoice` |
| `subscriptions:read` | `GET /subscriptions`, `GET /subscriptions/{id}`, `GET /subscriptions/{id}/invoices`, `GET /subscriptions/stats` |
| `subscriptions:update` | `PUT /subscriptions/{id}`, `POST /subscriptions/{id}/cancel`, `POST /subscriptions/{id}/pause`, `POST /subscriptions/{id}/resume` |

### 27.5 Payout & balance scopes

| Scope | Permits |
|---|---|
| `payouts:read` | `GET /balance`, `GET /ledger`, `GET /payouts`, `GET /payouts/{id}` |
| `payouts:create` | `POST /payouts` |

### 27.6 Dispute scopes

| Scope | Permits |
|---|---|
| `disputes:read` | `GET /disputes`, `GET /disputes/{id}` |

Read-only — disputes are created by Stripe, not by you.

### 27.7 Webhook scopes

Only needed if your backend programmatically manages webhook endpoints. Most setups don't.

| Scope | Permits |
|---|---|
| `webhooks:create` | `POST /webhooks`, `POST /webhooks/{id}/test` |
| `webhooks:read` | `GET /webhooks`, `GET /webhooks/{id}`, `GET /webhooks/{id}/deliveries` |
| `webhooks:update` | `PUT /webhooks/{id}`, `POST /webhooks/{id}/rotate-secret` |
| `webhooks:delete` | `DELETE /webhooks/{id}` |

### 27.8 Admin scopes

Platform super-admin only. Not for client integrations.

| Scope | Permits |
|---|---|
| `admin:invoices:read` | `GET /admin/invoices`, `GET /admin/invoices/{id}` |
| `admin:invoices:create` | `POST /admin/invoices`, `POST /admin/invoices/{id}/pay`, `POST /admin/invoices/{id}/pay-with-default` |
| `admin:invoices:update` | `PATCH /admin/invoices/{id}`, `POST /admin/invoices/{id}/finalize`, `POST /admin/invoices/{id}/confirm` |
| `admin:invoices:delete` | `POST /admin/invoices/{id}/void` |
| `admin:clients:read` | `GET /admin/clients`, `GET /admin/clients/{id}/customers` |

### 27.10 Common scope combinations

**Minimum server token for a SaaS subscription product:**
```
customers:create customers:read customers:update
payments:create payments:read
invoices:read
subscriptions:create subscriptions:read subscriptions:update
payouts:read disputes:read
```

**Minimum for one-off product sales (no subscriptions):**
```
customers:create customers:read customers:update
payments:create payments:read payments:update
invoices:create invoices:read invoices:update
payouts:read disputes:read
```

**Minimum for read-only reporting:**
```
customers:read invoices:read payments:read subscriptions:read
payouts:read disputes:read
```

**Maximum (everything except deletes and admin):** the standard `billing` token we recommend.

### 27.11 Anti-patterns

- **Granting publishable widget tokens any scope.** Defeats the zero-scope safety. Browser-exposed tokens with scopes can be used to enumerate or mutate data if leaked.
- **One mega-token for all microservices.** Each service should have its own token with the narrowest necessary scopes. If one service is compromised, the blast radius is limited.
- **Reusing tokens across environments.** Production tokens in staging or vice versa. Always issue fresh per environment.
- **Long-lived admin tokens in CI.** CI gets compromised. Use short-lived tokens or rotate frequently.

---

## 28. Advanced widget topics

### 28.1 Content Security Policy (CSP)

Minimum policy to load any widget:

```
Content-Security-Policy: default-src 'self';
  script-src 'self' https://js.stripe.com https://billings.systems 'unsafe-inline';
  connect-src 'self' https://billings.systems https://api.stripe.com https://r.stripe.com;
  frame-src https://js.stripe.com https://hooks.stripe.com https://m.stripe.com;
  img-src 'self' https: data:;
  style-src 'self' 'unsafe-inline';
  font-src 'self' https://fonts.gstatic.com;
```

Notes:
- `'unsafe-inline'` in `script-src` is required for widget initialization scripts inline in HTML. If you can avoid inline scripts, drop it (better security).
- `'unsafe-inline'` in `style-src` is needed because widgets inject inline styles. There's no way around this short of disabling widget styling.
- `connect-src` for `r.stripe.com` is for Stripe's Radar / telemetry.
- `frame-src` for `m.stripe.com` is for 3DS modals.

### 28.2 Mobile-specific behavior

- **iOS Safari:** Apple Pay button appears automatically if (a) device supports Apple Pay, (b) at least one card is in Wallet, (c) Stripe domain verification is set up, (d) your `apple_pay` gateway flag is enabled.
- **Chrome Android:** Google Pay button appears with similar conditions.
- **Mobile keyboards:** widgets use `inputmode="numeric"` for card fields. Verify this fires the numeric keyboard on iOS / Android.
- **Viewport:** ensure `<meta name="viewport" content="width=device-width, initial-scale=1">` is in your page head, or widgets may render too small on phones.
- **Touch targets:** all interactive widget elements are sized to meet WCAG 2.5.5 (44×44 CSS pixels minimum). If you override CSS, maintain this.

### 28.3 Custom styling — full options

```javascript
SetupWidget({
  config: {
    customerId: '...',
    apiKey: '...',
    logoImage: 'https://...',
    theme: 'modern',                  // 'modern' | 'minimal' | 'gradient' | 'dark'
    borderRadius: 'medium',           // 'none' | 'small' | 'medium' | 'large' | 'xl' | 'full'
    showLogo: true,
    title: 'Save Payment Method',
    subtitle: 'For future automatic payments',
    buttonText: 'Save',
    securityText: 'Secured by Stripe',
    collectBillingDetails: true,
    allowedCountries: ['US', 'CA', 'GB'],   // restrict to specific countries

    colors: {
      primary: '#5B61F4',             // accent color (button, focus rings)
      background: '#0F172A',
      text: '#F8FAFC',
      textSecondary: '#94A3B8',
      cardBg: 'rgba(255,255,255,0.06)',
      cardBorder: '1px solid rgba(255,255,255,0.10)',
      error: '#EF4444',
      success: '#10B981',
    },

    typography: {
      fontFamily: '"Inter", sans-serif',
      titleSize: '22px',
      titleWeight: '700',
      subtitleSize: '14px',
      labelSize: '13px',
      labelWeight: '600',
      inputSize: '15px',
      buttonSize: '15px',
      buttonWeight: '600',
      logoSize: '14px',
      mobileTitleSize: '18px',
    },

    spacing: {
      padding: '32px',
      mobilePadding: '24px',
      sectionSpacing: '28px',
      fieldSpacing: '20px',
      inputPadding: '14px 16px',
      buttonPadding: '14px 24px',
      footerSpacing: '20px',
      maxWidth: '420px',
    },

    debug: false,
    onSuccess: (data) => { /* ... */ },
    onError: (err) => { /* ... */ },
    onValidationError: (errors) => { /* ... */ },
  },
  container: document.getElementById('widget-root'),
});
```

### 28.4 Embedding multiple widgets on one page

Two widgets on the same page (e.g., a SetupWidget + PortalWidget showing existing cards):

```html
<div id="setup"></div>
<div id="portal"></div>

<script>
  SetupWidget({
    config: { customerId, apiKey, container: document.getElementById('setup'), ... },
    container: document.getElementById('setup'),
  });

  PortalWidget({
    config: { customerId, apiKey, ... },
    container: document.getElementById('portal'),
  });
</script>
```

Each widget independently fetches `/widget/config` (cached for 5 min by widget JS, so no duplicate hits). Stripe.js can only be initialized once per page (it's a global); the widget code handles this.

### 28.5 Server-side rendering frameworks (Next.js, Nuxt, Rails)

The widgets are client-side JS. In SSR frameworks:
- Render the container `<div>` server-side.
- Hydrate / mount the widget on the client after page load.
- Pass `apiKey` via initial props or a hidden DOM attribute — NOT via inline `<script>` (XSS surface).

Example (Next.js):

```jsx
'use client';
import { useEffect, useRef } from 'react';

export function SetupWidget({ customerId, apiKey }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!window.SetupWidget) {
      // Load the widget script dynamically
      const script = document.createElement('script');
      script.src = 'https://billings.systems/widgets/SetupWidget.js';
      script.onload = () => mount();
      document.head.appendChild(script);
    } else {
      mount();
    }

    function mount() {
      window.SetupWidget({
        config: {
          customerId, apiKey,
          logoImage: '/logo.png',
          onSuccess: (data) => { /* router.push('/dashboard') */ },
        },
        container: containerRef.current,
      });
    }
  }, [customerId, apiKey]);

  return <div ref={containerRef} />;
}
```

### 28.6 Widget configuration via attributes (no inline script)

If your CSP disallows `'unsafe-inline'`, you can wire widgets via `data-*` attributes:

```html
<div id="setup"
     data-billings-widget="setup"
     data-customer-id="..."
     data-api-key="..."
     data-logo-image="...">
</div>
<script src="https://billings.systems/widgets/SetupWidget.js"></script>
<script src="/your-widget-init.js"></script>
```

`your-widget-init.js`:

```javascript
document.querySelectorAll('[data-billings-widget]').forEach(el => {
  const widgetType = el.dataset.billingsWidget;
  const Widget = window[widgetType.charAt(0).toUpperCase() + widgetType.slice(1) + 'Widget'];
  Widget({
    config: {
      customerId: el.dataset.customerId,
      apiKey: el.dataset.apiKey,
      logoImage: el.dataset.logoImage,
      // ... read other data-* attributes
    },
    container: el,
  });
});
```

### 28.7 Loading widgets behind feature flags

To A/B test or gradually roll out:

```javascript
async function initBilling() {
  const flag = await featureFlag('use_new_billing_widget');
  if (flag) {
    // New widget
    SetupWidget({ ... });
  } else {
    // Old payment form
  }
}
```

The widget JS itself doesn't support feature flags; you control loading.

### 28.8 Localizing widgets

Currently the widgets ship with English text. To localize:

- Pass localized strings via config: `title`, `subtitle`, `buttonText`, `securityText`.
- For error messages (sanitized Stripe errors), wrap the `onError` callback and translate based on a pattern match.
- Stripe Elements' own UI (card field labels, validation messages) is auto-localized based on browser language (or `widgetConfig.locale` if you set one). Verify by switching your browser language.

A full i18n system is on the roadmap; for now, override strings client-side.

---

## 29. PCI compliance scope

### 29.1 What's in scope, what's not

**Out of scope (your code never sees cardholder data):**
- Card numbers, CVV, expiry dates — handled by Stripe Elements client-side.
- Card tokenization happens inside Stripe's iframe; your DOM never touches the data.
- Your servers only see Stripe `pm_xxx` IDs, never PANs.

**In scope (you handle these):**
- Your `billing` token (treat as a credential — env var, not logged).
- Your `billing_webhook` secret (treat as a credential).
- Customer PII you store (name, email, billing address) — covered by GDPR / PII rules, not PCI.

### 29.2 Your PCI level

If you handle <6 million card transactions/year AND you use Stripe Elements via the widgets, you qualify for **PCI DSS SAQ-A** — the minimum compliance level, ~22 questions, mostly process-oriented.

Higher transaction volumes still qualify for SAQ-A as long as you don't touch card data directly.

### 29.3 What you need to attest

1. **Cardholder data is never stored on your servers.** True for our integration.
2. **Cardholder data is never transmitted across your network.** True — it goes directly from the customer's browser to Stripe's servers via Stripe Elements.
3. **You use a PCI-compliant payment processor.** True — Stripe is Level 1 PCI DSS certified.
4. **You secure access to your environment.** Standard infosec: MFA, least privilege, audit logs.
5. **You have a written information security policy.** Most companies do; check yours.

Fill out SAQ-A annually. Submit to your acquiring bank (Stripe handles this if you're on a Stripe-managed acquirer).

### 29.4 Common gotchas

- **Logging request bodies.** Make sure you DON'T log raw widget setup/payment requests — they might contain `pm_xxx` IDs (not card data, but sensitive). Log endpoint + status + customer_id, not the body.
- **Storing `encrypted_payload`.** The PaymentMethod model has an `encrypted_payload` field that contains the Stripe PaymentMethod's full JSON. This is at-rest encrypted via Laravel's `encrypt()`. Treat as sensitive — don't dump unencrypted in logs.
- **Email receipts.** Receipts contain last4 and card brand. These are NOT cardholder data but are common-sense sensitive. Don't bcc receipts to public lists.
- **Customer support chat tools.** Make sure card data never enters your chat tools (Zendesk, Intercom). Train staff: if a customer pastes a card number into chat, REDACT it immediately and never store the conversation.

### 29.5 Apple Pay / Google Pay PCI implications

Apple Pay and Google Pay also bypass your servers — the token comes from Apple/Google to Stripe directly. Still SAQ-A.

### 29.6 Annual penetration testing

SAQ-A doesn't require a pen test, but if your platform handles enough volume that you're SAQ-D, you'd need it. Most billings.systems clients won't reach that scale alone (it's only your transaction count, not the platform's).

---

## 30. Performance and scaling

### 30.1 Rate limits

The API enforces `600/minute` per token globally (via `throttle:600,1` middleware), with stricter limits on specific endpoints:
- `/widget/config`: `60/minute`.
- `/widget/setup`: `setup-intent-customer` throttler (~5/min/customer).

You'll see `429 Too Many Requests` with a `Retry-After` header if you exceed.

### 30.2 Your scaling strategy

For a typical SaaS:
- Customer-facing actions hit billings synchronously: sign up, pay invoice, set up card. Latency matters for UX.
- Server-side batch operations (subscription renewals, reconciliation) hit asynchronously via your queue worker.

Avoid:
- N+1 calls in a loop. `for customer in customers: api.get(f"/customers/{customer.id}")` — bad. Use `GET /customers?per_page=100` instead.
- Synchronous webhook processing. ACK 200 fast, enqueue real work.
- Reconciliation during peak hours. Run it at 4 AM your time.

### 30.3 Caching

Cache these for the durations specified:
- `/widget/config`: 5 min (widget JS already does this).
- Customer details: 5 min cache, invalidated on `customer.updated` webhook.
- Invoice list for a customer: 1 min cache, invalidated on invoice events.

DON'T cache:
- Balance (always fresh — money matters).
- Transaction list (always fresh).
- Subscription status (state changes via webhook).

### 30.4 Pagination

```
GET /customers?per_page=100&page=2
```

Response includes `current_page`, `last_page`, `total`, `next_page_url`. Default `per_page` is 15; max varies (typically 100).

For batch processing, walk pages:

```python
page = 1
while True:
    resp = billings_api.get("/customers", params={"per_page": 100, "page": page})
    data = resp["data"]
    if not data["data"]:
        break
    process_batch(data["data"])
    if data["current_page"] >= data["last_page"]:
        break
    page += 1
```

### 30.5 Bulk operations

There's no `POST /customers/bulk` endpoint. For migrations or batch imports:
- Loop through your records.
- POST each one.
- Throttle to stay under 600/min (one per 100ms = 10/sec = 600/min — comfortable).
- Run during off-peak hours.

For very large batches (>10K), coordinate with the platform operator — they may want to pause certain background jobs while you ingest.

### 30.6 Latency expectations

Typical p50 latencies:
- `GET /ping`: 30–80ms.
- `POST /customers`: 200–500ms (includes Stripe customer creation).
- `POST /widget/setup/attach`: 800–1500ms (multiple Stripe API calls).
- `POST /invoices/{id}/pay`: 1000–3000ms (Stripe charge).
- `GET /balance`: 50–150ms.

If you see significantly higher, investigate:
- Network path (you → billings hosting region).
- Stripe API status (for endpoints that hit Stripe).
- Your own DB performance (if you're hitting your DB before/after the API call).

---

## 31. Frequently asked scenarios

### 31.1 "How do I let a customer pay without saving the card?"

Use PaymentWidget in direct mode (pass `amount` + `currency`, no `invoiceId`). The widget creates a one-time invoice and charges it. No PM is saved unless you explicitly call SetupWidget separately.

### 31.2 "How do I issue a partial refund and notify the customer?"

```
POST /transactions/refund { transaction_id, amount: 500 }
```

Wait for `refund.processed` webhook. In your handler, email the customer: "Refund of $5.00 issued. It will arrive within 5–10 business days."

You can also include the original receipt with the partial-refund note appended.

### 31.3 "How do I give a customer a free trial WITHOUT collecting a card?"

Don't create a subscription. Instead, grant access in YOUR app's permission system with an expiry date. At the end of the trial, prompt for a card and create the subscription then.

If your business model requires a card upfront, use `trial_days` on the subscription. The card is saved but not charged until trial ends.

### 31.4 "How do I bill multiple subscriptions on a single invoice?"

Not directly supported. Each subscription generates its own invoice on its `next_billing_date`. To combine:

1. Sync billing dates by setting `next_billing_date` on all subs to the same day.
2. Each will still generate a separate invoice. Combine on your side in displays.
3. Or: generate one consolidated invoice via `POST /invoices` with multiple line items, and cancel the auto-generated invoices for that cycle.

### 31.5 "How do I let a customer pause their subscription for a vacation?"

```
POST /subscriptions/{id}/pause
```

When they return:
```
POST /subscriptions/{id}/resume
```

`next_billing_date` is recalculated on resume. No partial-period charges.

### 31.6 "Can I let customers update their card from a link in an email?"

Yes. Email a magic link to a page hosting the SetupWidget, with the customer_id pre-filled.

For security: the link should be single-use and time-limited (e.g., 24h JWT in URL). Don't put the publishable token in the URL — embed it in the page server-side.

### 31.7 "How do I charge a customer for usage at end of month?"

1. Track usage in your DB throughout the month.
2. At end of month, `POST /invoices` with line items for each unit of usage.
3. `POST /invoices/{id}/finalize`.
4. `POST /invoices/{id}/pay-with-default`.
5. Email the receipt.

For automatic monthly: schedule the above as a cron in your app. Don't try to model "metered" subscriptions on billings.systems — there's no native usage-based pricing yet.

### 31.8 "What if a customer's card expires?"

Stripe auto-updates cards for some issuers (the Account Updater service). For others, you'll receive `payment_method.automatically_updated` webhook — react by updating any subscriptions that reference the PM.

If the card truly expires with no update:
- Next autopay fails with `expired_card`.
- You receive `payment.failed`.
- Email the customer to update.

### 31.9 "Can I import historical invoices/transactions from another system?"

There's no public import endpoint. The recommended approach:
- Leave historical data in your old system (read-only).
- Run both in parallel: old system reads only, billings.systems handles all new activity.
- Reference historical data by ID in your app's UI when displaying customer history.

### 31.10 "How do I detect that a webhook handler is processing the same event twice?"

In your database, have a `processed_webhook_events` table with a UNIQUE constraint on `event_id`. Your handler:

```python
def handle_webhook(envelope):
    try:
        ProcessedEvent.create(event_id=envelope['id'])
    except IntegrityError:
        # Already processed — return 200 idempotently
        return 200
    # First time processing
    process_event(envelope)
    return 200
```

Alternative: Redis SETNX with TTL. Same idea.

### 31.11 "How do I test webhook signing without a real receiver?"

```python
import hmac, hashlib, time

secret = 'whsec_xxx_your_real_secret'
body = '{"id":"test","type":"test"}'
timestamp = int(time.time())
expected_sig = hmac.new(
    secret.encode(),
    f"{timestamp}.{body}".encode(),
    hashlib.sha256,
).hexdigest()

print(f"X-Billings-Signature: t={timestamp},v1={expected_sig}")
```

Send this header + raw body to your receiver and verify your verifier accepts it.

### 31.12 "How do I downgrade a subscription mid-cycle without refunding?"

Just update the subscription `amount`. The change takes effect on the next billing date. The current cycle is whatever was already paid. No refund, no proration — the customer gets the rest of the current cycle at the old (higher) price.

If they complain, you can manually refund the proration: calculate "(remaining days / cycle days) × (old - new)" and refund that.

### 31.13 "My customer says they were charged but no transaction exists locally — what?"

Walk the [§25.7 diagnosis flow](#257-general-diagnostic-flow). Likely scenarios:
- Webhook miss: the charge happened on billings, but you didn't receive the event. Run reconciliation.
- Your local sync logic has a bug.
- Customer is mistaken (different card, different vendor, looking at wrong statement).

### 31.14 "Can I have customers across multiple Stripe accounts?"

Each billings.systems tenant has ONE Stripe account (configurable via per-tenant `GatewayCredential`, or the platform default). If you need multiple Stripe accounts, you need multiple billings tenants — coordinate with the operator.

### 31.15 "Webhook delivery is slow — sometimes 10 seconds. Is that normal?"

Mostly. Webhook delivery is queued; the queue worker picks up jobs every 1–5 seconds typically. If you see delays > 60 seconds consistently, investigate:
- Queue worker capacity (jobs piling up).
- Network from billings → your URL (DNS, TLS handshake time).
- Your endpoint's response time (slow handlers slow the queue).

ACK 200 fast, then enqueue your real work.

---



| Operation | Endpoint | Token | Scope |
|---|---|---|---|
| Health check | `GET /api/v1/ping` | any | none |
| Create customer | `POST /api/v1/customers` | billing | `customers:create` |
| Create invoice | `POST /api/v1/invoices` | billing | `invoices:create` |
| Pay invoice with PM | `POST /api/v1/invoices/{id}/pay` | billing | `payments:create` |
| Pay invoice with default | `POST /api/v1/invoices/{id}/pay-with-default` | billing | `payments:create` |
| Refund | `POST /api/v1/transactions/refund` | billing | `payments:create` |
| Create subscription | `POST /api/v1/subscriptions` | billing | `subscriptions:create` |
| Cancel subscription | `POST /api/v1/subscriptions/{id}/cancel` | billing | `subscriptions:update` |
| List transactions | `GET /api/v1/transactions` | billing | `payments:read` |
| Get balance | `GET /api/v1/balance` | billing | `payouts:read` |
| Request payout | `POST /api/v1/payouts` | billing | `payouts:create` |
| Save card (widget) | `POST /api/v1/widget/setup/attach` | billing_publishable | none |
| Pay (widget) | `POST /api/v1/widget/payment/pay` | billing_publishable | none |
| Portal data (widget) | `GET /api/v1/widget/portal/{customer}` | billing_publishable | none |

| Event | Triggered by | Action you take |
|---|---|---|
| `payment.succeeded` | charge succeeds | mark order paid, send receipt email |
| `payment.failed` | charge fails | notify customer, offer retry |
| `invoice.paid` | full payment received | fulfill goods/services |
| `invoice.voided` | invoice cancelled | reverse anything you booked |
| `refund.processed` | refund issued | update accounting, notify customer |
| `payment_method.attached` | card saved | display saved card in UI |
| `payment_method.detached` | card removed | remove from UI |
| `subscription.created` | new sub started | activate access |
| `subscription.cancelled` | sub cancelled | schedule access removal at end_date |
| `dispute.created` | chargeback opened | review, submit evidence in Stripe, possibly contact customer |
| `dispute.closed` | chargeback resolved | update accounting based on won/lost |
| `payout.completed` | funds in bank | reconcile bank deposit |
| `payout.failed` | payout rejected | investigate cause, retry |

---

## Appendix A — environment variables you'll need

In your backend `.env`:

```bash
# billings.systems base URL
BILLINGS_BASE_URL=https://billings.systems

# Your server-side bearer token
BILLINGS_API_TOKEN=...

# Your webhook signing secret (HMAC verification)
BILLINGS_WEBHOOK_SECRET=whsec_...

# (Optional) admin token if you're a platform super-admin
# BILLINGS_ADMIN_TOKEN=...
```

In your frontend rendering context (Blade, ERB, JSX, etc.), server-side render:

```html
<script>
  window.BILLINGS_PUBLISHABLE_KEY = "{{ env('BILLINGS_PUBLISHABLE_KEY') }}";
</script>
```

Then in widget code:

```javascript
SetupWidget({
  config: {
    apiKey: window.BILLINGS_PUBLISHABLE_KEY,
    // ...
  },
});
```

## Appendix B — Versioning and changelog

This document corresponds to billings.systems API as of **May 2026**.

Changes in this revision (vs prior guide):

- Tokens now expire after 1 year instead of 2 hours.
- `fees:update` scope removed (clients cannot modify their own fee profile).
- `StripeGateway` now resolves per-user, respecting per-client Stripe credentials.
- Webhook idempotency tightened — in-progress duplicates rejected within 15-minute window.
- `BaseApiController` now surfaces Stripe-specific errors instead of generic 500.
- `InvoiceController::store` now scopes customer lookup (was vulnerable to cross-tenant invoice creation).
- `WebhookDispatcher` no longer delivers to endpoints in `failing` status.
- `SetupWidgetController` exceptions now use `abort()` for proper HTTP status codes.
- Customer records no longer get a misleading `is_playground` flag from API creation.

---

**End of document.** If something here is wrong or unclear, file an issue against this doc or message the platform team.
