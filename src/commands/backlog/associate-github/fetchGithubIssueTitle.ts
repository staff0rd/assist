import { execFileSync } from "node:child_process";

export function fetchGithubIssueTitle(issue: string): string | undefined {
	const match = /^([^/]+)\/([^#]+)#(\d+)$/.exec(issue);
	if (!match) return undefined;
	const [, owner, repo, number] = match;
	try {
		const result = execFileSync(
			"gh",
			["issue", "view", number, "-R", `${owner}/${repo}`, "--json", "title"],
			{ encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
		);
		const parsed = JSON.parse(result) as { title?: string };
		return parsed.title;
	} catch {
		return undefined;
	}
}
