import { existsSync } from "node:fs";
import type { Leftover } from "./Leftover";
import {
	clearLeftover,
	readReapedWorktreeRegistry,
} from "./readWorktreeRegistry";

/** Leftovers recorded on reaped worktrees.json records whose path is still on
 * disk; records whose path has since been removed are cleared. */
export function listLeftovers(): Leftover[] {
	const leftovers: Leftover[] = [];
	for (const { path, leftover } of readReapedWorktreeRegistry()) {
		if (!leftover) continue;
		if (existsSync(path)) leftovers.push({ path, reason: leftover });
		else clearLeftover(path);
	}
	return leftovers;
}
