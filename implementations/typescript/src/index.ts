/**
 * @trigguard/protocol — canonical vocabulary and record shape for TrigGuard surfaces.
 * Policy/evaluation layers may emit only PERMIT|DENY; full protocol includes SILENCE.
 * Reason codes are snapshotted from core/contracts/decision_contract.json (see sync-contract script).
 */

import decisionContract from "./contracts/decision_contract.json";

/** Full protocol decision set (remote eval / product surfaces). */
export type Decision = "PERMIT" | "DENY" | "SILENCE";

/** Policy contract layer decisions only (matches decision_contract.json `decision`). */
export type PolicyDecision = "PERMIT" | "DENY";

export type Enforcement = "EXECUTED" | "BLOCKED";

export const DECISION = {
  PERMIT: "PERMIT",
  DENY: "DENY",
  SILENCE: "SILENCE",
} as const satisfies Record<string, Decision>;

export const ENFORCEMENT = {
  EXECUTED: "EXECUTED",
  BLOCKED: "BLOCKED",
} as const satisfies Record<string, Enforcement>;

/** Ordered canonical sets for consumers (CI, SDKs). */
export const DECISIONS = ["PERMIT", "DENY", "SILENCE"] as const;

export const ENFORCEMENTS = ["EXECUTED", "BLOCKED"] as const;

/**
 * Canonical SILENCE explanation for public and SDK surfaces.
 * Keep in sync with site governance / protocol docs.
 */
export const SILENCE_DEFINITION =
  "SILENCE means no authorization was issued. Without authorization, execution cannot proceed.";

/** Reason codes derived from core/contracts/decision_contract.json (kept in sync by sync-contract). */
export const REASON_CODES: readonly string[] = decisionContract.reasonCode;

export type ReasonCode = (typeof decisionContract.reasonCode)[number];

export interface DecisionRecord {
  decision: Decision;
  enforcement: Enforcement;
  /** Prefer values from REASON_CODES when representing policy outcomes. */
  reason_code: string;
  timestamp: string;
}

/** Embedded contract snapshot (authoritative registry for reason codes at policy layer). */
export { decisionContract };
