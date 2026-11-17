import { execFileSync } from "node:child_process";
import { clearStalePrBranch } from "./clearStalePrBranch";
import { gitSyncOrNull } from "../sessions/daemon/worktree/git";
import { moveToPrCheckoutTree } from "./moveToPrCheckoutTree";
import { prCliCommands } from "./prCliCommands";
import { prHeadBranch } from "./prHeadBranch";
import { failCheckout } from "./failCheckout";
import { reinstallChangedDeps } from "./reinstallChangedDeps";
import { moveToExistingCheckout } from "./moveToExistingCheckout";

function currentBranch(): string | null {
	return gitSyncOrNull(process.cwd(), ["rev-parse", "--abbrev-ref", "HEAD"]);
}

export async function checkoutPr(number: string): Promise<void> {
	const commands = prCliCommands(number, process.cwd());
	const headRef = prHeadBranch(commands);
	if (headRef && (await moveToExistingCheckout(number, headRef, commands)))
		return;
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
