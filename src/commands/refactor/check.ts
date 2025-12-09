import {
	DEFAULT_MAX_LINES,
	type GitFilterOptions,
	getViolations,
	logViolations,
} from "./getViolations.js";

type CheckOptions = GitFilterOptions & {
	maxLines?: number;
};

export function check(
	pattern: string | undefined,
	options: CheckOptions,
): void {
	const maxLines = options.maxLines ?? DEFAULT_MAX_LINES;
	const violations = getViolations(pattern, options, maxLines);
	violations.sort((a, b) => b.lines - a.lines);
	logViolations(violations, maxLines);

	if (violations.length > 0) {
		process.exit(1);
	}
}
