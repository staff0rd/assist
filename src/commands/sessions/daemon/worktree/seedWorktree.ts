import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { daemonLog } from "../daemonLog";
import { runInstall } from "./runInstall";
import type { SeedOutcome } from "./SeedOutcome";
import { worktreeConfigFor } from "./worktreeConfigFor";

export function seedWorktree(
	worktreePath: string,
	clone: string,
	onSeeded: (outcome: SeedOutcome) => void = () => {},
	onInstalling?: (path?: string) => void,
): void {
	const cfg = worktreeConfigFor(clone);
	copyConfigFiles(worktreePath, clone, cfg.copy);
	runInstall(worktreePath, clone, cfg.install, onSeeded, onInstalling);
}

function copyConfigFiles(
	worktreePath: string,
	clone: string,
	copy: string[],
): void {
	for (const rel of copy) {
		const src = join(clone, rel);
		if (!existsSync(src)) continue;
		const dest = join(worktreePath, rel);
		try {
			mkdirSync(dirname(dest), { recursive: true });
			copyFileSync(src, dest);
			daemonLog(`worktree ${worktreePath} seeded ${rel}`);
		} catch (error) {
			daemonLog(
				`worktree ${worktreePath} failed to seed ${rel}: ${message(error)}`,
			);
		}
	}
}

function message(error: unknown): string {
	return error instanceof Error ? error.message : String(error);
}
