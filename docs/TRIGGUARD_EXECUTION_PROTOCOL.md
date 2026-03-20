# TrigGuard Execution Protocol (Canonical)

**Version:** 1.0.0  
**Status:** Canonical — single source of truth  
**Audience:** Protocol implementers, API authors, auditors, SDK maintainers.

This document is the **only** canonical definition of the TrigGuard execution model. All other protocol documents, API schemas, and registry definitions MUST align to it.

---

## 1. Core execution contract

The foundation of the system is:

```json
{
  "surface": "string",
  "action": "string",
  "context": {}
}
```

- **surface** — Execution surface from the [Surface Registry](SURFACE_REGISTRY_V1.md). Identifies the class of irreversible operation (e.g. `deploy.release`, `infra.apply`).
- **action** — Logical action identifier within that surface (e.g. `promote-to-production`, `terraform-apply`).
- **context** — Key-value context for policy evaluation (e.g. `commit`, `branch`, `environment`, `actor`). Structure is surface-specific; see registry.

All execution requests MUST be expressible in this form. Adapters (e.g. tool/args for LLM runtimes) map into this contract; see [ADAPTERS.md](ADAPTERS.md).

---

## 2. Decision model

Every evaluation produces exactly one of three outcomes:

| Decision | Meaning | Execution | Receipt |
|----------|---------|-----------|---------|
| **PERMIT** | Conditions satisfied; execution allowed | Allowed (caller may proceed) | Issued (signed) |
| **BLOCK** | Conditions not satisfied; execution prevented | **Blocked** | May be issued for audit |
| **SILENCE** | Evaluation indeterminate; no decision | **Blocked** | No receipt (fail-closed) |

Definitions:

- **BLOCK** — Execution is prevented. Policy or constraints explicitly disallow the request. Downstream MUST NOT execute.
- **SILENCE** — No execution, no receipt. System could not evaluate deterministically (e.g. insufficient context, timeout, conflict). Treated as blocked; no silent allow.
- **PERMIT** — Execution allowed with a signed receipt. Caller may proceed; receipt binds the decision for audit and offline verification.

### 2.1 Receipt obligations (normative)

| Outcome | Receipt |
|---------|---------|
| **PERMIT** | **MUST** issue a signed receipt (verifiable outcome). |
| **BLOCK** | **MAY** issue a signed receipt for audit; if issued, it **MUST** conform to [TRIGGUARD_RECEIPT_SCHEMA.md](TRIGGUARD_RECEIPT_SCHEMA.md). |
| **SILENCE** | **MUST NOT** issue a receipt (fail-closed; no artifact that could be read as authorization). |

---

## 3. Execution rule

**Execution is blocked unless conditions are explicitly satisfied.**

- Only a **PERMIT** outcome authorizes the caller to perform the irreversible action.
- BLOCK and SILENCE both mean: do not proceed.
- There are no silent fallbacks, default-allow paths, or approximations.

---

## 4. Determinism rule

**The same inputs MUST always produce the same decision.**

- Identical `surface`, `action`, and `context` (and policy state) yield the same outcome.
- No randomness, no learned overrides, no hidden heuristics in the decision path.
- Implementations MUST preserve this guarantee for replay and audit.

---

## 5. Authority rule

**All execution decisions originate from a single authoritative evaluation layer.**

- One logical gate: request in → evaluation → PERMIT | BLOCK | SILENCE (and receipt when applicable).
- No competing decision sources; no bypass. Adapters and transports are not authority.

---

## 6. Protocol version

- **version:** `1.0.0`
- This version applies to the execution contract, decision model, and receipt semantics defined in this document and in [API_SCHEMA.md](API_SCHEMA.md) and [TRIGGUARD_RECEIPT_SCHEMA.md](TRIGGUARD_RECEIPT_SCHEMA.md).
- Backward compatibility: no field removal, no breaking change to the contract or decision vocabulary. Additive changes only, with governance.

---

## 7. References

| Document | Purpose |
|----------|---------|
| [API_SCHEMA.md](API_SCHEMA.md) | External (developer-facing) request/response shape |
| [TRIGGUARD_RECEIPT_SCHEMA.md](TRIGGUARD_RECEIPT_SCHEMA.md) | Internal canonical receipt fields and verification |
| [SURFACE_REGISTRY_V1.md](SURFACE_REGISTRY_V1.md) | Authoritative list of valid surfaces |
| [ADAPTERS.md](ADAPTERS.md) | Tool/args and other adapter shapes mapped to surface/action/context |
