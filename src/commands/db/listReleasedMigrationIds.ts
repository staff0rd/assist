import { execFileSync } from "node:child_process";

const MIGRATIONS_DIR = "src/shared/db/migrations/";
const MIGRATION_ID = /^migration(\d+)[A-Za-z0-9]*\.ts$/;

function git(cwd: string, ...args: string[]): string {
	return execFileSync("git", args, {
		cwd,
		encoding: "utf8",
		stdio: ["ignore", "pipe", "ignore"],
		windowsHide: true,
	});
}

export function listReleasedMigrationIds(repo: string): Set<number> | null {
	try {
		git(repo, "fetch", "--quiet", "origin", "main");
	} catch {}
	let listing: string;
	try {
		listing = git(
			repo,
			"ls-tree",
			"--name-only",
			"origin/main",
			"--",
			MIGRATIONS_DIR,
		);
	} catch {
		return null;
	}
	const ids = new Set<number>();
	for (const line of listing.split("\n")) {
		const match = MIGRATION_ID.exec(line.trim().slice(MIGRATIONS_DIR.length));
		if (match) ids.add(Number(match[1]));
	}
	return ids;
}
