import { existsSync, readFileSync } from "node:fs";
import { parse as parseYaml } from "yaml";

export function loadRawYaml(path: string): Record<string, unknown> {
	if (!existsSync(path)) return {};
	try {
		const content = readFileSync(path, "utf-8");
		return (parseYaml(content) as Record<string, unknown>) || {};
	} catch {
		return {};
	}
}
