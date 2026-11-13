import { execGit } from "./execGit";
import type { ChangeGroup } from "./itemChangeSet";
import type { GitStatusCounts } from "./parseGitStatus";

async function headCommit(cwd: string): Promise<string> {
	try {
		return (await execGit(cwd, ["rev-parse", "HEAD"])).trim();
	} catch {
		return "";
	}
}

export async function itemCountsFingerprint(
	cwd: string,
	groups: ChangeGroup[],
	uncommitted: GitStatusCounts,
): Promise<string> {
	return JSON.stringify([await headCommit(cwd), groups, uncommitted]);
}
