import { execSync } from "node:child_process";
import { basename } from "node:path";

const MIGRATION_FILE = /^migration\d+[A-Za-z0-9]*\.ts$/;

export function readBaselineMigrations(
	repoRelativeDir: string,
	ref: string,
): Map<string, string> {
	const baseline = new Map<string, string>();

	let listing: string;
	try {
		listing = execSync(
			`git ls-tree -r --name-only "${ref}" -- "${repoRelativeDir}"`,
			{ encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] },
		);
	} catch {
		return baseline;
	}

	const paths = listing
		.split("\n")
		.map((line) => line.trim())
		.filter(Boolean)
		.filter((path) => MIGRATION_FILE.test(basename(path)));

	for (const path of paths) {
		try {
			const content = execSync(`git show "${ref}:${path}"`, {
				encoding: "utf8",
				maxBuffer: 16 * 1024 * 1024,
				stdio: ["pipe", "pipe", "pipe"],
			});
			baseline.set(basename(path), content);
		} catch {}
	}

	return baseline;
}
