import * as path from "node:path";
import type { SyncOwner } from "./createSyncFiles";
import { pruneCommands } from "./pruneCommands";
import { pruneSkills } from "./pruneSkills";
import type { PruneOptions } from "./pruneTarget";
import { reportPrune } from "./reportPrune";

export function pruneClaude(
	targetBase: string,
	skillNames: string[],
	options: PruneOptions,
	owner: SyncOwner,
): void {
	if (!options.prune) return;
	const force = options.force ?? false;
	reportPrune(
		"~/.claude/skills",
		pruneSkills(path.join(targetBase, "skills"), skillNames, { force, owner }),
		force,
	);
	reportPrune(
		"~/.claude/commands",
		pruneCommands(path.join(targetBase, "commands"), [], { force, owner }),
		force,
	);
}
