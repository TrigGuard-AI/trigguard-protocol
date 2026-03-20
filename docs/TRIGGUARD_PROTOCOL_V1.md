# TrigGuard Protocol v1

> **DEPRECATED** — Replaced by [TRIGGUARD_EXECUTION_PROTOCOL.md](TRIGGUARD_EXECUTION_PROTOCOL.md). This file is retained for historical reference only. All new implementations and documentation MUST use the canonical execution protocol.

**Version:** 1  
**Status:** Frozen — backwards compatible forever  
**Audience:** Investors, partners, integrators, auditors.

**Positioning:** TrigGuard is the **authorization kernel for AI agents**. **TrigGuard ensures AI systems cannot execute irreversible actions without explicit authorization.** In enterprise deployments, TrigGuard can mediate execution credentials so real-world APIs are never directly exposed to agent runtimes. Passthrough and credential mediation are optional and not the default.

---

## Rule

**Protocol V1 MUST remain backwards compatible forever.**

No field removal, no breaking change to envelope, decision, or receipt format. Additive changes only, with governance.

---

## 1. Execution envelope

Input to the execution gateway. Required for every execution request.

| Field        | Type   | Description |
|-------------|--------|-------------|
| `tenantId`  | string | Tenant or principal identifier. |
| `surface`   | string | Execution surface (from registry). |
| `payload`   | object | Request payload (surface-specific; normalized for hashing). |
| `nonce`     | string | Single-use value; required for replay protection. |
| `requestHash` | string | Canonical hash of normalized payload (binds receipt to request). |

Envelope also carries a signed commit token (proof of policy decision); the above are the canonical protocol fields.

### 1b. POST /execute request (API shape) — Native tool-call compatibility

Frameworks (LangChain, AutoGen, CrewAI) produce **tool** + **args**. TrigGuard accepts this structure directly; only **tool** and **args** are mandatory for the tool-call shape. No custom adapters required.

| Field        | Type    | Required | Description |
|-------------|---------|----------|-------------|
| `tool`      | string  | **Yes** (tool-call shape) | Capability name (e.g. `stripe.charge`, `send_email`). Same as frameworks. |
| `args`      | object  | **Yes** (tool-call shape) | Arguments for the tool. Same structure frameworks produce. |
| `intent_id` | string (uuid) | No | A unique identifier for the execution intent. When provided, TrigGuard treats the request as idempotent. Multiple requests with the same intent_id MUST return the same decision and receipt and MUST NOT trigger duplicate mediated executions. |
| `actor`     | string  | No | Identity of the executing actor (e.g. `agent.billing`, `support-agent`, `human-admin`). Enables policy by who is executing; future-proofs for multi-agent systems. |
| `context`   | object  | No | Context for policy (e.g. `user_id`, `environment`). Enables rules like: tool == stripe.charge and amount > 10000 and user_role != admin → BLOCK. |
| `target`    | string  | No | Destination endpoint when passthrough is enabled. |
| `passthrough` | boolean | No | If `true`, TrigGuard may execute downstream after PERMIT. **Default is `false`.** |

**Default behavior:** Agent → POST /execute → PERMIT | BLOCK | SILENCE → Caller decides whether to execute. **One-line integration:** `decision = trigguard.execute(tool, args)`; if PERMIT → run tool.

### Idempotent Intent Handling

TrigGuard supports idempotent execution intent handling through the optional `intent_id` field.

When a request includes an `intent_id`, TrigGuard MUST treat the request as idempotent.

If multiple requests are received with the same `intent_id`, TrigGuard MUST:

- return the original decision result  
- return the original execution_id (if present)  
- return the original receipt  

TrigGuard MUST NOT produce multiple mediated executions for the same `intent_id`.

The uniqueness scope of `intent_id` MUST be per client or per API key. This prevents two tenants from colliding on the same identifier.

This guarantees safe retries for distributed agent systems where execution requests may be repeated due to network failures, asynchronous orchestration, or retry logic.

