const ISSUE_URL_PATTERN =
	/https?:\/\/github\.com\/[\w.-]+\/[\w.-]+\/issues\/\d+/;
const CROSS_REPO_PATTERN = /\b[\w.-]+\/[\w.-]+#\d+/;
const SAME_REPO_PATTERN = /(?<![\w/#-])#\d+\b/;

export function findIssueReference(body: string): string | null {
	for (const pattern of [
		ISSUE_URL_PATTERN,
		CROSS_REPO_PATTERN,
		SAME_REPO_PATTERN,
	]) {
		const match = body.match(pattern);
		if (match) return match[0];
	}
	return null;
}
