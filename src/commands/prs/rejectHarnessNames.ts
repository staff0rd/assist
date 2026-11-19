import { findHarnessNameViolation } from "./findHarnessNameViolation";

export function rejectHarnessNames(label: string, text: string): void {
	const violation = findHarnessNameViolation(label, text);
	if (!violation) return;
	console.error(`Error: ${violation}`);
	process.exit(1);
}
