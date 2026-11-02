import { execSync } from "node:child_process";
import { findUnmergedPaths } from "./findConflictMarkers";
import { listStashShas, recoverAutostash } from "./recoverAutostash";

function git(args: string, input?: string): string {
	return execSync(`git --literal-pathspecs ${args}`, {
		encoding: "utf8",
		input,
		maxBuffer: 256 * 1024 * 1024,
		stdio: "pipe",
	});
}

function restoreIndex(paths: string[], patch: string): void {
	const pathspec = paths.join("\0");
	git("reset -q --pathspec-from-file=- --pathspec-file-nul", pathspec);
	try {
		git("apply --cached --binary", patch);
	} catch {
		git("add -A --pathspec-from-file=- --pathspec-file-nul", pathspec);
	}
}

export function pullKeepingIndex(): void {
	const paths = git("diff --cached --name-only -z --no-renames")
		.split("\0")
		.filter(Boolean);
	const patch = git("diff-index --cached -p --binary --no-renames HEAD");
	const head = git("rev-parse --verify -q HEAD || true").trim();
	const stashesBefore = listStashShas();
	try {
		execSync("git pull --autostash", { stdio: "inherit" });
	} finally {
		recoverAutostash(head, stashesBefore);
	}
	if (paths.length === 0 || findUnmergedPaths().length > 0) return;
	restoreIndex(paths, patch);
}
