# TrigGuard execution surfaces

TrigGuard validates that each **POST /execute** request uses a **known surface**. Unknown surfaces are rejected with `400 { "error": "unknown_surface" }`. This keeps the protocol vocabulary explicit and allows policy and metrics to be surface-aware.

## Supported surfaces

| Surface | Description |
|--------|-------------|
| `deploy.release` | Production deployment authorization (CI/CD). |
| `infra.apply` | Infrastructure change authorization (Terraform, Pulumi, K8s). |
| `artifact.publish` | Artifact publishing (Docker, npm, PyPI). |
| `data.export` | Data export authorization (exports, dumps, compliance). |
| `payment.execute` | Critical payment or financial transaction authorization. |
| `secrets.access` | Access to secrets or credentials. |
| `database.migrate` | Database migrations. |
| `production.write` | Writes to production data stores. |

The allow-list is defined in `packages/trigguard-cloud/config/execution-surfaces.json`. Adding a surface requires updating that file and redeploying.

## deploy.release

Authorization gate for production deployments. Typical actors: CI pipelines, release automation. Use `context` (repository, commit, workflow, environment) and/or `subjectDigest` (e.g. commit SHA) to bind the receipt.

## infra.apply

Authorization for infrastructure changes (Terraform apply, Pulumi, Kubernetes). Use `subjectDigest` as plan hash or change-set ID.

## artifact.publish

Authorization for publishing artifacts (Docker image, npm package, etc.). Use `context.artifact` (e.g. image digest) and `subjectDigest` as needed.

## data.export

Authorization for data exports (customer data, dataset dumps, GDPR exports). Use `subjectDigest` as export job ID or scope hash.

## payment.execute

Authorization for critical payments or financial transactions. Use `subjectDigest` as transaction ID or reference.

## secrets.access

Authorization for accessing secrets or credentials (vaults, env injection, CI secrets). Use `subjectDigest` as scope or secret-set ID.

## database.migrate

Authorization for database migrations. Use `subjectDigest` as migration ID or schema hash; use `context` for environment.

## production.write

Authorization for writes to production data stores. Use `subjectDigest` and `context` to bind the receipt to the operation.

## Unknown surface

If the request `surface` is not in the allow-list, the API responds with:

**400**

```json
{
  "error": "unknown_surface"
}
```

## See also

- [TRIGGUARD_SURFACES.md](TRIGGUARD_SURFACES.md) — Product surface definitions and example requests.
- [SURFACE_USAGE_EXAMPLES.md](../examples/SURFACE_USAGE_EXAMPLES.md) — Example API calls.
