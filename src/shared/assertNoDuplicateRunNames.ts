import type { RunConfig } from "./types";

function findDuplicateNames(configs: RunConfig[]): string[] {
	const seen = new Set<string>();
	const dupes = new Set<string>();
	for (const c of configs) {
		if (seen.has(c.name)) dupes.add(c.name);
		seen.add(c.name);
	}
	return [...dupes];
}

export function assertNoDuplicateRunNames(configs: RunConfig[]): void {
	const duplicates = findDuplicateNames(configs);
	if (duplicates.length > 0) {
		throw new Error(
			`Duplicate run command names: ${duplicates.join(", ")}. ` +
				"Use the prefix option on link entries to namespace linked commands.",
		);
	}
}
