const REPO_ARGUMENT = /^([A-Za-z0-9._-]+)\/([A-Za-z0-9._-]+)$/;

export function parseRepoArgument(
	value: string,
): { org: string; repo: string } | null {
	const match = REPO_ARGUMENT.exec(value.trim());
	if (!match) return null;
	return { org: match[1], repo: match[2] };
}
