import { execFileSync } from "node:child_process";
import type { AssistConfig } from "../../shared/types";
import { worktreePlaceholderBranch } from "../../shared/worktreePlaceholderBranch";
import { createBranch } from "../branch/createBranch";
import { generateBranchSlug } from "../branch/generateBranchSlug";
import { resolveDefaultBranch } from "../branch/resolveDefaultBranch";
import { placeholderBranchSource } from "./placeholderBranchSource";

export async function moveOffPlaceholder(
	message: string,
	config: AssistConfig,
): Promise<void> {
	if (config.worktree?.trunk === true) return;
	const placeholder = worktreePlaceholderBranch();
	if (!placeholder) return;
	const { text, jira } = await placeholderBranchSource(message);
	const slug = await generateBranchSlug(text);
	const { branchName } = await createBranch({
		slug,
		jira,
		from: "HEAD",
		unique: true,
	});
	trackDefaultBranch(config);
	console.log(`Moved off placeholder ${placeholder} onto ${branchName}`);
}

// A branch cut from a local ref has no upstream, so pushCommit would push
// plainly and fail; tracking the mainline makes it raise its own remote branch.
function trackDefaultBranch(config: AssistConfig): void {
	const base = `origin/${resolveDefaultBranch(config.branch?.defaultBranch)}`;
	try {
		execFileSync("git", ["branch", "--set-upstream-to", base], {
			stdio: "ignore",
		});
	} catch {}
}
