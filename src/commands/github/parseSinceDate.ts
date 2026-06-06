import { InvalidArgumentError } from "commander";

export function parseSinceDate(value: string): string {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
		throw new InvalidArgumentError("Expected a date in YYYY-MM-DD format.");
	}
	const date = new Date(`${value}T00:00:00Z`);
	// Round-trip to reject rollover dates like 2026-02-30 (JS parses them as March 2)
	if (
		Number.isNaN(date.getTime()) ||
		date.toISOString().slice(0, 10) !== value
	) {
		throw new InvalidArgumentError(`Not a valid calendar date: ${value}.`);
	}
	return value;
}
