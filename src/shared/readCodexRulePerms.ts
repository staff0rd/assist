import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { harnesses } from "./harnesses";
import { parseCodexRules } from "./parseCodexRules";

function ruleFiles(dir: string): string[] {
	if (!existsSync(dir)) return [];
	try {
		return readdirSync(dir)
			.filter((name) => name.endsWith(".rules"))
			.sort()
			.map((name) => join(dir, name));
	} catch {
		return [];
	}
}

export function readCodexRulePerms(key: "allow" | "deny"): string[] {
	const dirs = [
		join(harnesses.codex.homeDir, "rules"),
		join(process.cwd(), ".codex", "rules"),
	];
	return dirs.flatMap(ruleFiles).flatMap((file) => {
		try {
			return parseCodexRules(readFileSync(file, "utf8"))[key];
		} catch {
			return [];
		}
	});
}
