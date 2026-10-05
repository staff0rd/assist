import { execSync } from "node:child_process";
import { basename } from "node:path";
import { linkedWorktree } from "../../shared/linkedWorktree";
import { loadConfig } from "../../shared/loadConfig";
import { shellQuote } from "../../shared/shellQuote";
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
	const parked = worktreeBranchInPlay();
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
		execSync(`git switch ${shellQuote(branch)}`, { stdio: "pipe" });
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

function worktreeBranchInPlay(): string | null {
	const tree = linkedWorktree(process.cwd());
	if (!tree) return null;
	const head = currentBranch();
	return head === basename(tree.root) ? head : null;
}

function currentBranch(): string | null {
	try {
		return execSync("git rev-parse --abbrev-ref HEAD", {
			encoding: "utf8",
			stdio: ["ignore", "pipe", "ignore"],
		}).trim();
	} catch {
		return null;
	}
}

function log(item: BacklogItem, outcome: string): void {
	appendDaemonLog(`backlog run ${item.id}: ${outcome}`);
}

function message(error: unknown): string {
	return error instanceof Error ? error.message : String(error);
}
