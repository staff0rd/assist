import { execFileSync } from "node:child_process";
import chalk from "chalk";
import { clearStalePrBranch, type StalePrBranch } from "./clearStalePrBranch";
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

function failCheckout(
	number: string,
	headRef: string | null,
	stale: StalePrBranch,
	from: string | null,
): never {
	if (headRef && from && from !== headRef && currentBranch() === headRef)
		gitSyncOrNull(process.cwd(), ["checkout", "--quiet", from]);
	if (headRef && stale === "local-work")
		console.error(
			chalk.red(
				`Local branch ${headRef} has commits that are not on the remote and cannot fast-forward to PR #${number}'s head; push or reset ${headRef}, then retry.`,
			),
		);
	console.error(chalk.red(`gh pr checkout ${number} failed; aborting.`));
	process.exit(1);
}

export async function checkoutPr(number: string): Promise<void> {
	const headRef = prHeadBranch(number);
	if (headRef && (await moveToExistingCheckout(number, headRef))) return;
	await moveToPrCheckoutTree();
	const branch = currentBranch();
	const from =
		branch === "HEAD"
			? gitSyncOrNull(process.cwd(), ["rev-parse", "HEAD"])
			: branch;
	const stale = headRef ? clearStalePrBranch(process.cwd(), headRef) : "absent";
	try {
		execFileSync("gh", ["pr", "checkout", number], { stdio: "inherit" });
	} catch {
		failCheckout(number, headRef, stale, from);
	}
}
