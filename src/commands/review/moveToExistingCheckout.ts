import { baseRepoFetchSource } from "../prs/baseRepoFetchSource";
import { appendDaemonLog } from "../sessions/daemon/appendDaemonLog";
import { gitSyncOrNull } from "../sessions/daemon/worktree/git";
import type { PrCliCommands } from "./prCliCommands";
import { reportCwdToDaemon } from "./reportCwdToDaemon";
import { worktreeHoldingBranch } from "./worktreeHoldingBranch";
import { syncReusedCheckout } from "./syncReusedCheckout";

export async function moveToExistingCheckout(
	number: string,
	headRef: string,
	commands: PrCliCommands,
): Promise<boolean> {
	if (!(await enterExistingCheckout(number, headRef))) return false;
	const source =
		commands.checkout.file === "az"
			? { remote: "origin", ref: `refs/heads/${headRef}` }
			: { remote: baseRepoFetchSource(), ref: `refs/pull/${number}/head` };
	await syncReusedCheckout(number, headRef, source);
	return true;
}

async function enterExistingCheckout(
	number: string,
	headRef: string,
): Promise<boolean> {
	if (currentBranch() === headRef) {
		console.log(`Already on ${headRef} for PR #${number}; reviewing here.`);
		return true;
	}
	const holder = worktreeHoldingBranch(process.cwd(), headRef);
	if (!holder) return false;
	process.chdir(holder);
	console.log(`PR #${number} is checked out in ${holder}; reviewing there.`);
	appendDaemonLog(`pr #${number} review moved to its checkout ${holder}`);
	await reportCwdToDaemon(holder);
	return true;
}

function currentBranch(): string | null {
	return gitSyncOrNull(process.cwd(), ["rev-parse", "--abbrev-ref", "HEAD"]);
}
