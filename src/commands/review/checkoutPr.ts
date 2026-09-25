import { execFileSync } from "node:child_process";
import chalk from "chalk";
import { appendDaemonLog } from "../sessions/daemon/appendDaemonLog";
import { gitSyncOrNull } from "../sessions/daemon/worktree/git";
import { moveToPrCheckoutTree } from "./moveToPrCheckoutTree";
import { prHeadBranch } from "./prHeadBranch";
import { reportCwdToDaemon } from "./reportCwdToDaemon";
import { worktreeHoldingBranch } from "./worktreeHoldingBranch";

function currentBranch(): string | null {
	return gitSyncOrNull(process.cwd(), ["rev-parse", "--abbrev-ref", "HEAD"]);
}

async function moveToExistingCheckout(
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

export async function checkoutPr(number: string): Promise<void> {
	const headRef = prHeadBranch(number);
	if (headRef && (await moveToExistingCheckout(number, headRef))) return;
	await moveToPrCheckoutTree();
	try {
		execFileSync("gh", ["pr", "checkout", number], { stdio: "inherit" });
	} catch {
		console.error(chalk.red(`gh pr checkout ${number} failed; aborting.`));
		process.exit(1);
	}
}
