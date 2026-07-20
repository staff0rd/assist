const URL_PATTERN =
	/^https?:\/\/github\.com\/([^/\s]+)\/([^/\s]+)\/issues\/(\d+)\/?$/;
const SHORTHAND_PATTERN = /^([^/\s]+)\/([^/\s#]+)#(\d+)$/;

export function normalizeGithubIssue(input: string): string | null {
	const trimmed = input.trim();
	const match = URL_PATTERN.exec(trimmed) ?? SHORTHAND_PATTERN.exec(trimmed);
	if (!match) return null;
	const [, owner, repo, number] = match;
	return `${owner}/${repo}#${number}`;
}
