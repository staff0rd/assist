import { execSync } from "node:child_process";

type ReviewThread = { isResolved: boolean };

const THREAD_QUERY = `query($owner: String!, $repo: String!, $prNumber: Int!) { repository(owner: $owner, name: $repo) { pullRequest(number: $prNumber) { reviewThreads(first: 100) { nodes { isResolved } } } } }`;

export function fetchReviewThreads(
	org: string,
	repo: string,
	prNumber: number,
): ReviewThread[] {
	const output = execSync(
		`gh api graphql -f query='${THREAD_QUERY}' -F owner=${org} -F repo=${repo} -F prNumber=${prNumber}`,
		{ encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
	);

	const nodes =
		JSON.parse(output)?.data?.repository?.pullRequest?.reviewThreads?.nodes;
	if (!Array.isArray(nodes)) {
		throw new Error("unexpected response from gh api graphql");
	}
	return nodes as ReviewThread[];
}
