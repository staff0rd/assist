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
		execFileSync("gh", args, {
			stdio: ["ignore", "ignore", "pipe"],
			encoding: "utf8",
		});
	} catch (error) {
		const stderr = (error as { stderr?: unknown }).stderr;
		throw new Error(
			typeof stderr === "string" && stderr.trim()
				? stderr.trim()
				: `Could not assign ${repo}#${number} to you`,
		);
	}
}
