import type { CheckSummary, GhStatusCheck } from "./types";

const PASSING_CONCLUSIONS = new Set(["SUCCESS", "NEUTRAL", "SKIPPED"]);
const PENDING_STATES = new Set(["PENDING", "EXPECTED"]);

function checkName(check: GhStatusCheck): string {
	return check.name?.trim() || check.context?.trim() || "unnamed check";
}

function isPending(check: GhStatusCheck): boolean {
	if (check.status) return check.status !== "COMPLETED";
	return PENDING_STATES.has(check.state ?? "");
}

function isFailing(check: GhStatusCheck): boolean {
	if (check.status) return !PASSING_CONCLUSIONS.has(check.conclusion ?? "");
	return !PASSING_CONCLUSIONS.has(check.state ?? "");
}

export function summariseChecks(
	rollup: GhStatusCheck[] | null | undefined,
): CheckSummary {
	const summary: CheckSummary = { failing: [], pending: [] };

	for (const check of rollup ?? []) {
		if (isPending(check)) summary.pending.push(checkName(check));
		else if (isFailing(check)) summary.failing.push(checkName(check));
	}

	return summary;
}
