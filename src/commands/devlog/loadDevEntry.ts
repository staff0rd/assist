import { readFileSync } from "node:fs";
import { parse as parseYaml } from "yaml";
import { devEntryPath } from "./devEntryPath";
import type { DevEntry } from "./types";

function asString(value: unknown): string | null {
	return value === undefined || value === null ? null : String(value);
}

function readFrontmatter(path: string): Record<string, unknown> | null {
	try {
		const match = readFileSync(path, "utf8").match(/^---\n([\s\S]*?)\n---/);
		return match ? (parseYaml(match[1]) ?? {}) : null;
	} catch {
		return null;
	}
}

export function loadDevEntry(
	repoName: string,
	week: string,
	devDir: string,
): DevEntry | null {
	const path = devEntryPath(repoName, week, devDir);
	const frontmatter = readFrontmatter(path);
	if (!frontmatter) return null;
	const versions = frontmatter.versions as Record<string, unknown> | undefined;
	return {
		title: asString(frontmatter.title),
		firstVersion: asString(versions?.first),
		lastVersion: asString(versions?.last),
	};
}
