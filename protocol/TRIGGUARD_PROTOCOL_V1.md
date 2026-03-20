# TrigGuard Protocol v1

> **DEPRECATED** — Replaced by [docs/protocol/TRIGGUARD_EXECUTION_PROTOCOL.md](../docs/protocol/TRIGGUARD_EXECUTION_PROTOCOL.md). This file is retained for historical reference only. All new implementations and documentation MUST use the canonical execution protocol.

**Version:** 1  
**Status:** Frozen — backwards compatible forever  
**Audience:** Investors, partners, integrators, auditors.

**Positioning:** TrigGuard is the **authorization kernel for AI agents** — deterministic authorization for AI-driven system actions. **TrigGuard ensures AI systems cannot execute irreversible actions without explicit authorization.** It provides an **authorization boundary between AI intent and real-world execution**. The core primitive is the **decision** (PERMIT, BLOCK, SILENCE). In enterprise deployments, TrigGuard can mediate execution credentials so real-world APIs are never directly exposed to agent runtimes. Passthrough and credential mediation are optional and not the default.

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

Agent frameworks (LangChain, AutoGen, CrewAI, custom runtimes) already produce a common structure: **tool** + **arguments**. TrigGuard accepts this structure directly so that integration requires no custom adapters — developers can pass through the same `tool` and `args` the framework already has.

**Minimum request (tool-call shape):** Only `tool` and `args` are required for this schema. All other fields are optional.

| Field        | Type    | Required | Description |
|-------------|---------|----------|-------------|
| `tool`      | string  | **Yes** (for tool-call shape) | Logical name of the capability being invoked (e.g. `stripe.charge`, `send_email`, `github.deploy`). Same as frameworks use. |
| `args`      | object  | **Yes** (for tool-call shape) | Structured arguments passed to the tool. Same structure frameworks already produce. |
| `intent_id` | string (uuid) | No | A unique identifier for the execution intent. When provided, TrigGuard treats the request as idempotent. Multiple requests with the same intent_id MUST return the same decision and receipt and MUST NOT trigger duplicate mediated executions. |
| `actor`     | string  | No | Identity of the executing actor (e.g. `agent.billing`, `support-agent`, `human-admin`, `nightly-job`). Enables policy rules keyed by who is executing: e.g. billing-agent may charge up to $10k; support-agent cannot charge. Future-proofs the protocol for multi-agent orchestration (LangChain, AutoGen, CrewAI). |
| `context`   | object  | No | Additional context for policy evaluation (e.g. `user_id`, `environment`). Enables rules such as: if tool == stripe.charge and amount > 10000 and user_role != admin → BLOCK. |
| `target`    | string  | No | Explicit destination endpoint when passthrough execution is enabled. |
| `passthrough` | boolean | No | If `true`, TrigGuard may execute the downstream request on behalf of the caller after a PERMIT decision. **Default is `false`.** |

**Final protocol shape (tool-call style):** `{ "intent_id": "uuid", "actor": "string", "tool": "string", "args": {}, "context": {}, "target": "optional", "passthrough": false }` — with only **tool** and **args** mandatory.

**Default behavior:** Agent → POST /execute → PERMIT | BLOCK | SILENCE → **Caller decides whether to execute.** TrigGuard does not execute downstream actions unless passthrough is explicitly enabled (enterprise/sovereign mode).

**One-line integration:** Developers can insert TrigGuard at the same boundary frameworks already use: `decision = trigguard.execute(tool, args)`; if PERMIT → run tool. No wrapper required; TrigGuard feels native to the framework.

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
| `actorId`      | string | *(Optional)* System or actor that initiated the action (e.g. `github-actions:org/repo`, `service-account:deploy-bot`). Improves auditability and compliance; omitted in older receipts. |
| `prevReceiptHash` | string | *(Optional)* Hash of the previous receipt in a chain. Enables verifiable execution histories; omitted in older receipts. |
| `signature`    | string | ed25519 signature over the above (base64). |

Optional for issuer identification: `issuer`, `publicKeyId`. Content-Type for wire format: `application/trigguard-receipt+json`. **Receipt chains:** When `prevReceiptHash` is present, the receipt is part of a chain; verifiers can validate ordered sequences of actions.

