# Execution Capability Protocol

TrigGuard authorizes irreversible digital actions via a **Execution Capability Envelope**. Any system that wants to request execution through TrigGuard must produce an envelope that conforms to this protocol. This document is the public protocol description.

---

## Envelope format

The envelope is a JSON object with the following fields.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| tenantId | string | Yes | Tenant scope. |
| surface | string | Yes | Execution surface (e.g. payments, deployments). |
| requestHash | string | Yes | 64-character hex; canonical hash of the request (binds token to payload). |
| nonce | string | Yes | Single-use value; replay protection. |
| commitToken | string | Yes | TrigGuard-issued signed token (capability). |
| issuedAt | number | Yes | Unix timestamp when the token was issued. |
| expiresAt | number | Yes | Unix timestamp when the token expires; must be > issuedAt. |
| executionContext | object | No | Optional parentExecutionId, executionTick for lineage/ordering. |
| policy | object | No | Optional policyBundleHash, policySnapshotRef. |

**executionContext** (if present):

- `parentExecutionId` (string, optional) — executionId of the execution that triggered this one.
- `executionTick` (number, optional) — logical step for ordering (root 0, child parent+1).

**policy** (if present):

- `policyBundleHash` (string, optional) — hash of the policy bundle that authorized the decision.
- `policySnapshotRef` (string, optional) — reference to the policy snapshot for replay (e.g. `snapshot://{hash}/{surface}/...`).

---

## Verification flow

1. **Structural validation** — All required fields present; requestHash is 64-char hex; nonce and commitToken non-empty; expiresAt > issuedAt; executionContext and policy are objects if present.
2. **Extract** — commitToken, surface, tenantId, requestHash, nonce, executionContext, policy.
3. **Core verification** — Call TrigGuard’s execution verifier with the token and a **request payload** (surface, signals, context) that matches the binding. The verifier checks:
   - Token signature
   - Token expiry
   - requestHash binding (computed from request payload must match token’s requestHash)
   - Surface and tenant
   - Nonce (replay store)

If all checks pass, the execution is authorized.

---

## How external systems integrate

1. **Obtain a commit token** — Call TrigGuard evaluate for the intended action; on PERMIT, receive a signed commit token and the requestHash (and optionally policyBundleHash, policySnapshotRef).
2. **Build the envelope** — Use the protocol schema: tenantId, surface, requestHash, nonce, commitToken, issuedAt, expiresAt; add executionContext and policy if needed.
3. **Send the envelope** — To your execution gateway, queue worker, or CLI. The consumer validates the envelope (structure then full verification with the same request payload used at evaluate time).
4. **Execute** — Only after verification succeeds; then create receipt and optionally checkpoint.

**Important:** The request payload (surface, signals, context) used at verification must be the one that was used to compute requestHash at evaluate time. The envelope carries requestHash for binding; the verifier recomputes the hash from the supplied request payload and compares.

---

## Implementation

- **Schema / validator:** `src/protocol/envelopeSchema.js`, `src/protocol/envelopeValidator.js` — `validateExecutionEnvelope(envelope)`.
- **Builder:** `src/protocol/executionEnvelope.js` — `createExecutionEnvelope({ tenantId, surface, requestHash, nonce, commitToken, ... })`.
- **Integration with verifier:** `src/protocol/verifyEnvelopeIntegration.js` — `verifyExecutionEnvelope(envelope, requestPayload, { secret, ... })`.
- **CLI:** `node src/tools/verifyEnvelope.js envelope.json [requestPayload.json]` — structural validation only with one arg; full verification with two args and `TRIGGUARD_SECRET`.

---

## Tests

- `tests/node/test_execution_envelope.js` — valid envelope passes; missing fields rejected; malformed requestHash rejected; expiresAt ≤ issuedAt rejected; valid envelope flows through verifier.

---

## Relation to queue envelopes

The Execution Capability Envelope is the **protocol** payload. Queue envelopes (e.g. for workers) carry this capability plus execution context (executionId, parentExecutionId, rootExecutionId, executionTick) and workflow context (stepName, checkpointHash). The protocol envelope is the minimal wire format; queue envelopes add workflow and lineage for async execution.
