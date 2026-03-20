# Execution Receipt Protocol

**Status:** Target architecture  
**Purpose:** Turn TrigGuard from a gateway product into protocol-level infrastructure by making receipts portable cryptographic proofs.  
**Audience:** Architecture, product, investors, regulators.

---

## Current state

Today, execution receipts are **internal logs**: the gateway records executionId, tenantId, surface, and decision for audit and replay. External systems must **trust the TrigGuard server** to answer "did this execution happen?" and "what was the decision?"

## Target state: Execution Receipt Protocol

Every execution produces an **ExecutionReceipt** that is:

- **Portable** — any system can hold and forward it.
- **Verifiable** — verifiers can check signature and binding **without calling TrigGuard**.
- **Signed** — by the gateway key so forgery is detectable.

### Receipt contents (portable format)

| Field           | Description                                      |
|----------------|--------------------------------------------------|
| `executionId`  | Canonical execution identity                     |
| `requestHash`  | Binding to request payload                       |
| `decision`     | PERMIT / BLOCK / SILENCE                         |
| `surface`      | Execution surface                                |
| `policyVersion`| Policy version at decision time                  |
| `timestamp`    | Issued-at time (ISO 8601)                        |
| `issuer`       | Issuer identifier (e.g. gateway instance / org)  |
| `publicKeyId`  | Key id for verification (which public key to use)|
| `actorId`      | *(Optional)* Identifies the system or actor that initiated the irreversible action. Improves auditability, traceability, and compliance evidence. |
| `prevReceiptHash` | *(Optional)* Hash of the previous receipt in a chain. Enables verifiable execution histories. |
| `signature`    | ed25519 signature over the above (base64)         |

**actorId** is optional to maintain backward compatibility with existing receipts. When present, it answers "who triggered the action?" for regulators and auditors. Example values: `github-actions:org/repo`, `ci:jenkins:payments-service`, `service-account:deploy-bot`.

**prevReceiptHash** is optional. When present, it references the hash of a previous receipt, allowing systems to build verifiable chains of irreversible actions (e.g. build → scan → deploy). Verification tools can validate entire chains by verifying each receipt in sequence. Existing receipts without this field remain valid.

### Example receipt schema

```json
{
  "executionId": "...",
  "surface": "deploy.release",
  "decision": "PERMIT",
  "actorId": "github-actions:org/repo",
  "policySnapshotRef": "...",
  "prevReceiptHash": "...",
  "requestHash": "...",
  "timestamp": "...",
  "signature": "..."
}
```

### Receipt chains

Receipts may optionally reference a previous receipt via **prevReceiptHash** (the hash of the prior receipt). This allows:

- **Execution histories** — Reconstruct ordered sequences of irreversible actions (e.g. build → security scan → deploy.release).
- **Stronger auditability** — Auditors can verify that a given action (e.g. deploy) occurred only after a prior action (e.g. scan) produced a valid receipt.
- **Provenance** — Chains provide execution provenance without changing the engine; integrations choose whether to populate the field.

Verification tools can validate an entire chain by verifying each receipt's signature and checking that each `prevReceiptHash` matches the hash of the previous receipt. The field is **optional**; receipts without it remain valid and backward compatible.

**Content-Type:** `application/trigguard-receipt+json` — use when sending or storing receipts so external systems can identify the format.

### API surface

- **Create:** `createReceipt(claims)` → receipt object.
- **Sign:** `signReceipt(receipt, gatewayPrivateKey)` → receipt with signature.
- **Verify:** `verifyReceipt(receipt, gatewayPublicKey)` → valid/invalid + reason.
- **Serialize:** `serializeReceipt(receipt)` → compact format (e.g. JSON or binary) for storage/transit.

### HTTP

- **POST /verify-receipt** — body: serialized receipt (or receipt object). Response: `{ valid: boolean, reason?: string }`. Enables **offline verification** when the verifier has the gateway public key.

### Why this is strategic

- **Before:** "Company trusts TrigGuard server."
- **After:** "Any system can verify TrigGuard decisions using the receipt and the public key."

That makes TrigGuard a **governance protocol**, not only a SaaS gateway. Downstream (e.g. payment processor, bank) can verify `receipt.signature`, `requestHash`, and `decision` before accepting a transaction, without depending on TrigGuard's availability.

### Implementation (done)

1. **Module:** `src/receipts/ExecutionReceiptProtocol.js`  
   - `createReceipt()`, `signReceipt()`, `verifyReceipt()`, `serializeReceipt()`, `deserializeReceipt()` — **ed25519** signatures.
2. **Endpoint:** **POST /verify-receipt** — body: `{ receipt }` (object or serialized string). Returns `{ valid: true }` or `{ valid: false, reason }`. Requires `TRIGGUARD_RECEIPT_PUBLIC_KEY` (PEM) in env or `options.receiptPublicKey` when creating the server.
3. **Key management:** Use `generateKeyPair()` from the module for gateway key pair; set `TRIGGUARD_RECEIPT_PUBLIC_KEY` (and keep private key for signing) so verifiers can verify without calling TrigGuard.
4. **Gateway integration (optional next):** After successful execution, call `createReceipt()` from claims, `signReceipt()` with gateway private key; attach signed receipt to response and/or ledger.

### External verification (offline)

Verifiers do **not** need to call TrigGuard. With the issuer's public key (or key identified by `publicKeyId`):

- **In code:** Use `packages/trigguard-receipt-verifier` (Node) or `packages/trigguard-receipt-verifier-python` (Python), or `src/receipts/ExecutionReceiptProtocol.js`.
- **Over HTTP:** POST the receipt to **POST /verify-receipt** to get `{ valid, reason }` when the server has the public key configured.

Receipts are portable: store or send as `application/trigguard-receipt+json`.

### References

- Core protocol: [TRIGGUARD_PROTOCOL_V1.md](TRIGGUARD_PROTOCOL_V1.md)
- Implementation: `src/receipts/ExecutionReceiptProtocol.js`
