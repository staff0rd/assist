import { execSync } from "node:child_process";
import { shellQuote } from "../../shared/shellQuote";

export function commitStaged(message: string): string {
	execSync(`git commit -m ${shellQuote(message)}`, { stdio: "inherit" });
	return execSync("git rev-parse --short=7 HEAD", {
		encoding: "utf8",
	}).trim();
}

export function stageAndCommit(files: string[], message: string): string {
	const escaped = files.map(shellQuote).join(" ");
	execSync(`git add ${escaped}`, { stdio: "inherit" });
	return commitStaged(message);
}
