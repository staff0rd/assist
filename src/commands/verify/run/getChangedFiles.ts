import { execFileSync } from "node:child_process";
import { remoteDefaultRef } from "./remoteDefaultRef";

function gitLines(...args: string[]): string[] {
	const output = execFileSync("git", args, {
		encoding: "utf8",
		stdio: ["pipe", "pipe", "pipe"],
	}).trim();
	return output === "" ? [] : output.split("\n");
}

function diffBase(): string {
	const ref = remoteDefaultRef();
	if (!ref) return "HEAD";
	try {
		return gitLines("merge-base", ref, "HEAD")[0] ?? "HEAD";
	} catch {
		return "HEAD";
	}
}

export function getChangedFiles(): string[] {
	const tracked = gitLines("diff", "--name-only", diffBase());
	const untracked = gitLines(
		"ls-files",
		"--others",
		"--exclude-standard",
		"--full-name",
		"--",
		":/",
	);
	return [...new Set([...tracked, ...untracked])];
}
