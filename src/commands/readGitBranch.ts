import { readFileSync, statSync } from "node:fs";
import { isAbsolute, join, resolve } from "node:path";

function resolveGitDir(cwd: string): string | null {
	const dotGit = join(cwd, ".git");
	let stat: ReturnType<typeof statSync>;
	try {
		stat = statSync(dotGit);
	} catch {
		return null;
	}

	if (stat.isDirectory()) {
		return dotGit;
	}

	let contents: string;
	try {
		contents = readFileSync(dotGit, "utf8");
	} catch {
		return null;
	}

	const match = /^gitdir:\s*(.+)$/m.exec(contents.trim());
	if (!match) {
		return null;
	}

	const gitDir = match[1].trim();
	return isAbsolute(gitDir) ? gitDir : resolve(cwd, gitDir);
}

export function readGitBranch(cwd: string): string | null {
	const gitDir = resolveGitDir(cwd);
	if (!gitDir) {
		return null;
	}

	let head: string;
	try {
		head = readFileSync(join(gitDir, "HEAD"), "utf8");
	} catch {
		return null;
	}

	const match = /^ref:\s*refs\/heads\/(.+)$/m.exec(head.trim());
	return match ? match[1] : null;
}
