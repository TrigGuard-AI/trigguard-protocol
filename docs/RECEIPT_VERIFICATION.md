# TrigGuard Receipt Verification

Receipts produced by TrigGuard Cloud (or any TrigGuard-compatible authority) are cryptographically signed so that any party can verify them **without contacting the TrigGuard server**.

## Signed payload

- **Algorithm:** Ed25519
- **Signed payload:** The value of `receiptHash` (hex-encoded SHA-256 of the canonical receipt fields).
- **Signature:** Stored in `authoritySignature` as base64.
- **Key identifier:** `authorityKeyId` (e.g. `trigguard-cloud-key-1`) maps to a public key in the published keys file.

## Verification process

1. **Obtain the receipt** — JSON object from the `/execute` response or from a stored artifact.
2. **Obtain the keys file** — `public/.well-known/trigguard/keys.json` (or your authority’s published keys).
3. **Locate the key** — Find the entry in `keys.keys` where `keyId === receipt.authorityKeyId`.
4. **Verify the signature** — Using the public key (PEM), verify that the signature in `authoritySignature` (base64-decoded) is a valid Ed25519 signature over `receipt.receiptHash` (hex-decoded).
5. **Confirm authority** — Optionally ensure `receipt.authorityId` and `keys.authority` match the authority you trust.

Unsigned receipts (`authoritySignature === "unsigned"`) cannot be verified; they are only audit logs.

## CLI example

From the repository root, after saving a signed receipt to `receipt.json`:

```bash
node scripts/verify_receipt.js receipt.json
```

Default keys path: `public/.well-known/trigguard/keys.json`. Override with a second argument:

```bash
node scripts/verify_receipt.js receipt.json path/to/keys.json
```

**Expected output for a valid receipt:**

```
VALID RECEIPT
```

Invalid or tampered receipts exit with `INVALID RECEIPT` and non-zero exit code.

## Keys file format

`public/.well-known/trigguard/keys.json`:

```json
{
  "protocol": "trigguard/v1",
  "authority": "trigguard-cloud",
  "keys": [
    {
      "keyId": "trigguard-cloud-key-1",
      "algorithm": "Ed25519",
      "publicKeyPem": "-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----"
    }
  ]
}
```

Replace `publicKeyPem` with the contents of your Ed25519 public key file (e.g. from `openssl pkey -in trigguard_private_key.pem -pubout -out trigguard_public_key.pem`). Do not commit the private key.

## Receipt fields used for verification

| Field | Use |
|-------|-----|
| `receiptHash` | Data that was signed (hex). |
| `authoritySignature` | Ed25519 signature, base64. |
| `authorityKeyId` | Selects which key in `keys.json` to use. |

See [FIRST_RECEIPT_TEST.md](../testing/FIRST_RECEIPT_TEST.md) for the full receipt structure and how to obtain a signed receipt from TrigGuard Cloud.
