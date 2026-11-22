import { execFileSync, execSync } from "node:child_process";

export function commitStaged(message: string | null): string {
	const args =
		message === null ? ["commit", "--no-edit"] : ["commit", "-m", message];
	execFileSync("git", args, { stdio: "inherit" });
	return execSync("git rev-parse --short=7 HEAD", {
		encoding: "utf8",
	}).trim();
}
