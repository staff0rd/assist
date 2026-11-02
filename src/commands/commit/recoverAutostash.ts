import { execSync } from "node:child_process";
import { findUnmergedPaths } from "./findConflictMarkers";

function git(args: string): string {
	return execSync(`git ${args}`, {
		encoding: "utf8",
		stdio: ["pipe", "pipe", "pipe"],
	});
}

export function listStashShas(): string[] {
	return git("stash list --format=%H").split("\n").filter(Boolean);
}

function findStrandedAutostash(head: string, before: string[]): string | null {
	const known = new Set(before);
	for (const line of git("stash list --format='%H %P %gs'").split("\n")) {
		const [sha, parent, ...subject] = line.split(" ");
		if (!sha || known.has(sha) || parent !== head) continue;
		if (subject.join(" ").includes("autostash")) return sha;
	}
	return null;
}

function stashRef(sha: string): string {
	const index = listStashShas().indexOf(sha);
	return index === -1 ? sha : `stash@{${index}}`;
}

function strandedError(sha: string, reason: string): Error {
	const unmerged = findUnmergedPaths();
	const guidance =
		unmerged.length > 0
			? `They were applied with conflicts in ${unmerged.join(", ")}: resolve those, drop that entry by its SHA, then re-run the commit.`
			: `Restore them with \`git stash apply ${sha}\`, resolve any conflicts, drop that entry by its SHA, then re-run the commit.`;
	const message = [
		`Error: refusing to commit — git pull --autostash left your local changes in stash entry ${stashRef(sha)} (${sha}): ${reason}`,
		guidance,
		"Nothing was committed or pushed.",
	].join("\n");
	console.error(message);
	return new Error(message);
}

function dropBySha(sha: string): void {
	const index = listStashShas().indexOf(sha);
	if (index !== -1) git(`stash drop -q stash@{${index}}`);
}

export function recoverAutostash(head: string, before: string[]): void {
	const sha = findStrandedAutostash(head, before);
	if (!sha) return;
	if (findUnmergedPaths().length > 0) {
		throw strandedError(sha, "applying it hit conflicts");
	}
	try {
		git(`stash apply -q ${sha}`);
	} catch {
		throw strandedError(sha, "reapplying it failed");
	}
	dropBySha(sha);
	console.log(`Reapplied autostash ${sha} that git pull left in the stash.`);
}
