# TrigGuard Key Discovery

External systems can fetch the public key(s) used to sign TrigGuard receipts from the same authority that issues them. That allows **key discovery** without trusting a separate channel: get the receipt, then get the keys from the same origin.

## Endpoint

**GET** `{base}/.well-known/trigguard/keys.json`

- **Base:** TrigGuard Cloud API root (e.g. `https://trigguard-cloud-386138887132.europe-west2.run.app` or `https://api.trigguardai.com`).
- **Authentication:** Same as the rest of the API (e.g. Bearer token when the service requires it).
- **Response:** JSON object with `protocol`, `authority`, and `keys[]`.

## Response format

```json
{
  "protocol": "trigguard/v1",
  "authority": "trigguard-cloud",
  "keys": [
    {
      "keyId": "trigguard-cloud-key-1",
      "algorithm": "Ed25519",
      "publicKeyPem": "-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----"
    }
  ]
}
```

- **protocol** — Protocol version (e.g. `trigguard/v1`).
- **authority** — Issuing authority (e.g. `trigguard-cloud`).
- **keys** — List of public keys. Each entry has `keyId` (matches `receipt.authorityKeyId`), `algorithm` (e.g. `Ed25519`), and `publicKeyPem` (full PEM string).

## When keys are not configured

If the server does not have a public key configured (`TRIGGUARD_PUBLIC_KEY_PEM` unset), the endpoint responds with **503** and a body such as:

```json
{
  "error": "keys_unavailable",
  "message": "Public key not configured (TRIGGUARD_PUBLIC_KEY_PEM)."
}
```

Verifiers can fall back to a static keys file (e.g. in the repo at `public/.well-known/trigguard/keys.json`) or retry later.

## How external verifiers use it

1. **Obtain a receipt** (e.g. from `/execute` response or a stored artifact).
2. **Resolve keys URL** — Same origin as the receipt’s authority, e.g. `https://{authority-host}/.well-known/trigguard/keys.json`.
3. **Fetch keys** — `GET` that URL (with auth if required).
4. **Find key** — In `keys`, find the entry where `keyId === receipt.authorityKeyId`.
5. **Verify** — Use `publicKeyPem` and [RECEIPT_VERIFICATION.md](RECEIPT_VERIFICATION.md) to verify `receipt.authoritySignature` over `receipt.receiptHash`.

## Caching

The endpoint sends `Cache-Control: public, max-age=300` so clients can cache the response for 5 minutes. Key rotation is expected to be rare; adjust `max-age` if needed.

## Configuration (TrigGuard Cloud)

Set the public key (PEM string) in the environment:

- **TRIGGUARD_PUBLIC_KEY_PEM** — Full PEM of the Ed25519 public key (same key pair as `TRIGGUARD_SIGNING_KEY`). Can be provided via Secret Manager and injected into Cloud Run like the signing key.

Example (after deploying with the key configured):

```bash
curl -H "Authorization: Bearer $TOKEN" \
  https://trigguard-cloud-386138887132.europe-west2.run.app/.well-known/trigguard/keys.json
```

## See also

- [RECEIPT_VERIFICATION.md](RECEIPT_VERIFICATION.md) — How to verify a receipt with a public key.
- [TRIGGUARD_RECEIPT_SCHEMA.md](TRIGGUARD_RECEIPT_SCHEMA.md) — Receipt fields, including `authorityKeyId`.
