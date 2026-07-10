import { loadConfig } from "../../shared/loadConfig";
import { createBranch } from "../branch/createBranch";
import { generateBranchSlug } from "../branch/generateBranchSlug";
import { appendDaemonLog } from "../sessions/daemon/appendDaemonLog";
import type { BacklogItem } from "./types";

export async function ensureStoryBranch(item: BacklogItem): Promise<void> {
	const config = loadConfig();
	if (!config.prs?.required) return;
	if (hasBranchRef(item)) return;

	process.env.ASSIST_BACKLOG_ITEM_ID = String(item.id);
	const slug = await generateBranchSlug(item.name);
	const { branchName } = await createBranch({ slug, jira: item.jiraKey });
	appendDaemonLog(
		`backlog run ${item.id}: prs.required set and no branch recorded; created ${branchName}`,
	);
}

function hasBranchRef(item: BacklogItem): boolean {
	return (item.gitRefs ?? []).some((ref) => ref.kind === "branch");
}
