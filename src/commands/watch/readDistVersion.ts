import { readFileSync } from "node:fs";
import { join } from "node:path";
import { runGit } from "./resolveUpstream";

export function readDistVersion(cwd?: string): string | undefined {
	try {
		const root = runGit(["rev-parse", "--show-toplevel"], cwd);
		return readFileSync(join(root, "dist", "built-version"), "utf8").trim();
	} catch {
		return undefined;
	}
}
