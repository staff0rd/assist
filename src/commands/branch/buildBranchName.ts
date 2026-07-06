export function buildBranchName({
	prefix,
	jira,
	slug,
}: {
	prefix?: string;
	jira?: string;
	slug: string;
}): string {
	const segments: string[] = [];
	if (prefix) segments.push(`${prefix}/`);
	if (jira) segments.push(`${jira}-`);
	segments.push(slug);
	return segments.join("");
}
