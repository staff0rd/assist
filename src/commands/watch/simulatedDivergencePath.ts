import { resolve } from "node:path";
import { runGit } from "./resolveUpstream";

export function simulatedDivergencePath(cwd?: string): string {
	return resolve(
		cwd ?? process.cwd(),
		runGit(["rev-parse", "--git-path", "assist-simulate-divergence"], cwd),
	);
}
