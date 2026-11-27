import { execFileSync } from "node:child_process";

export function postIssueComment(endpoint: string, body: string): string {
	const created = JSON.parse(
		execFileSync("gh", ["api", "-X", "POST", endpoint, "-f", `body=${body}`], {
			encoding: "utf8",
		}),
	) as { html_url: string };
	return created.html_url;
}
