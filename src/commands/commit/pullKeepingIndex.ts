import { execFileSync, execSync } from "node:child_process";
import { findUnmergedPaths } from "./findConflictMarkers";
import { listStashShas, recoverAutostash } from "./recoverAutostash";

function git(args: string[], input?: string): string {
	return execFileSync("git", ["--literal-pathspecs", ...args], {
		encoding: "utf8",
		input,
		maxBuffer: 256 * 1024 * 1024,
		stdio: "pipe",
	});
}

function currentHead(): string {
	try {
		return git(["rev-parse", "--verify", "-q", "HEAD"]).trim();
	} catch {
		return "";
	}
}

function restoreIndex(paths: string[], patch: string): void {
	const pathspec = paths.join("\0");
	const fromStdin = ["--pathspec-from-file=-", "--pathspec-file-nul"];
	git(["reset", "-q", ...fromStdin], pathspec);
	try {
		git(["apply", "--cached", "--binary"], patch);
	} catch {
		git(["add", "-A", ...fromStdin], pathspec);
	}
}

export function pullKeepingIndex(): void {
	const paths = git(["diff", "--cached", "--name-only", "-z", "--no-renames"])
		.split("\0")
		.filter(Boolean);
	const patch = git([
		"diff-index",
		"--cached",
		"-p",
		"--binary",
		"--no-renames",
		"HEAD",
	]);
	const head = currentHead();
	const stashesBefore = listStashShas();
	try {
		execSync("git pull --autostash", { stdio: "inherit" });
	} finally {
		recoverAutostash(head, stashesBefore);
	}
	if (paths.length === 0 || findUnmergedPaths().length > 0) return;
	restoreIndex(paths, patch);
}
