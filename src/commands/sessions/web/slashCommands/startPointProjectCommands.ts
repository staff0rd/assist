import { findRepoRoot } from "../../../../shared/findRepoRoot";
import { mainWorktree } from "../../daemon/worktree/listWorktreePaths";
import { worktreeConfigFor } from "../../daemon/worktree/worktreeConfigFor";
import { worktreeStartPoint } from "../../daemon/worktree/worktreeStartPoint";
import type { SlashCommand } from "./readSlashCommands";
import { readSlashCommandsAtRef } from "./readSlashCommandsAtRef";

export async function startPointProjectCommands(
	cwd: string,
): Promise<SlashCommand[] | null> {
	const repoRoot = findRepoRoot(cwd) ?? cwd;
	const cfg = worktreeConfigFor(repoRoot);
	if (!cfg.enabled) return null;
	const clone = mainWorktree(repoRoot) ?? repoRoot;
	const { ref } = await worktreeStartPoint(clone, cfg.trunk);
	if (ref === "HEAD") return null;
	return readSlashCommandsAtRef(clone, ref, "project");
}
