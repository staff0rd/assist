import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
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

export function changedDocsPages(): string[] {
	const paths = [
		...git(["diff", "--name-only", "HEAD"]),
		...git(["ls-files", "--others", "--exclude-standard"]),
	];
	const ids = paths
		.filter((path) => existsSync(join(docsPaths.repoRoot, path)))
		.map((path) => /^(.+)\.mdx?$/.exec(path.slice(pagesPath().length + 1)))
		.filter((match) => match !== null)
		.map((match) => match[1]);
	return [...new Set(ids)];
}
