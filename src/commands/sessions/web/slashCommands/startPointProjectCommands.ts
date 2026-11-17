import { findRepoRoot } from "../../../../shared/findRepoRoot";
import { mainWorktree } from "../../daemon/worktree/listWorktreePaths";
import { worktreeConfigFor } from "../../daemon/worktree/worktreeConfigFor";
import { worktreeStartPoint } from "../../daemon/worktree/worktreeStartPoint";
import { mergeSourceCommands } from "./mergeSourceCommands";
import type { SlashCommand } from "./readSlashCommands";
import { readSlashCommandsAtRef } from "./readSlashCommandsAtRef";

export async function startPointProjectCommands(
	cwd: string,
	projectDirs: string[],
): Promise<SlashCommand[] | null> {
	const repoRoot = findRepoRoot(cwd) ?? cwd;
	const cfg = worktreeConfigFor(repoRoot);
	if (!cfg.enabled) return null;
	const clone = mainWorktree(repoRoot) ?? repoRoot;
	const { ref } = await worktreeStartPoint(clone, cfg.trunk);
	if (ref === "HEAD") return null;
	const lists: SlashCommand[][] = [];
	for (const dir of projectDirs) {
		const list = await readSlashCommandsAtRef(clone, ref, "project", dir);
		if (!list) return null;
		lists.push(list);
	}
	return mergeSourceCommands(lists);
}
