import { execSync } from "node:child_process";
import chalk from "chalk";
import { waitForIndexUnlocked } from "./waitForIndexUnlocked";

const MERGE_ATTEMPTS = 3;
const LOCK_WAIT_MS = 10_000;

export function fastForwardTo(ref: string): void {
	for (let attempt = 1; ; attempt++) {
		waitForIndexUnlocked(LOCK_WAIT_MS);
		try {
			execSync(`git merge --ff-only ${ref}`, {
				stdio: ["inherit", "inherit", "pipe"],
			});
			return;
		} catch (error) {
			const stderr = String((error as { stderr?: unknown }).stderr ?? "");
			process.stderr.write(stderr);
			if (attempt >= MERGE_ATTEMPTS || !stderr.includes("index.lock"))
				throw error;
			console.warn(
				chalk.yellow("git index.lock is held by another process; retrying."),
			);
		}
	}
}
