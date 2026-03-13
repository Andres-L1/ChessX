# ChessX

Simple MVP for locking final deliverables behind a Stripe paywall.

## What you get
- Landing page + create form
- Client paywall page
- Stripe Checkout flow + webhook unlock
- Local file storage or external link delivery

## Setup
1. Install dependencies
```
npm install
```

2. Configure env
Copy `.env.example` to `.env` and set:
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `BASE_URL`

3. Run the server
```
npm run dev
```

Open `http://localhost:3000`.

## Stripe webhook
Use the Stripe CLI to forward webhooks:
```
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

## Notes
- Files are stored locally in `uploads/`. Replace this with S3 or similar for production.
- `db/locks.json` is a simple JSON store for the MVP.
