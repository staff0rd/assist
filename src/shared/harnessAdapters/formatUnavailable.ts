import type { Unavailability } from "./types";

export function formatUnavailable(
	what: string,
	harnessLabel: string,
	reasons: Unavailability[],
): string {
	const lines = reasons.map(
		(r) => `  - ${r.reason} (${r.capability}); ${r.remediation}`,
	);
	return [`${what} is unavailable on ${harnessLabel}:`, ...lines].join("\n");
}
