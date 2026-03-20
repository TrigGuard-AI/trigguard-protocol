# TrigGuard Authority Model

**Version:** 1.0.0  
**Status:** Canonical — infrastructure doctrine  
**Audience:** Technical buyers, security engineers, platform engineers, design/brand collaborators.

This document states who has authority in the TrigGuard system: a single evaluation layer, a defined surface registry, adapters that translate but do not decide, and verification that confirms what was authorized. Execution never proceeds on ambiguity.

---

## 1. Single authoritative evaluation layer

**All execution decisions originate from a single authoritative evaluation layer.**

- One logical gate: request in → evaluation → PERMIT | BLOCK | SILENCE (and receipt when applicable).
- No competing decision sources. No bypass. The evaluation layer is the only authority that can produce a PERMIT.
- Site, docs, and API explain the protocol; they do not replace it. The runtime that evaluates surface, action, and context against policy is the authority.

---

## 2. Surfaces are defined by the surface registry

- Valid execution surfaces are defined by the [Surface Registry](SURFACE_REGISTRY_V1.md). Any surface not listed is **invalid**.
- Requests that use an unlisted surface MUST be rejected (e.g. 400 unknown_surface). The registry is the source of truth for what can be requested and evaluated.
- The registry enforces what surfaces exist; the evaluation layer enforces whether a given request on a valid surface is PERMIT, BLOCK, or SILENCE.

---

## 3. Adapters translate; they are not protocol authority

- Adapters (e.g. tool/args for LLM runtimes, domain-specific envelopes) map external shapes into the **canonical** contract: surface, action, context. See [ADAPTERS.md](ADAPTERS.md).
- Adapters do not decide. They translate. Policy evaluation and the decision model operate on the canonical form only.
- Regardless of adapter, all execution decisions still originate from the one authoritative evaluation layer.

---

## 4. Site, docs, and API explain the protocol

- The website and documentation describe the protocol, the execution flow, and the verification flow. They are the communication layer for the same canonical model.
- The API exposes the protocol (POST /execute, key discovery, receipt shape). It does not define a second protocol; it implements the one defined in the protocol docs.
- Design and brand collaborators should align messaging to: single authority, fail-closed, deterministic, no silent fallbacks.

---

## 5. Registry enforces what surfaces are valid

- The surface registry is authoritative. Only registered surfaces are valid. The evaluation layer rejects unknown surfaces before policy evaluation.
- Enforcement of “what exists” (registry) and “what is allowed for this request” (evaluation) are both part of the same trust model: no execution without explicit PERMIT from the single authority.

---

## 6. Verification confirms what was authorized

- Verification does not authorize. It confirms that a receipt was issued by the authority and that the payload is intact.
- Auditors and downstream systems verify receipts offline using public keys and the signed payload. Verification validates; it does not replace the evaluation layer.

---

## 7. Execution never proceeds on ambiguity

- If conditions are not satisfied, execution is blocked. If the system cannot evaluate deterministically (SILENCE), execution is blocked.
- There are no silent fallbacks, default-allow paths, or approximations. Nothing executes without an explicit PERMIT.
- This is fail-closed by design: no PERMIT, no execution.

---

## 8. Summary (doctrine)

| Role | Responsibility |
|------|-----------------|
| **Protocol** | Defines surface, action, context; PERMIT/BLOCK/SILENCE; receipt and verification. |
| **Registry** | Enforces which surfaces are valid. |
| **TrigGuard (evaluation layer)** | Evaluates requests; sole authority for PERMIT/BLOCK/SILENCE. |
| **Adapters** | Translate external shapes to canonical contract; do not decide. |
| **Verification** | Validates receipts; confirms what was authorized; does not authorize. |
| **Site / docs / API** | Explain and expose the protocol; do not redefine it. |

One authority. One protocol. No execution without explicit PERMIT.

---

## References

| Document | Purpose |
|----------|---------|
| [TRIGGUARD_EXECUTION_PROTOCOL.md](TRIGGUARD_EXECUTION_PROTOCOL.md) | Canonical execution contract |
| [SURFACE_REGISTRY_V1.md](SURFACE_REGISTRY_V1.md) | Authoritative surface list |
| [ADAPTERS.md](ADAPTERS.md) | Adapter mapping to canonical contract |
| [TRIGGUARD_VERIFICATION_FLOW.md](TRIGGUARD_VERIFICATION_FLOW.md) | Receipt verification flow |
