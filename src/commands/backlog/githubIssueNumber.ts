const SHORTHAND = /^[^/\s]+\/[^/\s]+#(\d+)$/;

export function githubIssueNumber(githubIssue: string): string {
	const match = SHORTHAND.exec(githubIssue);
	return match ? `#${match[1]}` : githubIssue;
}
