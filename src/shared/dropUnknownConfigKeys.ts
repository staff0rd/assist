import { assistConfigSchema } from "./types";

function objectAt(
	root: unknown,
	path: PropertyKey[],
): Record<string, unknown> | undefined {
	let node = root;
	for (const segment of path) {
		if (!node || typeof node !== "object") return undefined;
		node = (node as Record<PropertyKey, unknown>)[segment];
	}
	if (!node || typeof node !== "object" || Array.isArray(node))
		return undefined;
	return node as Record<string, unknown>;
}

function removeUnrecognizedKeys(config: Record<string, unknown>): boolean {
	const parsed = assistConfigSchema.safeParse(config);
	if (parsed.success) return false;
	let removed = false;
	for (const issue of parsed.error.issues) {
		if (issue.code !== "unrecognized_keys") continue;
		const target = objectAt(config, issue.path);
		for (const key of issue.keys) {
			if (target && key in target) {
				delete target[key];
				removed = true;
			}
		}
	}
	return removed;
}

export function dropUnknownConfigKeys(
	raw: Record<string, unknown>,
): Record<string, unknown> {
	const config = structuredClone(raw);
	while (removeUnrecognizedKeys(config));
	return config;
}
