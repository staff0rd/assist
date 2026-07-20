import { execSync } from "node:child_process";
import path from "node:path";

export type MaintainabilityGitState = {
	shrunkFiles: Set<string>;
	newFileCreated: boolean;
};

function git(command: string): string {
	return execSync(command, { encoding: "utf8" });
}

function toAbsolute(root: string, repoRelative: string): string {
	return path.resolve(root, repoRelative);
}

function collectShrunkFiles(root: string): Set<string> {
	const shrunk = new Set<string>();
	const numstat = git("git diff --numstat HEAD").trim();
	if (numstat === "") return shrunk;
	for (const line of numstat.split("\n")) {
		const [addedRaw, removedRaw, ...rest] = line.split("\t");
		const file = rest.join("\t");
		const added = Number.parseInt(addedRaw, 10);
		const removed = Number.parseInt(removedRaw, 10);
		if (Number.isNaN(added) || Number.isNaN(removed)) continue;
		if (removed > added) shrunk.add(toAbsolute(root, file));
	}
	return shrunk;
}

function hasNewSourceFile(): boolean {
	const status = git("git status --porcelain --untracked-files=all").trim();
	if (status === "") return false;
	for (const line of status.split("\n")) {
		const code = line.slice(0, 2);
		const file = line.slice(3);
		const isNew = code.includes("A") || code.includes("?");
		if (isNew && (file.endsWith(".ts") || file.endsWith(".tsx"))) return true;
	}
	return false;
}

export function getMaintainabilityGitState(): MaintainabilityGitState {
	try {
		const root = git("git rev-parse --show-toplevel").trim();
		return {
			shrunkFiles: collectShrunkFiles(root),
			newFileCreated: hasNewSourceFile(),
		};
	} catch {
		return { shrunkFiles: new Set(), newFileCreated: false };
	}
}
