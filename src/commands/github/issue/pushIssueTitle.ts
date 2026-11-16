import { execFileSync } from "node:child_process";

export function pushIssueTitle(
	number: number,
	repo: string | undefined,
	title: string,
): void {
	const repoArgs = repo ? ["--repo", repo] : [];
	try {
		execFileSync(
			"gh",
			["issue", "edit", String(number), "--title", title, ...repoArgs],
			{ stdio: "inherit" },
		);
	} catch {
		process.exit(1);
	}
}