Idempotent intent handling ensures that agent systems can safely retry execution requests without risking duplicate irreversible actions such as payments, deletions, or infrastructure changes.

---

## 2. Decision output

What the gateway returns on successful verification and execution.

| Field               | Type   | Description |
|--------------------|--------|-------------|
| `executionId`      | string | Canonical execution identity (derived from tenantId, surface, requestHash, nonce). |
| `decision`         | string | PERMIT / BLOCK / SILENCE |
| `decisionHash`     | string | Optional; hash of decision + binding for audit. |
| `policySnapshotRef`| string | Optional; reference to policy snapshot at decision time. |
| `policyBundleHash` | string | Optional; hash of policy bundle at decision time. |

---

## 3. Receipt

Portable, verifiable artifact. Signed by the issuer (ed25519).

| Field           | Type   | Description |
|----------------|--------|-------------|
| `executionId`  | string | Same as decision output. |
| `requestHash`  | string | Binding to request payload. |
| `surface`      | string | Execution surface. |
| `decision`     | string | PERMIT / BLOCK / SILENCE |
| `policyVersion`| string | Policy version at decision time. |
| `timestamp`    | string | Issued-at time (ISO 8601). |
| `signature`    | string | ed25519 signature over the above (base64). |

Optional for issuer identification: `issuer`, `publicKeyId`. Content-Type for wire format: `application/trigguard-receipt+json`. Every authorized or denied execution can produce a signed receipt that links intent, decision, and (when applicable) mediated execution context.

---

## 4. Verification

**verifyReceipt(receipt)**

- Input: receipt object (or serialized receipt).
- Output: `{ valid: true }` or `{ valid: false, reason: string }`.
- Verification is done with the issuer’s public key (no call to TrigGuard required).
- HTTP: **POST /verify-receipt** — body: receipt; response: same result.

---

## 5. Execution Modes

1. **Decision Mode (Default):** Agent → POST /execute → TrigGuard decision → PERMIT | BLOCK | SILENCE → Caller executes downstream action. Default and simplest.
2. **Wrapped Tool Mode:** Agent framework → TrigGuard-wrapped tool → automatic decision request → tool executes only if PERMIT. Enables LangChain, AutoGen, CrewAI integrations (e.g. `tools = [TrigGuard(StripeTool())]`).
3. **Credential Mediation (Enterprise / Advanced mode):** Agent → TrigGuard authority → mediated credentials → downstream API → signed receipt. Real provider keys stay behind TrigGuard; every mediated execution produces a receipt. Not the default. See §7.

---

## 6. Example request and response

**POST /execute** (minimal): `{ "tool": "stripe.charge", "args": { "amount": 2500, "currency": "usd" } }`  
With context: `{ "intent_id": "b0c8a2e1", "tool": "stripe.charge", "args": { ... }, "context": { "agent": "billing-agent", "user_id": "user_123", "environment": "production" } }`  
**Response (receipt mandatory):** `{ "decision": "PERMIT", "execution_id": "exec_123", "receipt": { "intent_id": "tx_9921", "decision": "PERMIT", "execution_id": "exec_123", "policy_version": "2026-03-16-1", "timestamp": "2026-03-16T19:40:10Z" } }`  
**Integration:** `decision = trigguard.execute(tool, args)` → if PERMIT → tool.run(args).

---

## 7. Credential Mediation (Enterprise Mode)

In enterprise deployments, downstream credentials may be held behind TrigGuard-managed execution boundaries. Agents authenticate with TrigGuard-scoped tokens; TrigGuard may authorize and execute approved calls using mediated credentials. Every mediated execution must produce a signed receipt. **Default mode** = Decision API only. **Advanced mode** = Credential mediation (enterprise; availability may be limited to private deployments or designated tiers).

---

## References

- Implementation: `src/receipts/ExecutionReceiptProtocol.js`
- Envelope verification: `src/protocol/verifyEnvelopeIntegration.js`
- Surface registry: `docs/protocol/SURFACE_REGISTRY_V1.md`
