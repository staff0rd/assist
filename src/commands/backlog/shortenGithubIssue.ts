const SHORTHAND = /^([^/\s]+)\/([^/\s]+)#(\d+)$/;

export function shortenGithubIssue(
	githubIssue: string,
	origin?: string,
): string {
	const match = SHORTHAND.exec(githubIssue);
	if (!match || !origin) return githubIssue;
	const [, owner, repo, number] = match;
	if (`github.com/${owner}/${repo}`.toLowerCase() === origin.toLowerCase()) {
		return `#${number}`;
	}
	return githubIssue;
}
