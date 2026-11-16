import { execFileSync, execSync } from "node:child_process";

export function commitStaged(message: string): string {
	execFileSync("git", ["commit", "-m", message], { stdio: "inherit" });
	return execSync("git rev-parse --short=7 HEAD", {
		encoding: "utf8",
	}).trim();
}
