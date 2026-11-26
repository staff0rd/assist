import { execSync } from "node:child_process";
import chalk from "chalk";
import { resolveDefaultBranch } from "../commands/branch/resolveDefaultBranch";
import { ensureBaseRepoRemote } from "../commands/prs/ensureBaseRepoRemote";
import { remoteDefaultBranch } from "../commands/sessions/daemon/worktree/remoteDefaultBranch";
import { fastForwardTo } from "./fastForwardTo";

export async function catchUpToRemoteDefault(): Promise<void> {
	try {
		execSync("git fetch", { stdio: "inherit" });
	} catch {
		skip("git fetch failed");
		return;
	}
	const ref = await remoteDefaultRef();
	if (!ref) {
		skip("fetching the parent repo failed");
		return;
	}
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
		fastForwardTo(ref);
	} catch {
		console.error(chalk.red(`git fast-forward to ${ref} failed; aborting.`));
		process.exit(1);
	}
}

async function remoteDefaultRef(): Promise<string | null> {
	const remote = baseRepoRemote();
	if (remote === "origin")
		return `origin/${await remoteDefaultBranch(process.cwd())}`;
	if (!succeeds(`git fetch ${remote}`)) return null;
	return `${remote}/${resolveDefaultBranch(undefined, undefined, remote)}`;
}

function baseRepoRemote(): string {
	try {
		return ensureBaseRepoRemote();
	} catch {
		return "origin";
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
