import { execSync } from "node:child_process";
import { getProjectRoot } from "../../shared/loadConfig";

export function listStagedFiles(): string[] {
	return execSync("git diff --cached --name-only --relative", {
		cwd: getProjectRoot(),
		encoding: "utf8",
	})
		.split("\n")
		.filter(Boolean);
}
