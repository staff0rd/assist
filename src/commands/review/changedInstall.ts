import { join } from "node:path";
import { gitSyncOrNull } from "../sessions/daemon/worktree/git";

const LOCKFILES = [
	"package-lock.json",
	"pnpm-lock.yaml",
	"yarn.lock",
	"bun.lockb",
];

function lockfileChanged(tree: string, before: string, rel: string): boolean {
	const files = LOCKFILES.map((name) => join(rel, name));
	const changed = gitSyncOrNull(tree, [
		"diff",
		"--name-only",
		before,
		"HEAD",
		"--",
		...files,
	]);
	return Boolean(changed);
}

export function changedInstall(
	tree: string,
	before: string,
	install: boolean | string | string[],
): boolean | string | string[] {
	if (Array.isArray(install))
		return install.filter((rel) => lockfileChanged(tree, before, rel));
	if (install === false) return false;
	return lockfileChanged(tree, before, ".") ? install : false;
}
