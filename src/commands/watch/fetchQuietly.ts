import { execFileSync } from "node:child_process";
import { gitFailureReason } from "./gitFailureReason";

const MIN_FETCH_TIMEOUT_MS = 60_000;

export function fetchQuietly(
	cwd: string | undefined,
	intervalMs: number,
): string | undefined {
	try {
		execFileSync("git", ["fetch", "--quiet"], {
			stdio: ["pipe", "pipe", "pipe"],
			cwd,
			timeout: Math.max(intervalMs, MIN_FETCH_TIMEOUT_MS),
		});
		return undefined;
	} catch (error) {
		return gitFailureReason(error).replace(/\s*\n\s*/g, " · ");
	}
}
