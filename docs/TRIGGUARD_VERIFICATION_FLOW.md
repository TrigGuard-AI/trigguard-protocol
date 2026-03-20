# TrigGuard Verification Flow

**Version:** 1.0.0  
**Status:** Canonical — aligns with [TRIGGUARD_EXECUTION_PROTOCOL.md](TRIGGUARD_EXECUTION_PROTOCOL.md) and [TRIGGUARD_RECEIPT_SCHEMA.md](TRIGGUARD_RECEIPT_SCHEMA.md)  
**Audience:** Security engineers, auditors, platform engineers, implementers.

This document explains how receipts are verified: key discovery, signature verification, and what is externally visible vs internally canonical.

---

## 1. How receipts are verified

Receipts produced by TrigGuard (or any TrigGuard-compatible authority) are cryptographically signed so that any party can verify them **without contacting the TrigGuard server** after issuance.

1. **Obtain the receipt** — JSON from the `/execute` response or a stored artifact.
2. **Obtain the keys file** — From the well-known endpoint (see Key discovery below) or a trusted static copy.
3. **Locate the key** — Find the entry where `keyId === receipt.authorityKeyId` (internal: `authorityKeyId`; external API may expose as `key_id`).
4. **Verify the signature** — Using the public key (PEM), verify that `authoritySignature` (base64-decoded) is a valid Ed25519 signature over the signed payload (see Layered schema below).
5. **Confirm authority** — Optionally ensure `authorityId` and the keys file `authority` match the authority you trust.

Unsigned receipts (`authoritySignature === "unsigned"`) cannot be cryptographically verified; they are audit-only.

---

## 2. Key discovery (well-known endpoint)

- **Endpoint:** `GET {base}/.well-known/trigguard/keys.json`
- **Base:** The authority’s API root (e.g. TrigGuard Cloud).
- **Response:** JSON with `protocol`, `authority`, and `keys[]`. Each key has `keyId`, `algorithm` (e.g. Ed25519), and `publicKeyPem`.

See [KEY_DISCOVERY.md](KEY_DISCOVERY.md) for full format and behavior. Verifiers may cache keys; no callback to TrigGuard is required at verification time.

---

## 3. Signature verification flow

```
Receipt (JSON)
  → Extract authorityKeyId, authoritySignature, signed payload (receiptHash or canonical payload)
  → Fetch or load keys from well-known endpoint
  → Select public key by keyId
  → Verify Ed25519(signature, payload) with public key
  → Valid: receipt is authentic and unaltered
  → Invalid: reject receipt
```

- **Signed payload:** The canonical representation used to compute `receiptHash` (hex SHA-256 of canonical receipt fields). The internal schema defines exactly which fields and order; see [TRIGGUARD_RECEIPT_SCHEMA.md](TRIGGUARD_RECEIPT_SCHEMA.md).
- **Signature:** Stored in `authoritySignature` (internal) or `signature` (external API); base64-encoded Ed25519.

---

## 4. Externally visible vs internally canonical

| Aspect | Externally visible (API / docs) | Internally canonical |
|--------|--------------------------------|----------------------|
| Receipt ID | `receipt_id` | `executionId` |
| Key ID | `key_id` | `authorityKeyId` |
| Signature | `signature` | `authoritySignature` |
| Payload for verification | Same logical payload | `receiptHash` (hex SHA-256 of canonical fields) |

- **External:** What developers and APIs see (e.g. `receipt_id`, `key_id`, `signature`). Used in responses and docs.
- **Internal:** Canonical field names and structure used by verification and persistence. MUST NOT be renamed; see [TRIGGUARD_RECEIPT_SCHEMA.md](TRIGGUARD_RECEIPT_SCHEMA.md).

Verification logic uses the canonical payload (e.g. `receiptHash`) and canonical field names when resolving keys and checking the signature.

---

## 5. How auditors or downstream systems confirm a receipt

1. **Obtain receipt** — From API response, log, or artifact store.
2. **Map external → internal** if needed — e.g. `receipt_id` → `executionId`, `key_id` → `authorityKeyId`, `signature` → `authoritySignature`.
3. **Fetch keys** — GET `/.well-known/trigguard/keys.json` from the authority (or use cached copy).
4. **Verify signature** — Ed25519 over the signed payload with the key identified by `authorityKeyId`.
5. **Validate fields** — Ensure `decision`, `surface`, `timestamp`, and other required fields are present and consistent. Optionally check `executionContextHash` or `subjectDigest` if bound to context or subject.

Result: **Verified** (receipt is authentic and integrity intact) or **Invalid** (reject).

---

## 6. Why verification is offline-capable

- Verification uses only: the receipt JSON, the public key (from well-known or cache), and the verification algorithm (Ed25519 over the defined payload).
- No call back to TrigGuard is required. Auditors and downstream systems can verify receipts without network access to the authority, reducing dependency and enabling air-gapped or batch verification.

---

## 7. Fields verified and what they mean

| Field (internal) | Meaning for verification |
|------------------|---------------------------|
| `receiptHash` | The data that was signed (hex). Integrity of canonical receipt fields. |
| `authoritySignature` | Ed25519 signature (base64). Proves the authority issued this receipt and payload. |
| `authorityKeyId` | Selects which key in the keys file to use. |
| `authorityId` | Issuing authority; can be matched to keys file `authority`. |
| `decision` | PERMIT, BLOCK, or SILENCE. Confirms what was authorized (or blocked). |
| `surface`, `timestamp` | Part of canonical payload; integrity protected by signature. |

Optional bindings (when present) are part of the signed payload and tie the receipt to a specific context or subject (e.g. `executionContextHash`, `subjectDigest`).

---

## 8. Layered schema (explicit)

### External API receipt fields (developer-facing)

- `receipt_id`, `decision`, `signature`, `key_id`, `timestamp` (and any optional fields the API exposes).
- See [API_SCHEMA.md](API_SCHEMA.md).

### Internal canonical receipt fields (verification and persistence)

- `executionId`, `authorityKeyId`, `authoritySignature`, `receiptHash`, `decision`, `surface`, `timestamp`, `protocolVersion`, `authorityId`, plus optional `executionContextHash`, `subjectDigest`.
- See [TRIGGUARD_RECEIPT_SCHEMA.md](TRIGGUARD_RECEIPT_SCHEMA.md).

### Mapping between them

| External (API) | Internal (canonical) |
|----------------|----------------------|
| `receipt_id` | `executionId` |
| `key_id` | `authorityKeyId` |
| `signature` | `authoritySignature` |

Verification implementations resolve external names to internal names when loading receipts from API responses, then verify using the canonical payload and `authoritySignature`.

---

## References

| Document | Purpose |
|----------|---------|
| [TRIGGUARD_RECEIPT_SCHEMA.md](TRIGGUARD_RECEIPT_SCHEMA.md) | Internal canonical receipt fields and signed payload |
| [RECEIPT_VERIFICATION.md](RECEIPT_VERIFICATION.md) | Step-by-step verification and CLI |
| [API_SCHEMA.md](API_SCHEMA.md) | External request/response shape |
| [KEY_DISCOVERY.md](KEY_DISCOVERY.md) | Well-known endpoint and keys format |
