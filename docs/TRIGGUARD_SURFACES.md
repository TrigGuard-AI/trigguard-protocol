# TrigGuard Official Product Surfaces

This document defines the four primary irreversible-action surfaces supported by TrigGuard. Each surface is a distribution entry point corresponding to common high-impact operations in software systems.

---

## 1. deploy.release (DevOps)

**Surface:** `deploy.release`

**Description:** Authorization gate for production deployments. TrigGuard decides whether a production deployment is allowed. CI pipelines request authorization before releasing; on PERMIT, deployment continues and a signed receipt is produced for audit.

**Typical actors:** CI pipelines, release automation (e.g. GitHub Actions, GitLab CI, Jenkins).

**Typical subjectDigest:** Git commit SHA (or image digest / version ID) that identifies the artifact being deployed.

**Example request:**

```json
{
  "surface": "deploy.release",
  "actorId": "github-actions",
  "subjectDigest": "a84c13b9f4f2e1d..."
}
```

**Flow:** CI Pipeline → TrigGuard authorize deploy → PERMIT / BLOCK → Deployment continues or is blocked.

---

## 2. infra.apply (Infrastructure change)

**Surface:** `infra.apply`

**Description:** Authorization for infrastructure changes: Terraform apply, Pulumi apply, Kubernetes changes, cloud resource mutations. Security and platform teams use it to gate risky infra operations.

**Typical actors:** Terraform runs, Pulumi, Kubernetes operators, infra automation.

**Typical subjectDigest:** Plan hash or change-set ID (e.g. Terraform plan hash, Pulumi stack diff ID).

**Example request:**

```json
{
  "surface": "infra.apply",
  "actorId": "terraform",
  "subjectDigest": "terraform_plan_hash_or_change_id"
}
```

**Flow:** Terraform apply (or equivalent) → TrigGuard authorize infra change → Decision → Apply or block.

---

## 3. data.export (Compliance / data)

**Surface:** `data.export`

**Description:** Authorization for data exports: customer data exports, database dumps, AI dataset exports. Used for compliance (e.g. GDPR, data governance) and audit of who approved which export.

**Typical actors:** Data pipelines, export jobs, analytics or ML dataset export services.

**Typical subjectDigest:** Dataset hash, export job ID, or scope identifier.

**Example request:**

```json
{
  "surface": "data.export",
  "actorId": "data-service",
  "subjectDigest": "dataset_hash_or_export_job_id"
}
```

**Flow:** Export request → TrigGuard → Signed receipt → Export allowed (or blocked).

---

## 4. payment.execute (Fintech / critical transactions)

**Surface:** `payment.execute`

**Description:** Authorization for critical financial operations: large payments, crypto transfers, admin financial actions. Produces a verifiable receipt that the transaction was authorized.

**Typical actors:** Payments API, treasury systems, admin dashboards.

**Typical subjectDigest:** Transaction ID, payment reference, or transfer hash.

**Example request:**

```json
{
  "surface": "payment.execute",
  "actorId": "payments-api",
  "subjectDigest": "transaction_id_or_reference"
}
```

**Flow:** Payment request → TrigGuard decision → Receipt → Payment executes (or is blocked).

---

## Relation to Surface Registry

These four surfaces are the primary **product** surfaces for distribution. The full semantic registry (payload schema, risk class, nonce, receipt fields) is in [SURFACE_REGISTRY_V1.md](SURFACE_REGISTRY_V1.md) (and in the repo root `protocol/`). All requests use the same **POST /execute** endpoint; the `surface` field selects the semantics and policy.
