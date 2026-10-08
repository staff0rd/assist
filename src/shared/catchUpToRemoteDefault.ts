import { execSync } from "node:child_process";
import chalk from "chalk";
import { remoteDefaultBranch } from "../commands/sessions/daemon/worktree/remoteDefaultBranch";

export function catchUpToRemoteDefault(): void {
	try {
		execSync("git fetch", { stdio: "inherit" });
	} catch {
		skip("git fetch failed");
		return;
	}
	const ref = `origin/${remoteDefaultBranch(process.cwd())}`;
	if (!succeeds(`git rev-parse --verify --quiet ${ref}`)) {
		skip(`the current branch has no upstream and there is no ${ref}`);
		return;
	}
	if (!succeeds(`git merge-base --is-ancestor HEAD ${ref}`)) {
		skip(
			`the current branch has no upstream and has commits of its own not on ${ref}`,
		);
		return;
	}
	try {
		execSync(`git merge --ff-only ${ref}`, { stdio: "inherit" });
	} catch {
		console.error(chalk.red(`git fast-forward to ${ref} failed; aborting.`));
		process.exit(1);
	}
}

function skip(reason: string): void {
	console.warn(chalk.yellow(`git pull skipped: ${reason}. Continuing.`));
}

function succeeds(command: string): boolean {
	try {
		execSync(command, { stdio: "ignore" });
		return true;
	} catch {
		return false;
	}
}
