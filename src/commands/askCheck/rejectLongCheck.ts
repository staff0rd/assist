import type { AskCheckInput } from "../sessions/shared/askCheckInputSchema";

const MAX_TITLE = 60;
const MAX_STEPS = 4;
const MAX_STEP = 90;
const MAX_BEFORE = 4;
const MAX_CHANGED = 160;

function overLength(field: string, value: string, max: number) {
	return value.length > max
		? [`- ${field}: ${value.length} characters (max ${max})`]
		: [];
}

function overCount(field: string, values: string[], max: number) {
	return values.length > max
		? [`- ${field}: ${values.length} items (max ${max})`]
		: [];
}

function checkLimitViolations(check: AskCheckInput): string[] {
	return [
		...overLength("title", check.title, MAX_TITLE),
		...overCount("steps", check.steps, MAX_STEPS),
		...check.steps.flatMap((step, i) =>
			overLength(`steps[${i + 1}]`, step, MAX_STEP),
		),
		...overCount("before", check.before ?? [], MAX_BEFORE),
		...overLength("changed", check.changed ?? "", MAX_CHANGED),
	];
}

export function rejectLongCheck(check: AskCheckInput): void {
	const violations = checkLimitViolations(check);
	if (violations.length === 0) return;
	console.error(
		[
			"Error: the check is over its limits:",
			...violations,
			"Shorten these fields and re-run assist ask-check.",
		].join("\n"),
	);
	process.exit(1);
}
