import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

/** Collect permission entries from all settings layers. */
export function readSettingsPerms(key: "allow" | "deny"): string[] {
	const paths = [
		join(homedir(), ".claude", "settings.json"),
		join(process.cwd(), ".claude", "settings.json"),
		join(process.cwd(), ".claude", "settings.local.json"),
	];
	const entries: string[] = [];
	for (const p of paths) {
		entries.push(...readPermissionArray(p, key));
	}
	return entries;
}

function readPermissionArray(
	filePath: string,
	key: "allow" | "deny",
): string[] {
	if (!existsSync(filePath)) return [];
	try {
		const data = JSON.parse(readFileSync(filePath, "utf-8"));
		const arr = data?.permissions?.[key];
		return Array.isArray(arr)
			? arr.filter((e: unknown) => typeof e === "string")
			: [];
	} catch {
		return [];
	}
}
