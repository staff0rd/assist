import { getViolations, logViolations } from "./getViolations.js";

export function next(): void {
	const violations = getViolations();

	if (violations.length === 0) {
		logViolations([]);
		return;
	}

	violations.sort((a, b) => b.lines - a.lines);

	logViolations([violations[0]]);
}
