# Open Exchange — Go-Live Runbook

Everything needed to take the client billing account from the seeded demo to **real OpenAI +
Google usage and real billings.systems payments**. The app is built and tested; this is the
account/credential wiring only you can do.

## How it works (the model you chose)

- You hold the provider accounts. **One project per client** on each provider gives clean attribution.
- A scheduled job (`metering:pull`) pulls **usage per project** from OpenAI + Google, applies **your
  per-model markup**, debits the client's **prepaid balance**, and **auto-tops-up** their saved card
  via **billings.systems** when they cross their minimum.
- Clients see a **billing account**: balance, usage, labelled **sources** (their tokens), and invoices.
- Metering is **pull-based** (usage lags providers by minutes–hours). Size top-ups with headroom; a
  real-time gateway is the future upgrade.

---

## 1. OpenAI

1. In the OpenAI dashboard, create an **Organization → Admin key** (Settings → Admin keys). This is
   the only key that can read org usage/costs. Keep it server-side.
2. For **each client**, create a **Project**, then create that client's API key **inside their project**.
   (Attribution groups by `project_id`.)
3. Give the client their key to use in their app. In Open Exchange **Admin → Provider keys → Assign key**,
   set provider `openai`, the client, a label, the **project id**, and paste the key.
4. `.env`: `OPENAI_ADMIN_KEY=sk-admin-…`

## 2. Google / Gemini

1. Create a **GCP project per client** (or one project with per-client API keys — projects are cleaner).
2. Create a **service account** with role **Monitoring Viewer** (`roles/monitoring.viewer`); download its
   **JSON key**.
3. Confirm the token-count **metric names** your project emits (Monitoring → Metrics Explorer, filter
   service `generativelanguage.googleapis.com`). Set them if they differ from the defaults in
   `config/openexchange.php` / `.env`:
   - `GOOGLE_INPUT_TOKEN_METRIC`, `GOOGLE_OUTPUT_TOKEN_METRIC`, `GOOGLE_MODEL_LABEL`.
4. In **Admin → Provider keys → Assign key**, set provider `google`, the client, and the **GCP project id**.
5. `.env`: `GOOGLE_CREDENTIALS_JSON=/absolute/path/to/service-account.json` (a path **or** the raw JSON).

## 3. billings.systems (payments)

1. Register your platform on billings.systems and issue tokens (see `../CLIENT_INTEGRATION_MASTER.md`):
   - **`billing`** (server, ~13 scopes) → `BILLINGS_TOKEN`
   - **`billing_publishable`** (zero scopes, browser) → `BILLINGS_PUBLISHABLE`
   - **`billing_webhook`** (HMAC secret) → `BILLINGS_WEBHOOK_SECRET`
2. Register a webhook endpoint pointing at **`https://YOUR_DOMAIN/webhooks/billings`** for at least:
   `payment.succeeded`, `invoice.paid`, `payment.failed`, `charge.refunded`.
3. `.env`: `BILLINGS_BASE_URL`, `BILLINGS_TOKEN`, `BILLINGS_PUBLISHABLE`, `BILLINGS_WEBHOOK_SECRET`, `BILLINGS_CURRENCY=USD`.

**Card capture design:** the add-card screen auto-renders the **SetupWidget themed to Open Exchange**
(green/ink/Manrope) once `BILLINGS_PUBLISHABLE` is set — no code change. If you want *full* control of the
card fields, ask billings for a **headless / fields-only (raw Stripe Elements) mode**; it stays PCI **SAQ-A**
as long as Stripe.js tokenises the card. Until then, the themed widget gives close design control.

---

## 3b. Real-time gateway (recommended, especially for Gemini)

Clients call **Open Exchange** with an `oxk_…` key; OE calls the provider with *your*
backend credentials and meters **exact tokens** from each response — real-time, identical
for OpenAI, **Gemini (AI Studio)** and **Gemini (Vertex)**. This is the reliable path.

1. **Admin → Backends → Add backend** for each upstream:
   - **OpenAI:** provider `openai`, backend `openai`, paste your OpenAI key.
   - **Gemini via AI Studio:** provider `google`, backend `aistudio`, paste an AI Studio API key.
   - **Gemini via Vertex:** provider `google`, backend `vertex`, add GCP project + region + the service-account JSON.
2. Each client creates a key in **Sources → Create key** (shown once) and calls:
   ```bash
   curl https://YOUR_DOMAIN/v1/chat \
     -H "Authorization: Bearer oxk_live_…" \
     -H "Content-Type: application/json" \
     -d '{"model":"gemini-2.5-flash","messages":[{"role":"user","content":"Hello"}]}'
   ```
   Use `vertex/gemini-2.5-flash` to force Vertex; `GET /v1/models` lists models.
3. Each call → exact tokens → your rate card → **balance debit → auto-top-up**. Balance is enforced
   **before** the upstream call (over the debt limit → HTTP 402).

**Why the gateway for Gemini:** AI Studio doesn't expose reliable per-model token metrics to *pull*;
the gateway reads exact tokens from `usageMetadata`, so metering is accurate for both AI Studio and
Vertex with no metric guessing. (The provider-key *pull* path stays available for reconciliation.)

---

## 4. Configure & provision

```bash
cp .env.example .env            # if starting fresh
php artisan key:generate
php artisan migrate --seed      # tables + demo data (safe/idempotent)
```

Then in **Admin (admin@openexchange.ai / password)**:
- **Rate card** → set your default markup (and per-model overrides later).
- **Clients** → add each client; their owner logs in to the billing account.
- **Provider keys** → assign OpenAI + Google keys/projects to each client.

Clients then **Billing → Add card** (themed widget) and set their **minimum + top-up** amounts.

## 5. Schedule the meter

The pull is registered hourly in `bootstrap/app.php`. Run Laravel's scheduler on the server:

```
* * * * * cd /path/to/openexchange && php artisan schedule:run >> /dev/null 2>&1
```

Also run a **queue worker** and keep the app key + secrets in a secrets store. Manual run / dry-run:

```bash
php artisan metering:pull --client=1        # one client
php artisan metering:pull --no-topup        # meter only, no charges
```

## 6. Pre-launch checklist

- [ ] `OPENAI_ADMIN_KEY` set; one OpenAI **project per client**; keys assigned with project ids.
- [ ] `GOOGLE_CREDENTIALS_JSON` set; **Monitoring Viewer**; metric names confirmed; projects assigned.
- [ ] billings tokens set; **webhook registered** at `/webhooks/billings`; test event delivered.
- [ ] Ran `metering:pull` and saw usage on **Usage** + **Overview** for a real client.
- [ ] Dropped a test balance below minimum → **auto top-up charged the card** and credited the balance.
- [ ] Received the **branded emails** (failed / receipt / low balance) — set `MAIL_MAILER` (SMTP/Postmark).
- [ ] Scheduler + queue worker running; secrets in a vault; `APP_DEBUG=false` in production.

## 7. Verify with the test suite

```bash
php artisan test    # money path is proven with faked provider/billings HTTP
```

Green here means the pipeline (pull → meter → debit → auto-top-up → webhook), the guards
(idempotency, rate-limit, HMAC), and the emails all work; the steps above simply supply real credentials.
