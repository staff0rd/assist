import { execSync } from "node:child_process";
import type { GhStatusPullRequest } from "./types";

const FIELDS =
	"number,title,url,author,isDraft,createdAt,updatedAt,reviewDecision,latestReviews,statusCheckRollup,mergeable";

export function fetchRepoPullRequests(
	org: string,
	repo: string,
): GhStatusPullRequest[] {
	const output = execSync(
		`gh pr list --state open --json ${FIELDS} --limit 100 -R ${org}/${repo}`,
		{ encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
	);

	const parsed = JSON.parse(output);
	if (!Array.isArray(parsed)) {
		throw new Error("unexpected response from gh pr list");
	}
	return parsed as GhStatusPullRequest[];
}
