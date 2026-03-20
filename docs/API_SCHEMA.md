# TrigGuard API Schema (External)

**Version:** 1.0.0  
**Status:** Developer-facing  
**Audience:** Integrators, SDK authors, API consumers.

This document defines the **external** request and response shapes that developers see when calling TrigGuard. It aligns with the canonical [TRIGGUARD_EXECUTION_PROTOCOL.md](TRIGGUARD_EXECUTION_PROTOCOL.md). Internal canonical field names (e.g. `executionId`, `authoritySignature`) are mapped in [TRIGGUARD_RECEIPT_SCHEMA.md](TRIGGUARD_RECEIPT_SCHEMA.md).

---

## Request: POST /execute

Minimum canonical shape (see protocol):

```json
{
  "surface": "string",
  "action": "string",
  "context": {}
}
```

- **surface** — From [SURFACE_REGISTRY_V1.md](SURFACE_REGISTRY_V1.md). Example: `deploy.release`, `infra.apply`.
- **action** — Action identifier. Example: `promote-to-production`.
- **context** — Key-value context for policy. Example: `{ "commit": "a1b2c3", "environment": "production" }`.

Additional fields (e.g. `idempotency_key`, `actor`, `nonce`) may be specified by the API; see implementation docs. Tool/args and other shapes are adapter layers; see [ADAPTERS.md](ADAPTERS.md).

---

## Response: decision and receipt

### Success (200)

```json
{
  "receipt_id": "string",
  "decision": "PERMIT" | "BLOCK" | "SILENCE",
  "signature": "string",
  "key_id": "string",
  "timestamp": "string"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `receipt_id` | string | Unique receipt identifier (e.g. `rcpt_...`, `tg_rcpt_...`). |
| `decision` | string | One of `PERMIT`, `BLOCK`, `SILENCE`. |
| `signature` | string | Ed25519 signature (e.g. `ed25519:base64...`). |
| `key_id` | string | Signing key identifier for verification. |
| `timestamp` | string | ISO 8601 UTC. |

Optional fields may include `expires_at`, `surface`, `context_hash`, `reason`, `policy_id` (especially for BLOCK). APIs may expose a subset; verification uses the canonical receipt schema.

### BLOCK (403)

Same receipt shape; `decision` is `BLOCK`. May include `reason`, `policy_id`, `message` for diagnostics.

### SILENCE

Evaluation indeterminate; no receipt. Response may indicate SILENCE without a full receipt; execution remains blocked.

---

## External → Internal mapping

When implementing or verifying receipts, map external API names to the internal canonical schema:

| External (API) | Internal (canonical) |
|----------------|----------------------|
| `receipt_id` | `executionId` |
| `key_id` | `authorityKeyId` |
| `signature` | `authoritySignature` |

The internal schema also defines `receiptHash` (signed payload); verification uses `authoritySignature` over the canonical payload. See [TRIGGUARD_RECEIPT_SCHEMA.md](TRIGGUARD_RECEIPT_SCHEMA.md).
