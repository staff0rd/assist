import {
	type GitFilterOptions,
	getViolations,
	logViolations,
} from "./getViolations.js";

export function check(
	pattern: string | undefined,
	options: GitFilterOptions,
): void {
	const violations = getViolations(pattern, options);
	violations.sort((a, b) => b.lines - a.lines);
	logViolations(violations);

	if (violations.length > 0) {
		process.exit(1);
	}
}
