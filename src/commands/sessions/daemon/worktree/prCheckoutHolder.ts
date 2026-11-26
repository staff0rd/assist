import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import { prCliCommands } from "../../../review/prCliCommands";
import { daemonLog } from "../daemonLog";
import { gitOrNull } from "./git";
import { prCheckoutNumber } from "./prCheckoutNumber";
import { worktreeWithBranch } from "./worktreeWithBranch";

function headBranchCommand(number: string, cwd: string) {
	try {
		return prCliCommands(number, cwd).headBranch;
	} catch (error) {
		daemonLog(
			`pr #${number} head branch lookup skipped in ${cwd}: ${
				error instanceof Error ? error.message : String(error)
			}`,
		);
		return null;
	}
}

function prHeadBranch(number: string, cwd: string): Promise<string | null> {
	const headBranch = headBranchCommand(number, cwd);
	if (!headBranch) return Promise.resolve(null);
	return new Promise((resolve) => {
		execFile(
			headBranch.file,
			headBranch.args,
			{ cwd, encoding: "utf8", windowsHide: true },
			(error, stdout) => resolve(error ? null : headBranch.parse(stdout)),
		);
	});
}

export async function prCheckoutHolder(
	assistArgs: string[],
	cwd: string | undefined,
): Promise<string | undefined> {
	const number = prCheckoutNumber(assistArgs);
	if (!number || !cwd || !existsSync(cwd)) return undefined;
	const headRef = await prHeadBranch(number, cwd);
	if (!headRef) return undefined;
	const listing = await gitOrNull(cwd, ["worktree", "list", "--porcelain"]);
	const holder = listing ? worktreeWithBranch(listing, headRef) : null;
	if (!holder || !existsSync(holder)) return undefined;
	daemonLog(
		`pr #${number} assist ${assistArgs[0]} launched in its checkout ${holder}: head branch ${headRef} is already checked out there, so no worktree is allocated`,
	);
	return holder;
}
