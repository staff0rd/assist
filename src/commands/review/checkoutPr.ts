import { execFileSync } from "node:child_process";
import { clearStalePrBranch } from "./clearStalePrBranch";
import { appendDaemonLog } from "../sessions/daemon/appendDaemonLog";
import { gitSyncOrNull } from "../sessions/daemon/worktree/git";
import { moveToPrCheckoutTree } from "./moveToPrCheckoutTree";
import { prCliCommands } from "./prCliCommands";
import { prHeadBranch } from "./prHeadBranch";
import { reportCwdToDaemon } from "./reportCwdToDaemon";
import { worktreeHoldingBranch } from "./worktreeHoldingBranch";
import { failCheckout } from "./failCheckout";
import { reinstallChangedDeps } from "./reinstallChangedDeps";

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
	const commands = prCliCommands(number, process.cwd());
	const headRef = prHeadBranch(commands);
	if (headRef && (await moveToExistingCheckout(number, headRef))) return;
	await moveToPrCheckoutTree();
	const branch = currentBranch();
	const from =
		branch === "HEAD"
			? gitSyncOrNull(process.cwd(), ["rev-parse", "HEAD"])
			: branch;
	const before = gitSyncOrNull(process.cwd(), ["rev-parse", "HEAD"]);
	const stale = headRef ? clearStalePrBranch(process.cwd(), headRef) : "absent";
	try {
		execFileSync(commands.checkout.file, commands.checkout.args, {
			stdio: "inherit",
		});
	} catch {
		failCheckout(number, headRef, stale, from, commands.checkout);
	}
	await reinstallChangedDeps(process.cwd(), before);
}
