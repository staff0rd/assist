import { resolve } from "node:path";
import { loadRawYaml } from "./loadRawYaml";
import { assistConfigSchema, type RunEntry } from "./types";

export function loadLinkedEntries(
	configPath: string,
	visited: Set<string>,
): RunEntry[] | undefined {
	const canonical = resolve(configPath);
	if (visited.has(canonical)) {
		throw new Error(
			`Circular link detected: ${canonical} has already been visited`,
		);
	}
	visited.add(canonical);
	const raw = loadRawYaml(configPath);
	return assistConfigSchema.parse(raw).run;
}
