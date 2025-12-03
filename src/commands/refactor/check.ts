import { getViolations, logViolations } from "./getViolations.js";

export function check(pattern?: string): void {
	const violations = getViolations(pattern);
	violations.sort((a, b) => b.lines - a.lines);
	logViolations(violations);

	if (violations.length > 0) {
		process.exit(1);
	}
}
