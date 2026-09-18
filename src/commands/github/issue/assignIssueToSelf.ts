import { execFileSync } from "node:child_process";

export function assignIssueToSelf(number: number, repo: string): void {
	const args = [
		"issue",
		"edit",
		String(number),
		"--repo",
		repo,
		"--add-assignee",
		"@me",
	];
	try {
		execFileSync("gh", args, { stdio: ["ignore", "ignore", "inherit"] });
	} catch {
		process.exit(1);
	}
}
