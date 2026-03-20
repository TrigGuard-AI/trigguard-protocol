# TrigGuard Surface Registry v1

> **DEPRECATED** — Authoritative registry is [docs/protocol/SURFACE_REGISTRY_V1.md](../docs/protocol/SURFACE_REGISTRY_V1.md). This copy is retained for reference only.

**Version:** 1  
**Status:** Published — public semantic registry  
**Audience:** Integrators, auditors, SDK authors, adopters.

---

This is the governance vocabulary of execution surfaces. Same name implies same semantics, payload schema, risk class, and receipt behavior across the ecosystem.

---

## Registry entries

Each entry defines: **payload schema**, **risk class**, **nonce requirement**, **receipt fields**, **policy hooks**.

| Surface              | Payload schema (min)           | Risk   | Nonce   | Receipt fields              | Policy hooks        |
|----------------------|---------------------------------|--------|---------|-----------------------------|---------------------|
| `payments.charge`    | amount, currency, tenantId      | high   | required| executionId, requestHash, surface, decision, policyVersion, timestamp, signature | policy snapshot, ruleset version |
| `payments.refund`    | amount, currency, reference     | high   | required| same                        | same                |
| `deploy.release`     | target, version                  | high   | required| same                        | same                |
| `identity.role_grant`| role, principal                  | high   | required| same                        | same                |
| `data.export`        | scope, format                    | medium | required| same                        | same                |
| `model.publish`      | artifactId, version              | high   | required| same                        | same                |
| `payments`           | surface, signals, context        | high   | required| same                        | same (legacy)       |
| `example`            | (any)                            | low    | required| same                        | test                |

---

## Payload schema

- **Minimum:** Every execution MUST carry a normalized payload; hash of that payload is `requestHash`.
- Surface-specific required fields are listed above; additional fields are allowed.

---

## Risk class

- **high** — Irreversible or high-impact; strict policy and audit.
- **medium** — Reversible with effort; standard replay and receipt.
- **low** — Test or low-impact; same replay rules.

---

## Nonce requirement

- **required** for all surfaces in V1. One nonce per (tenant, surface, requestHash); second use is rejected (replay).

---

## Receipt fields

- Every receipt MUST include at least: `executionId`, `requestHash`, `surface`, `decision`, `policyVersion`, `timestamp`, `signature`.
- Optional: `issuer`, `publicKeyId` for multi-issuer verification.

---

## Policy hooks

- Execution is gated by policy (ruleset / snapshot). Decision binds to `policyVersion` and optionally `policySnapshotRef` / `policyBundleHash` for audit and compatibility.

---

## Governance

- New surfaces: add to this registry via governance; preserve backwards compatibility.
- Do not rename or remove entries without a compatibility path.
