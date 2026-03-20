# Protocol documentation site outline (e.g. docs.trigguardai.com)

**Purpose:** Checklist for a public protocol docs site. Makes TrigGuard look like a standard, not just a product.

---

## Suggested pages

| Page | Content |
|------|--------|
| **Execution protocol (canonical)** | Single source of truth: execution contract, decision model, rules. Link to [TRIGGUARD_EXECUTION_PROTOCOL.md](TRIGGUARD_EXECUTION_PROTOCOL.md). |
| **API schema** | External request/response shape. Link to [API_SCHEMA.md](API_SCHEMA.md). |
| **Receipt format** | Field list, Content-Type `application/trigguard-receipt+json`, signing (ed25519), issuer/publicKeyId. |
| **Surface registry** | Table of surfaces (payments.charge, deploy.release, etc.), payload schema, risk class, nonce, receipt fields. Link to [SURFACE_REGISTRY_V1.md](SURFACE_REGISTRY_V1.md). |
| **Verification guide** | How to verify without the server: `verifyReceipt(receipt, publicKey)`; Node and Python packages; POST /verify-receipt. |
| **Integration example** | One end-to-end flow (e.g. [deploy.release integration](../integrations/DEPLOY_RELEASE_INTEGRATION.md), or payment_guard). |

---

## Repo sources

- Protocol (canonical): `docs/protocol/TRIGGUARD_EXECUTION_PROTOCOL.md` — API: `docs/protocol/API_SCHEMA.md`. Deprecated: `TRIGGUARD_PROTOCOL_V1.md`.
- Surface registry: `docs/protocol/SURFACE_REGISTRY_V1.md`
- Verifier: `packages/trigguard-receipt-verifier` (Node), `packages/trigguard-receipt-verifier-python`
- Integration: `docs/integrations/DEPLOY_RELEASE_INTEGRATION.md`, `examples/payment_guard/`

---

## One-line site tagline

**TrigGuard Protocol — the trust layer that verifies irreversible actions in digital systems.**
