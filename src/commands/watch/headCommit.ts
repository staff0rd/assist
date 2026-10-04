import { runGit } from "./resolveUpstream";

export function headCommit(cwd: string): string | undefined {
	try {
		return runGit(["rev-parse", "HEAD"], cwd);
	} catch {
		return undefined;
	}
}
