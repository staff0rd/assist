import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { docsPaths } from "../docsPaths";

function git(args: string[]): string[] {
	try {
		return execFileSync("git", [...args, "-z", "--", pagesPath()], {
			cwd: docsPaths.repoRoot,
			encoding: "utf8",
			stdio: ["ignore", "pipe", "ignore"],
		})
			.split("\0")
			.filter(Boolean);
	} catch {
		return [];
	}
}

function pagesPath(): string {
	return relative(docsPaths.repoRoot, docsPaths.pagesDir).replace(/\\/g, "/");
}

export type ChangedSource = { id: string; version: string };

function versionOf(path: string): string {
	return createHash("sha1")
		.update(readFileSync(join(docsPaths.repoRoot, path)))
		.digest("hex")
		.slice(0, 12);
}

export function changedDocsPages(): ChangedSource[] {
	const paths = [
		...git(["diff", "--name-only", "HEAD"]),
		...git(["ls-files", "--others", "--exclude-standard"]),
	];
	const sources = new Map<string, string>();
	for (const path of paths) {
		if (!existsSync(join(docsPaths.repoRoot, path))) continue;
		const match = /^(.+)\.mdx?$/.exec(path.slice(pagesPath().length + 1));
		if (match) sources.set(match[1], versionOf(path));
	}
	return [...sources].map(([id, version]) => ({ id, version }));
}
