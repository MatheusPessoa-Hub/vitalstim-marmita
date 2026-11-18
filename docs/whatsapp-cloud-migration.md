# WhatsApp Cloud API migration (VitalStim)

This integration is staged and does not switch production by itself.

## New webhook

Configure the Meta app callback URL as:

`https://vitalstim.vercel.app/api/public/meta/whatsapp/webhook`

Subscribe the WhatsApp webhook field `messages`. The endpoint supports Meta's GET challenge and verifies POST requests with `X-Hub-Signature-256` using the Meta App Secret.

## Vercel environment variables

Add these variables to the Production environment before switching:

- `WHATSAPP_PROVIDER=meta_cloud`
- `META_WHATSAPP_ACCESS_TOKEN` — a long-lived System User token with `whatsapp_business_messaging` and `whatsapp_business_management` as required by the account setup.
- `META_WHATSAPP_PHONE_NUMBER_ID` — the exact phone number ID for the VitalStim number.
- `META_APP_SECRET` — Meta app secret used to validate webhook signatures.
- `META_VERIFY_TOKEN` — a private random string chosen by the operator and entered unchanged in the Meta webhook setup.
- `META_GRAPH_API_VERSION` — a currently supported Graph API version, e.g. `v25.0`; verify the version offered in Meta for Developers before setting it.

Keep the existing Supabase and XPAG variables. Do not put credentials in GitHub or send them in chat.

## Safe migration sequence

1. Deploy this branch to a Vercel Preview deployment and configure Preview-only variables.
2. Verify Meta can complete the webhook challenge and that test messages reach the preview endpoint.
3. Test text, interactive replies, video, Pix copy-and-paste, QR image, payment confirmation and access delivery with a test recipient.
4. Confirm the Meta app and phone number are allowed to use this callback. If the number is currently provisioned through another provider, resolve coexistence/migration with Meta before changing its routing.
5. Only after all tests pass, merge/deploy to Production and switch the webhook. Keep the old Lovable endpoint and credentials available during rollback.

The current default provider remains `lovable` until `WHATSAPP_PROVIDER=meta_cloud` is explicitly set.
