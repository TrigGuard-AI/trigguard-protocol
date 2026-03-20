# TrigGuard Protocol Adapters

**Version:** 1.0.0  
**Status:** Informative  
**Audience:** Integrators, SDK authors, LLM/agent framework adopters.

The **canonical** execution contract is **surface + action + context** (see [TRIGGUARD_EXECUTION_PROTOCOL.md](TRIGGUARD_EXECUTION_PROTOCOL.md)). Some entry points accept different shapes for convenience or ecosystem fit. These are **adapter layers**: they map into the canonical contract internally. There is still a single protocol; adapters are not a second protocol.

---

## tool / args (LLM integration)

Many LLM and agent frameworks (LangChain, AutoGen, CrewAI, custom runtimes) expose a **tool** name and **arguments** object. TrigGuard can accept this shape at the API so that integrators do not have to rewrite their pipeline.

- **External request shape:** `tool`, `args`, and optional `intent_id`, `actor`, `context`.
- **Internal mapping:** The adapter (or gateway) maps `tool` + `args` to a **surface** and **action** (and possibly **context**). For example:
  - `tool: "stripe.charge"`, `args: { amount, currency }` → surface `payments.charge`, action derived from tool/args.
  - `tool: "github.deploy"`, `args: { repo, ref }` → surface `deploy.release`, action e.g. `release`, context from args.

Policy evaluation and the decision model (PERMIT / BLOCK / SILENCE) operate on the **canonical** surface/action/context. Receipts and audit records refer to the canonical form.

- **Backward compatibility:** Existing APIs that accept tool/args continue to work. New implementations should document how tool/args map to surfaces for their deployment.
- **Single authority:** Regardless of adapter, all execution decisions still originate from the one authoritative evaluation layer; see [TRIGGUARD_EXECUTION_PROTOCOL.md](TRIGGUARD_EXECUTION_PROTOCOL.md).

---

## Other adapters

Other shapes (e.g. domain-specific RPC, legacy envelope formats) may be added as adapters. Each MUST define a deterministic mapping to surface, action, and context. The canonical protocol and [SURFACE_REGISTRY_V1.md](SURFACE_REGISTRY_V1.md) remain the source of truth.
