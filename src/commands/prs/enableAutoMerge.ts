import { execFileSync } from "node:child_process";
import { getCurrentBranch } from "./shared";

export function enableAutoMerge(): void {
	try {
		execFileSync(
			"gh",
			["pr", "merge", getCurrentBranch(), "--auto", "--squash"],
			{ stdio: "inherit" },
		);
	} catch (error) {
		console.error(
			`Warning: could not enable auto-merge: ${error instanceof Error ? error.message : String(error)}`,
		);
	}
}
