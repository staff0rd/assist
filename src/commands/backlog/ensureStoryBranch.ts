import { execFileSync, execSync } from "node:child_process";
import { loadConfig } from "../../shared/loadConfig";
import { worktreePlaceholderBranch } from "../../shared/worktreePlaceholderBranch";
import { createBranch } from "../branch/createBranch";
import { generateBranchSlug } from "../branch/generateBranchSlug";
import { appendDaemonLog } from "../sessions/daemon/appendDaemonLog";
import type { BacklogItem } from "./types";

export async function ensureStoryBranch(item: BacklogItem): Promise<void> {
	const config = loadConfig();
	if (config.prs?.required === false) {
		log(item, "prs.required is false; left the session on its current branch");
		return;
	}
	const recorded = recordedBranch(item);
	if (recorded) {
		adoptRecordedBranch(item, recorded);
		return;
	}

	process.env.ASSIST_BACKLOG_ITEM_ID = String(item.id);
	const slug = await generateBranchSlug(item.name);
	const { branchName } = await createBranch({ slug, jira: item.jiraKey });
	log(item, `prs.required on and no branch recorded; created ${branchName}`);
}

function recordedBranch(item: BacklogItem): string | undefined {
	return (item.gitRefs ?? []).find((ref) => ref.kind === "branch")?.ref;
}

function adoptRecordedBranch(item: BacklogItem, branch: string): void {
	const parked = worktreePlaceholderBranch();
	if (!parked) {
		log(
			item,
			`branch ${branch} already recorded; left the session on its current branch`,
		);
		return;
	}
	try {
		execSync("git fetch", { stdio: "ignore" });
	} catch {}
	try {
		execFileSync("git", ["switch", branch], { stdio: "pipe" });
		log(
			item,
			`branch ${branch} already recorded; switched off ${parked} onto it`,
		);
	} catch (error) {
		log(
			item,
			`branch ${branch} already recorded but the worktree stayed on ${parked}: ${message(error)}`,
		);
	}
}

function log(item: BacklogItem, outcome: string): void {
	appendDaemonLog(`backlog run ${item.id}: ${outcome}`);
}

function message(error: unknown): string {
	return error instanceof Error ? error.message : String(error);
}
