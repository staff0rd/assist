import type { AskCheckInput } from "../sessions/shared/askCheckInputSchema";
import { stepProse } from "./stepProse";
import { unbacktickedCommands } from "./unbacktickedCommands";

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
			overLength(`steps[${i + 1}]`, stepProse(step), MAX_STEP),
		),
		...overCount("before", check.before ?? [], MAX_BEFORE),
		...overLength("changed", check.changed ?? "", MAX_CHANGED),
	];
}

function commandViolations(check: AskCheckInput): string[] {
	return check.steps.flatMap((step, i) => {
		const commands = unbacktickedCommands(step);
		return commands.length > 0
			? [`- steps[${i + 1}]: ${commands.join(", ")}`]
			: [];
	});
}

function section(heading: string, violations: string[], advice: string) {
	return violations.length > 0 ? [heading, ...violations, advice] : [];
}

export function rejectInvalidCheck(check: AskCheckInput): void {
	const errors = [
		...section(
			"Error: the check is over its limits (backticked code is not counted):",
			checkLimitViolations(check),
			"Shorten these fields and re-run assist ask-check.",
		),
		...section(
			"Error: these steps hold a command, URL or flag outside backticks:",
			commandViolations(check),
			"Wrap each whole command in backticks (`like this`) so the user can copy it, and re-run assist ask-check.",
		),
	];
	if (errors.length === 0) return;
	console.error(errors.join("\n"));
	process.exit(1);
}
