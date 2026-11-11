import * as fs from "node:fs";
import * as path from "node:path";
import type { SyncOwner } from "./createSyncFiles";
import { type PruneResult, pruneTarget } from "./pruneTarget";

export function pruneSkills(
	targetDir: string,
	skillNames: Iterable<string>,
	options: { force: boolean; owner: SyncOwner },
): PruneResult {
	return pruneTarget(
		targetDir,
		skillNames,
		{
			nameOf: (entry) => (entry.isDirectory() ? entry.name : undefined),
			ownedPaths: (skillDir) => [skillDir, path.join(skillDir, "SKILL.md")],
			blockedBy: unexpectedContent,
		},
		options,
	);
}

function unexpectedContent(skillDir: string): string | undefined {
	const entries = fs.readdirSync(skillDir);
	const others = entries.filter((entry) => entry !== "SKILL.md");
	if (others.length > 0) return `contains ${others.sort().join(", ")}`;
	return entries.length === 0 ? "no SKILL.md" : undefined;
}
