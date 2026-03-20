# TrigGuard Receipt Schema (Internal Canonical)

**Version:** 1.0.0  
**Status:** Internal canonical — do not rename these field names. Aligns with [TRIGGUARD_EXECUTION_PROTOCOL.md](TRIGGUARD_EXECUTION_PROTOCOL.md) v1.0.0.  
**Audience:** Implementers, verifiers, auditors.

Receipts are the primary artifact of the TrigGuard protocol: they bind a decision to an execution request and (when signed) can be verified offline. This document defines the **internal canonical** field names. External API responses may use different names (e.g. `receipt_id`, `key_id`, `signature`); see mapping below and [API_SCHEMA.md](API_SCHEMA.md).

## External → Internal mapping

| External (API / developer-facing) | Internal (canonical)     |
|-----------------------------------|--------------------------|
| `receipt_id`                      | `executionId`            |
| `key_id`                          | `authorityKeyId`         |
| `signature`                       | `authoritySignature`     |

Internal fields `executionId`, `authorityKeyId`, `receiptHash`, `authoritySignature` MUST NOT be renamed. APIs and SDKs may expose external names; verification and persistence use the canonical names.

## Core fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `executionId` | string | Yes | Unique execution identifier (e.g. `exec_<hash>`). |
| `protocolVersion` | string | Yes | Protocol version (e.g. `trigguard/v1`). |
| `authorityId` | string | Yes | Issuing authority (e.g. `trigguard-cloud`). |
| `surface` | string | Yes | Execution surface (e.g. `deploy.release`). |
| `actorId` | string | No | Actor identifier. |
| `decision` | string | Yes | `PERMIT`, `BLOCK`, or `SILENCE`. |
| `timestamp` | string | Yes | ISO 8601 time of the decision. |
| `receiptHash` | string | Yes | SHA-256 (hex) of canonical receipt fields; signed payload. |
| `authoritySignature` | string | Yes | Base64 Ed25519 signature over `receiptHash`, or `"unsigned"`. |
| `authorityKeyId` | string | No | Key ID used to sign (for verification). |

## Optional: executionContextHash

| Field | Type | Description |
|-------|------|-------------|
| `executionContextHash` | string | SHA-256 (hex) of the **execution context** (repository, commit, workflow, environment, artifact). Binds the receipt to the environment that requested it so the receipt cannot be replayed in another context. |

When present, `executionContextHash` is included in the canonical input used to compute `receiptHash`, so it is part of the signed payload. Clients may send a `context` object in the request; the server hashes it and sets `executionContextHash` on the receipt. If `context` is omitted, the receipt has no `executionContextHash` (backward compatible).

**Example request with context (e.g. CI):**

```json
{
  "surface": "deploy.release",
  "actorId": "github-actions",
  "context": {
    "repository": "org/repo",
    "commit": "abc123",
    "workflow": "deploy-prod",
    "environment": "production",
    "artifact": "sha256:3f9a..."
  }
}
```

## Optional: subjectDigest

| Field | Type | Description |
|-------|------|-------------|
| `subjectDigest` | string | Digest identifying the **object the decision applies to**. Binds the receipt to a real-world artifact. |

When present, `subjectDigest` is included in the canonical input used to compute `receiptHash`, so it is part of the signed payload.

### Examples by surface

| Surface | subjectDigest example | Meaning |
|---------|------------------------|---------|
| `deploy.release` | Git commit SHA | Receipt applies to this commit. |
| `payment.execute` | Transaction ID or hash | Receipt applies to this transaction. |
| `data.export` | Dataset or export job hash | Receipt applies to this export. |
| `account.delete` | Account ID or hash | Receipt applies to this account. |
| `access.grant` | User ID or role grant ID | Receipt applies to this grant. |

### Request

Clients may send `subjectDigest` in the `/execute` body or envelope:

```json
{
  "surface": "deploy.release",
  "actorId": "github-actions:owner/repo",
  "subjectDigest": "a84c13b9f4f2..."
}
```

If omitted, the receipt is still valid; the field is simply absent. Backward compatibility is preserved.

## Verification

See [RECEIPT_VERIFICATION.md](RECEIPT_VERIFICATION.md) for how to verify a receipt using `receiptHash`, `authoritySignature`, and `authorityKeyId` with the published public key.

## Canonical protocol

This schema aligns with [TRIGGUARD_EXECUTION_PROTOCOL.md](TRIGGUARD_EXECUTION_PROTOCOL.md). Decision values are PERMIT, BLOCK, SILENCE only.