**Auditability:** Every authorized or denied execution can produce a signed receipt that links intent, decision, and (when applicable) mediated execution context. Receipts are the evidence layer for audit trails, incident analysis, compliance logs, and forensic reconstruction.

---

## 4. Verification

**verifyReceipt(receipt)**

- Input: receipt object (or serialized receipt).
- Output: `{ valid: true }` or `{ valid: false, reason: string }`.
- Verification is done with the issuer's public key (no call to TrigGuard required).
- HTTP: **POST /verify-receipt** — body: receipt; response: same result.

---

## 5. Execution Modes

TrigGuard supports three integration modes. The default is **Decision Mode**; proxy/passthrough is optional and framed as an advanced or enterprise capability.

### 5.1 Decision Mode (Default)

```
Agent
  ↓
POST /execute
  ↓
TrigGuard decision
  ↓
PERMIT | BLOCK | SILENCE
  ↓
Caller executes downstream action (or does not)
```

This is the default and simplest integration. TrigGuard returns a decision and signed receipt; the caller retains full control over whether and how to execute.

### 5.2 Wrapped Tool Mode

```
Agent framework
  ↓
TrigGuard-wrapped tool
  ↓
Automatic decision request
  ↓
Tool executes only if PERMIT
```

Enables easy integrations with frameworks such as LangChain, AutoGen, and CrewAI. Example: `tools = [TrigGuard(StripeTool())]`.

### 5.3 Credential Mediation (Enterprise / Advanced mode)

```
Agent
  ↓
TrigGuard authority
  ↓
Mediated credentials
  ↓
Downstream API / execution surface
  ↓
Signed receipt
```

Used when TrigGuard holds downstream credentials and executes actions after authorization. Agents authenticate to TrigGuard with TrigGuard-scoped access tokens; real provider keys stay behind the TrigGuard-managed execution boundary. Every mediated execution produces a signed receipt. Typically used for private deployments, regulated environments, and enterprise infrastructure control. **Not the default.** See §7 Credential Mediation (Enterprise Mode).

---

## 6. Example request and response

**POST /execute** (native tool-call schema; same structure LangChain, AutoGen, CrewAI produce):

```json
{
  "intent_id": "tx_9921",
  "actor": "agent.billing",
  "tool": "stripe.charge",
  "args": {
    "amount": 2500,
    "currency": "usd"
  },
  "context": {
    "user_id": "user_123",
    "environment": "production"
  }
}
```

Minimal (only tool + args required): `{ "tool": "stripe.charge", "args": { "amount": 2500, "currency": "usd" } }`

**Example decision response (receipt is mandatory for auditability):**

```json
{
  "decision": "PERMIT",
  "execution_id": "exec_123",
  "receipt": {
    "intent_id": "tx_9921",
    "decision": "PERMIT",
    "execution_id": "exec_123",
    "policy_version": "2026-03-16-1",
    "timestamp": "2026-03-16T19:40:10Z"
  }
}
```

**Integration pattern:** `decision = trigguard.execute(tool, args)` → if decision == "PERMIT" → tool.run(args). Intent → decision → execution becomes traceable when `intent_id` is supplied.

---

## 7. Credential Mediation (Enterprise Mode)

In enterprise deployments, downstream credentials may be held behind TrigGuard-managed execution boundaries. This mode is **optional** and **not the default**.

- **Agents and wrappers** authenticate to TrigGuard using TrigGuard-scoped access tokens, not raw downstream provider keys.
- **TrigGuard** may authorize and execute approved calls using mediated credentials; real-world APIs are not directly exposed to agent runtimes.
- **Every mediated execution** must produce a signed receipt that links intent, decision, and execution context.

**Default mode** = Decision API only (POST /execute → PERMIT | BLOCK | SILENCE → caller executes). **Advanced mode** = Delegated execution / credential mediation (enterprise; availability may be limited to private deployments or designated tiers).

---

## References

- Implementation: `src/receipts/ExecutionReceiptProtocol.js`
- Surface registry: [SURFACE_REGISTRY_V1.md](SURFACE_REGISTRY_V1.md)
- Receipt protocol: [EXECUTION_RECEIPT_PROTOCOL.md](EXECUTION_RECEIPT_PROTOCOL.md)
