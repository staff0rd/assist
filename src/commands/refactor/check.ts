import { getViolations, logViolations } from "./getViolations.js";

export function check(pattern?: string): void {
	const violations = getViolations(pattern);
	logViolations(violations);

	if (violations.length > 0) {
		process.exit(1);
	}
}
