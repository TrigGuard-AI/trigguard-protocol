# TrigGuard Protocol

**Protocol • Deterministic Execution Governance for AI Systems**

> **TrigGuard Protocol** — deterministic execution governance **contract**, **schemas**, and **conformance tests**.

Public **specification**, **conformance** vectors, and the **[`@trigguard/protocol`](https://www.npmjs.com/package/@trigguard/protocol)** TypeScript package.

| Area | Contents |
|------|----------|
| [`spec/`](spec/) | JSON Schema + [`TG_PROTOCOL.md`](spec/TG_PROTOCOL.md) |
| [`docs/`](docs/) | Normative protocol prose (execution, receipts, surfaces, API) |
| [`conformance/`](conformance/) | [`protocol-tests.json`](conformance/protocol-tests.json) |
| [`implementations/typescript/`](implementations/typescript/) | npm package `@trigguard/protocol` |

### Quick start: `@trigguard/protocol` (npm)

Install from the public registry, then use the canonical decision vocabulary and `DecisionRecord` shape (no evaluator here — that lives in [TrigGuard](https://github.com/TrigGuard-AI/TrigGuard) services; this package keeps types and constants aligned with the spec):

```bash
npm install @trigguard/protocol
```

```typescript
import { DECISION, ENFORCEMENT, type DecisionRecord } from "@trigguard/protocol";

const record: DecisionRecord = {
  decision: DECISION.PERMIT,
  enforcement: ENFORCEMENT.EXECUTED,
  reason_code: "NO_POLICY_VIOLATION",
  timestamp: new Date().toISOString(),
};
```

More examples, subpath exports (`/schema`, `/contract`), and path installs: [`implementations/typescript/README.md`](implementations/typescript/README.md).

**Runtime product** (private): [TrigGuard-AI/TrigGuard](https://github.com/TrigGuard-AI/TrigGuard).

## Releases (versioned protocol surface)

**Current:** [**v0.1.0**](https://github.com/TrigGuard-AI/trigguard-protocol/releases/tag/v0.1.0) — initial public protocol release. The **protocol version** in [`spec/TG_PROTOCOL.md`](spec/TG_PROTOCOL.md) matches this tag.

[All releases](https://github.com/TrigGuard-AI/trigguard-protocol/releases)

## Quick links

- Execution protocol: [`docs/TRIGGUARD_EXECUTION_PROTOCOL.md`](docs/TRIGGUARD_EXECUTION_PROTOCOL.md)
- Contributing: [`CONTRIBUTING.md`](CONTRIBUTING.md)

### Security & review (read these first)

| File | Purpose |
|------|---------|
| [`SECURITY.md`](SECURITY.md) | **Responsible disclosure** — how to report vulnerabilities privately. |
| [`THREAT_MODEL.md`](THREAT_MODEL.md) | **Assumptions** — assets, boundaries, what this repo does / does not guarantee. |
| [`ARCHITECTURE.md`](ARCHITECTURE.md) | **How the protocol layer fits** — spec, docs, SDK, CI. |

## License

MIT — see [`LICENSE`](LICENSE). *(Many protocol projects use Apache-2.0; changing license is an org/legal decision.)*

## Repository description (GitHub)

Use this one-line description in **Settings**:

`TrigGuard Protocol — deterministic execution governance contract, schemas, and conformance tests.`
