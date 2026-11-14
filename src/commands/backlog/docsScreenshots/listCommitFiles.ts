import { execFileSync } from "node:child_process";
import { getProjectRoot } from "../../../shared/loadConfig";

export function listCommitFiles(sha: string): string[] {
	try {
		return execFileSync(
			"git",
			["diff-tree", "--no-commit-id", "--name-only", "-r", "--root", sha],
			{ cwd: getProjectRoot(), encoding: "utf8", stdio: "pipe" },
		)
			.split("\n")
			.filter(Boolean);
	} catch {
		return [];
	}
}
