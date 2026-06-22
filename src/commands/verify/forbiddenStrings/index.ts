import { existsSync, readFileSync } from "node:fs";
import { loadConfig } from "../../../shared/loadConfig";
import { findForbiddenStrings } from "./findForbiddenStrings";

export function forbiddenStrings(): void {
	const rules = loadConfig().forbiddenStrings ?? [];
	if (rules.length === 0) {
		console.log("No forbidden-strings rules configured.");
		process.exit(0);
	}

	const cache = new Map<string, unknown>();
	const readJson = (file: string): unknown => {
		if (cache.has(file)) return cache.get(file);
		if (!existsSync(file)) {
			console.log(`Forbidden-strings file not found: ${file}`);
			process.exit(1);
		}
		let parsed: unknown;
		try {
			parsed = JSON.parse(readFileSync(file, "utf8"));
		} catch (error) {
			console.log(`Could not parse ${file}: ${(error as Error).message}`);
			process.exit(1);
		}
		cache.set(file, parsed);
		return parsed;
	};

	const violations = findForbiddenStrings(rules, readJson);

	if (violations.length === 0) {
		console.log("No forbidden strings found.");
		process.exit(0);
	}

	console.log("Forbidden strings found:\n");
	for (const { file, path, value } of violations) {
		console.log(`  ${file} ${path}: ${value}`);
	}
	console.log(`\nTotal: ${violations.length} forbidden string(s).`);
	console.log(
		"\nRemove each flagged value, or adjust the matching forbiddenStrings rule in assist.yml.",
	);
	process.exit(1);
}
