import { InvalidArgumentError } from "commander";

export function parseTopCount(value: string): number {
	if (!/^\d+$/.test(value) || Number.parseInt(value, 10) < 1) {
		throw new InvalidArgumentError("Expected a positive integer.");
	}
	return Number.parseInt(value, 10);
}
