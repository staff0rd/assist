import { execFileSync } from "node:child_process";
import { relative } from "node:path";
import { docsPaths } from "../docsPaths";

export function readHeadSource(path: string): string | undefined {
	const rel = relative(docsPaths.repoRoot, path).replace(/\\/g, "/");
	try {
		return execFileSync("git", ["show", `HEAD:${rel}`], {
			cwd: docsPaths.repoRoot,
			encoding: "utf8",
			stdio: ["ignore", "pipe", "ignore"],
		});
	} catch {
		return undefined;
	}
}
