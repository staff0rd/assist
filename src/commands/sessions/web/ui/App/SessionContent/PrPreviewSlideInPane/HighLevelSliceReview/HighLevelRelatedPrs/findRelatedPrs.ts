type RelatedPr = {
	reference: string;
	url: string;
	line: string;
};

const PR_REFERENCE_PATTERN =
	/(?:https?:\/\/)?(?:www\.)?github\.com\/([\w.-]+)\/([\w.-]+)\/pull\/(\d+)|(?<![\w./-])([\w.-]+)\/([\w.-]+)#(\d+)\b/g;

export function findRelatedPrs(
	body: string,
	repo: string,
	prNumber: number,
): RelatedPr[] {
	const self = `${repo}#${prNumber}`.toLowerCase();
	const seen = new Set<string>([self]);
	const related: RelatedPr[] = [];
	for (const rawLine of body.split(/\r?\n/)) {
		const line = rawLine.trim();
		for (const match of line.matchAll(PR_REFERENCE_PATTERN)) {
			const owner = match[1] ?? match[4];
			const name = match[2] ?? match[5];
			const number = Number(match[3] ?? match[6]);
			const reference = `${owner}/${name}#${number}`;
			const key = reference.toLowerCase();
			if (seen.has(key)) continue;
			seen.add(key);
			related.push({
				reference,
				url: `https://github.com/${owner}/${name}/pull/${number}`,
				line,
			});
		}
	}
	return related;
}
