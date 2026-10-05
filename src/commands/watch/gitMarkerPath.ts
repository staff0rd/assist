import { resolve } from "node:path";
import { runGit } from "./resolveUpstream";

export function gitMarkerPath(name: string, cwd?: string): string {
	return resolve(
		cwd ?? process.cwd(),
		runGit(["rev-parse", "--git-path", name], cwd),
	);
}
