# TrigGuard Execution Flow

**Version:** 1.0.0  
**Status:** Canonical — aligns with [TRIGGUARD_EXECUTION_PROTOCOL.md](TRIGGUARD_EXECUTION_PROTOCOL.md)  
**Audience:** Technical buyers, platform engineers, security engineers, implementers.

This document explains how execution requests flow through TrigGuard: request shape, evaluation, decisions, and when execution proceeds or is blocked.

---

## 1. Incoming request shape

Every execution request MUST be expressible as:

| Field     | Meaning |
|----------|---------|
| **surface** | Execution surface from the [Surface Registry](SURFACE_REGISTRY_V1.md). Identifies the class of irreversible operation (e.g. `deploy.release`, `payments.charge`). |
| **action**  | Logical action within that surface (e.g. `promote-to-production`, `charge`). |
| **context** | Key-value context for policy (e.g. `commit`, `branch`, `environment`, `actor`). Structure is surface-specific. |

Adapters (e.g. tool/args for LLM runtimes) map into this contract; see [ADAPTERS.md](ADAPTERS.md). The canonical evaluation layer sees **surface**, **action**, and **context** only.

---

## 2. How TrigGuard evaluates

- TrigGuard is the **single authoritative evaluation layer**. One logical gate: request in → evaluation → PERMIT | BLOCK | SILENCE (and receipt when applicable).
- Evaluation is **deterministic**: same inputs (surface, action, context, policy state) produce the same outcome. No randomness, no hidden heuristics.
- Conditions are evaluated against declared policy. If the system cannot evaluate deterministically (e.g. insufficient context, timeout, conflict), the outcome is **SILENCE** — no execution, no receipt.

---

## 3. Decision outcomes

| Decision | Meaning | Execution | Receipt |
|----------|---------|-----------|---------|
| **PERMIT** | Conditions satisfied; execution allowed. | **Allowed** — caller may proceed. | Issued (signed). |
| **BLOCK**  | Conditions not satisfied; execution prevented. | **Blocked** — downstream MUST NOT execute. | May be issued for audit. |
| **SILENCE**| Evaluation indeterminate; no decision. | **Blocked** — treated as blocked; no silent allow. | No receipt (fail-closed). |

- **PERMIT** — Execution allowed with a signed receipt. Caller may proceed; receipt binds the decision for audit and offline verification.
- **BLOCK** — Execution is prevented. Policy or constraints explicitly disallow the request.
- **SILENCE** — No execution, no receipt. System could not evaluate deterministically. Treated as blocked.

---

## 4. When a receipt is issued

- **PERMIT:** A signed receipt is issued. Downstream may execute; receipt is verifiable offline.
- **BLOCK:** A receipt may be issued for audit (same schema; `decision: BLOCK`).
- **SILENCE:** No receipt. Fail-closed: no execution, no artifact that could be misinterpreted as authorization.

---

## 5. Fail-closed in real terms

- **Execution is blocked unless conditions are explicitly satisfied.** Only a PERMIT outcome authorizes the caller to perform the irreversible action.
- BLOCK and SILENCE both mean: do not proceed. There are no silent fallbacks, default-allow paths, or approximations.
- If TrigGuard cannot verify a decision, execution is blocked. Nothing executes without an explicit PERMIT.

---

## 6. Same input → same output

- The same **surface**, **action**, and **context** (and policy state) MUST always yield the same decision. Implementations preserve this for replay and audit.
- No learned overrides, no probabilistic behavior in the decision path. The protocol is deterministic.

---

## 7. Why execution is blocked when conditions are not satisfied

- The system does not guess. Unmet or unknown conditions → BLOCK or SILENCE.
- Execution never proceeds on ambiguity. Authority is explicit: PERMIT or no execution.

---

## 8. Simple step list

1. Caller sends request (surface, action, context) to TrigGuard (e.g. POST /execute).
2. TrigGuard evaluates against policy deterministically.
3. Outcome is PERMIT, BLOCK, or SILENCE.
4. If PERMIT: signed receipt issued; caller may execute. If BLOCK or SILENCE: execution does not occur; receipt only if BLOCK (audit).
5. Downstream systems MUST treat anything other than PERMIT as execution blocked.

---

## 9. Technical flow (summary)

```
Request (surface, action, context)
  → TrigGuard authoritative evaluation layer
  → Deterministic evaluation
  → PERMIT | BLOCK | SILENCE
  → PERMIT: receipt issued, execution allowed
  → BLOCK: execution blocked; receipt may be issued for audit
  → SILENCE: execution blocked, no receipt
```

---

## 10. Developer-facing summary

- One API: POST /execute with surface, action, context.
- One outcome set: PERMIT, BLOCK, SILENCE.
- Execution only on PERMIT. BLOCK and SILENCE mean do not proceed.
- Receipts are signed (Ed25519) and verifiable offline when issued.

---

## 11. What happens on failure

| Situation | Outcome | Execution |
|-----------|---------|-----------|
| Policy disallows request | BLOCK | Blocked |
| Evaluation indeterminate (timeout, missing context, conflict) | SILENCE | Blocked |
| Unknown surface | Rejected (e.g. 400) | No evaluation |
| Network/server failure before decision | No receipt | Caller must not execute; fail-closed |

There are no silent fallbacks. If the system cannot produce a valid PERMIT, execution does not occur.

---

## References

| Document | Purpose |
|----------|---------|
| [TRIGGUARD_EXECUTION_PROTOCOL.md](TRIGGUARD_EXECUTION_PROTOCOL.md) | Canonical execution contract |
| [API_SCHEMA.md](API_SCHEMA.md) | External request/response shape |
| [SURFACE_REGISTRY_V1.md](SURFACE_REGISTRY_V1.md) | Valid surfaces |
| [ADAPTERS.md](ADAPTERS.md) | Tool/args and other shapes → surface/action/context |
